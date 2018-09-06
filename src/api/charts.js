import { ServerCallBuilder } from './ServerCallBuilder'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('charts')

export const charts = {
  /**
   * Get price history of the pair
   * @param {Object} params
   * @param {string} params.baseAsset
   * @param {string} params.quoteAsset
   * @returns {Promise}
   */
  getPriceHistory ({ baseAsset, quoteAsset }) {
    if (!(baseAsset && quoteAsset)) {
      throw new Error('charts.getPriceHistory: Invalid param set')
    }

    const id = `${baseAsset}-${quoteAsset}`

    return new ScopedServerCallBuilder()
      .charts(id)
      .get()
  }
}
