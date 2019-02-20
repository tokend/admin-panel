import axios from 'axios'
import { TokenD, KeyServerCallBuilder, Wallet } from '@tokend/js-sdk'

import store from '../store'
import config from '../config'

const sdkServer = () => {
  const sdkInstance = new TokenD(config.KEY_SERVER_ADMIN, {
    allowHttp: true,
    legacySignatures: true
  }) // true for use http, only localhost
  return new KeyServerCallBuilder(axios.create({
    baseURL: config.KEY_SERVER_ADMIN
  }), sdkInstance)
}

const get = (path, data = null, isSigned) => {
  console.log('get')
  if (isSigned) {
    const wallet = new Wallet(
      '',
      store.getters.GET_USER.keys.seed,
      store.getters.GET_USER.keys.accountId
    )
    return sdkServer()
      .appendUrlSegment(path)
      .withSignature(wallet)
      .get(data)
      .then(r => {
        return r.data
      }).catch(err => {
        return Promise.reject(err)
      })
  } else {
    return sdkServer()
      .appendUrlSegment(path)
      .get(data)
      .then(r => {
        return r.data
      }).catch(err => {
        return Promise.reject(err)
      })
  }
}

const patch = (path, data = {}) => {
  const wallet = new Wallet(
    '',
    store.getters.GET_USER.keys.seed,
    store.getters.GET_USER.keys.accountId
  )
  return sdkServer()
    .appendUrlSegment(path)
    .withSignature(wallet)
    .patch(data)
    .then(r => {
      console.log(r)
      return r.data
    }).catch(err => {
      return Promise.reject(err)
    })
}

const post = (path, data = {}) => {
  const wallet = new Wallet(
    '',
    store.getters.GET_USER.keys.seed,
    store.getters.GET_USER.keys.accountId
  )
  return sdkServer()
    .appendUrlSegment(path)
    .withSignature(wallet)
    .post(data)
    .then(r => {
      return r.data
    }).catch(err => {
      return Promise.reject(err)
    })
}

export default {
  sdkServer: sdkServer(),
  get,
  patch,
  post
}
