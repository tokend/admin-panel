import { ServerError } from './ServerError'

export class HorizonServerError extends ServerError {
  constructor (error) {
    super(error)
    this._parse()
  }

  get parsedEnvelope () { return this._parsedEnvelope || {} }
  get parsedResult () { return this._parsedResult || {} }
  get resultCodes () { return this._resultCodes || {} }

  /**
   * Returns true if the class can parse the provided object
   * @param {Object} error Raw error object
   * @returns {boolean}
   */
  static isLike (error = {}) {
    const body = error.body || {}

    if (body.type && body.title && body.status) {
      return true
    }

    return false
  }

  _parse () {
    const details = this.details || {}
    const extras = details.extras

    if (extras && typeof extras === 'object') {
      this._parsedEnvelope = extras.parsedEnvelope
      this._parsedResult = extras.parsedResult
      this._resultCodes = extras.resultCodes

      if (this.resultCodes.messages && this._resultCodes.messages[0]) {
        this.setMessage(this._resultCodes.messages[0])
      }
    }
  }
}
