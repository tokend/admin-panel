import { ServerCallBuilder } from './ServerCallBuilder'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('trades')
  .registerResource('order_book', 'orderBook')

export const orderBooks = {
  /**
   * Get bids (buy requests) of an order book
   * @param {Object} params
   * @param {string} params.baseAsset
   * @param {string} params.quoteAsset
   * @param {number|string} params.bookId
   * @returns {Promise}
   */
  getBids ({ baseAsset, quoteAsset, bookId = 0 }) {
    if (!(baseAsset && quoteAsset)) {
      throw new Error('orderBooks.getBids: Invalid param set')
    }

    const params = {
      order_book_id: bookId,
      base_asset: baseAsset,
      quote_asset: quoteAsset,
      is_buy: true
    }

    return new ScopedServerCallBuilder()
      .orderBook()
      .sign()
      .get(params)
  },

  /**
   * Get asks (sell requests) of an order book
   * @param {Object} params
   * @param {string} params.baseAsset
   * @param {string} params.quoteAsset
   * @param {number|string} params.bookId
   * @returns {Promise}
   */
  getAsks ({ baseAsset, quoteAsset, bookId = 0 }) {
    if (!(baseAsset && quoteAsset)) {
      throw new Error('orderBooks.getAsks: Invalid param set')
    }

    const params = {
      order_book_id: bookId,
      base_asset: baseAsset,
      quote_asset: quoteAsset,
      is_buy: false
    }

    return new ScopedServerCallBuilder()
      .orderBook()
      .sign()
      .get(params)
  },

  /**
   * Get trade history of the book
   * @param {Object} params
   * @param {string} params.baseAsset
   * @param {string} params.quoteAsset
   * @param {number|string} params.bookId
   * @returns {Promise}
   */
  getHistory ({ baseAsset, quoteAsset, bookId = 0 }) {
    if (!(baseAsset && quoteAsset)) {
      throw new Error('orderBooks.getAsks: Invalid param set')
    }

    const params = {
      order_book_id: bookId,
      base_asset: baseAsset,
      quote_asset: quoteAsset
    }

    return new ScopedServerCallBuilder()
      .trades()
      .sign()
      .get(params)
  }
}
