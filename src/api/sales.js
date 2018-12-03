import config from '@/config'
import { clearObject } from '@/utils/clearObject'
import { Sdk } from '@/sdk'

export const sales = {
  /**
   * Fetch sale list
   * @param {Object} filters
   * @param {string} [filters.baseAsset] Asset code, e.g: "USD"
   * @param {string} [filters.owner] Owner’s address, e.g: GDRYPVZ63SR7V2G46GKRGABJD3XPDNWQ4B4PQPJBTTDUEAKH5ZECPTSN
   * @param {boolean} [filters.openOnly]
   * @param {string} [filters.name] Sale’s name (substring, insensitive)
   * @param {string} [filters.order=desc] Order. Accepts: asc, desc
   * @param {number|string} [filters.limit] Page limit. Default value is config.PAGE_LIMIT
   * @returns {Promise}
   */
  getAll (filters) {
    const params = clearObject({
      base_asset: filters.baseAsset,
      owner: filters.owner,
      open_only: filters.openOnly,
      name: filters.name,
      order: filters.order || 'desc',
      limit: filters.limit || config.PAGE_LIMIT
    })
    return Sdk.horizon.sales.getPage(params)
  },

  /**
   * Get sale by id
   * @param {string|number} id
   */
  get (id) {
    return Sdk.horizon.sales.get(id)
  },

  /**
   * Get participants of sale
   * @param {Object} params
   * @param {string|number} params.saleId
   * @param {string} params.baseAsset
   * @param {string} params.quoteAsset
   * @returns {Promise}
   */
  getParticipants ({ saleId, baseAsset, quoteAsset }) {
    if (!(saleId && baseAsset && quoteAsset)) {
      throw new Error('sales.getParticipants: Invalid param set')
    }

    const params = {
      order_book_id: saleId,
      base_asset: baseAsset,
      quote_asset: quoteAsset,
      is_buy: true
    }
    return Sdk.horizon.orderBook.getAll(params)
  }
}
