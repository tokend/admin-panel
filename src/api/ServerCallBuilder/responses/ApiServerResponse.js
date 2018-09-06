import Jsona from 'jsona'
import { ServerResponse } from './ServerResponse'
import { ServerCallBuilder } from '../ServerCallBuilder'
import deepCamelCase from 'camelcase-keys-deep'

const jsonApiFormatter = new Jsona()

export class ApiServerResponse extends ServerResponse {
  constructor (response) {
    super(response)

    if (this.body) {
      let parsed
      try {
        parsed = JSON.parse(this.body)
      } catch (err) {
        parsed = this.body
      }

      this._links = (parsed || {}).links
      this._data = deepCamelCase(jsonApiFormatter.deserialize(parsed))
    } else if (this.status === 204) {
      this._data = null
    } else {
      throw new Error('ApiServerResponse: Unknown response format')
    }
  }

  /**
   * Returns true if the class can parse the provided object
   * @param {Object} response Raw error object
   * @returns {boolean}
   */
  static isLike (response = {}) {
    const body = response.body || {}

    if (body.data) {
      return true
    }

    return false
  }

  // pagination

  _fetchPage (link) {
    return new ServerCallBuilder()
      .overridePrefix(link)
      .sign()
      .get()
  }

  next () {
    const nextLink = (this._links || {}).next

    if (!nextLink) {
      throw new Error('ApiResponse: model has no next page')
    }

    return this._fetchPage(nextLink)
  }

  prev () {
    const prevLink = (this._links || {}).prev

    if (!prevLink) {
      throw new Error('ApiResponse: model has no previous page')
    }

    return this._fetchPage(prevLink)
  }

  async concatNext () {
    const newResponse = await this.next()
    newResponse._data = this._data.concat(newResponse._data)
    return newResponse
  }
}
