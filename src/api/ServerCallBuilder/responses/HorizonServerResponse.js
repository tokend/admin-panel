import config from '@/config'
import { ServerResponse } from './ServerResponse'
import { ServerCallBuilder } from '../ServerCallBuilder'
import deepCamelCase from 'camelcase-keys-deep'
import get from 'lodash/get'

export class HorizonServerResponse extends ServerResponse {
  constructor (response) {
    super(response)

    if (this.body) {
      let data =
        get(this, 'body._embedded.records') ||
        get(this, 'body._embedded') ||
        get(this, 'body')

      if (get(data, 'details')) {
        data = this._flattenDetails(data)
      } else if (get(data, '[0].details')) {
        data = data.map(this._flattenDetails)
      }

      this._data = deepCamelCase(data)
      this._links = get(this, 'body._links')
    } else if (this.status === 204) {
      this._data = null
    } else {
      throw new Error('HorizonServerResponse: Unknown response format')
    }
  }

  _flattenDetails (object) {
    const result = {}

    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key]

        if (key !== 'details') {
          result[key] = element
        } else {
          const requestDetails = Object.assign({}, element[element.request_type])
          delete element[element.request_type]

          Object.assign(result, element, requestDetails)
        }
      }
    }

    return result
  }

  /**
   * Returns true if the class can parse the provided object
   * @param {Object} response Raw error object
   * @returns {boolean}
   */
  static isLike (response = {}) {
    const body = response.body || {}

    if (body._embedded || body._links || body.details) {
      return true
    }

    return false
  }

  // pagination

  _fetchPage (link) {
    const corsPrefix = '/_/api'
    let length = config.HORIZON_SERVER.indexOf(corsPrefix) === -1
      ? config.HORIZON_SERVER.length
      : config.HORIZON_SERVER.length - corsPrefix.length
    if (link.match('http') && !link.match('https')) {
      length -= 1
    }
    const prefix = link.slice(length)

    return new ServerCallBuilder()
      .overridePrefix(prefix)
      .sign()
      .get()
  }

  next () {
    const nextLink = (this._links || {}).next

    if (!nextLink) {
      throw new Error('ApiResponse: model has no next page')
    }

    return this._fetchPage((nextLink || {}).href)
  }

  prev () {
    const prevLink = (this._links || {}).prev

    if (!prevLink) {
      throw new Error('ApiResponse: model has no previous page')
    }

    return this._fetchPage((prevLink || {}).href)
  }

  async concatNext () {
    const newResponse = await this.next()
    newResponse._data = this._data.concat(newResponse._data)
    return newResponse
  }
}
