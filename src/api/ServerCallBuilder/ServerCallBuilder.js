import Vue from 'vue'
import store from '@/store'
import config from '@/config'
import { hash } from 'tokend-js-sdk'
import {
  HorizonServerError,
  ServerError
} from './errors'
import {
  ApiServerResponse,
  HorizonServerResponse,
  ServerResponse
} from './responses'

function encodeUri (str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16))
}

function getSignedHeaders (prefix, keypair) {
  if (!keypair) throw new Error('Need keypair')

  const validUntil = String(Math.floor((new Date().getTime() / 1000) + 60))
  const signatureBase = `{ uri: '${prefix}', valid_untill: '${validUntil}'}`
  const signature = keypair.signDecorated(hash(signatureBase))
  return {
    'X-AuthValidUnTillTimestamp': validUntil,
    'X-AuthPublicKey': keypair.accountId(),
    'X-AuthSignature': signature.toXDR('base64')
  }
}

export class ServerCallBuilder {
  constructor () {
    this._http = Vue.http

    // query components
    this._origin = `${config.HORIZON_SERVER}`
    this._method = ''
    this._path = ''
    this._params = {}
    this._payload = {}
    this._config = {
      headers: {},
      timeout: 20000
    }

    // sign parameters
    this._keypair = null

    // forced prefix (overrides _path and _params)
    this._forcedPrefix = null
  }

  get _query () {
    const params = this._params
    const keys = Object.keys(params).sort()
    return keys.length
      ? `?${keys.map(key => key + '=' + encodeUri(params[key])).join('&')}`
      : ''
  }

  get _prefix () {
    return this._forcedPrefix || `${this._path}${this._query}`
  }

  get _href () {
    return `${this._origin}${this._prefix}`
  }

  _append (chunk) {
    this._path += '/' + chunk
  }

  _sign () {
    Object.assign(
      this._config.headers,
      getSignedHeaders(this._prefix, this._keypair)
    )
  }

  _parseResponse (response) {
    if (ApiServerResponse.isLike(response)) {
      return new ApiServerResponse(response)
    } else if (HorizonServerResponse.isLike(response)) {
      return new HorizonServerResponse(response)
    } else {
      return new ServerResponse(response)
    }
  }

  _parseError (error) {
    if (HorizonServerError.isLike(error)) {
      return new HorizonServerError(error)
    } else {
      return new ServerError(error)
    }
  }

  async _call () {
    if (this._keypair) this._sign()

    let args
    if (this._method === 'get' || this._method === 'delete') {
      args = [this._href, this._config]
    } else {
      args = [this._href, JSON.stringify(this._payload), this._config]
    }

    try {
      return this._parseResponse(
        await this._http[this._method.toLowerCase()](...args)
      )
    } catch (error) {
      throw this._parseError(error)
    }
  }

  static makeScope () {
    class ScopedServerCallBuilder extends this { };
    return ScopedServerCallBuilder
  }

  static registerResource (resource, alias) {
    this.prototype[alias || resource] = function (id) {
      this._append(resource)
      if (id) this._append(id)
      return this
    }
    return this
  }

  overridePrefix (prefix) {
    this._forcedPrefix = prefix
    return this
  }

  sign (keypair) {
    this._keypair = keypair || store.getters.keypair
    return this
  }

  id (...args) {
    this._append(...args)
    return this
  }

  get (params = {}) {
    this._method = 'get'
    this._params = params
    return this._call()
  }

  post (payload = {}) {
    this._method = 'post'
    this._payload = payload
    return this._call()
  }

  put (payload = {}) {
    this._method = 'put'
    this._payload = payload
    return this._call()
  }

  patch (payload = {}) {
    this._method = 'patch'
    this._payload = payload
    return this._call()
  }

  delete (params = {}) {
    this._method = 'delete'
    this._params = params
    return this._call()
  }
}
