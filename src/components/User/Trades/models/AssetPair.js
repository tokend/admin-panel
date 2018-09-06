const UNKNOWN_SOURCE_TYPE_ERROR = 'AssetPair: unknown source format'

export class AssetPair {
  constructor (source) {
    this._base = null
    this._quote = null

    if (typeof source === 'object' && source !== null) {
      this._parseObject(source)
    } else if (typeof source === 'string') {
      this._parseString(source)
    } else {
      throw new Error(UNKNOWN_SOURCE_TYPE_ERROR)
    }
  }

  _parseObject (obj) {
    const base = obj.base || obj.baseAsset
    const quote = obj.quote || obj.quoteAsset

    if (!base || !quote) throw new Error(UNKNOWN_SOURCE_TYPE_ERROR)

    this._base = base
    this._quote = quote
  }

  _parseString (str) {
    try {
      const [, base, quote] = str.match(/^([A-Za-z0-9]+)\/([A-Za-z0-9]+)$/)

      this._base = base
      this._quote = quote
    } catch (error) {
      throw new Error(UNKNOWN_SOURCE_TYPE_ERROR)
    }
  }

  get base () {
    return this._base
  }

  get quote () {
    return this._quote
  }

  toString () {
    return `${this._base}/${this._quote}`
  }

  toObject () {
    return { base: this._base, quote: this._quote }
  }
}
