import { Operation, xdr } from 'tokend-js-sdk'

import store from '../store'
import config from '../config'
import server from '../utils/server'

export default {
  getExchanges () {
    return server.sdkServer.exchanges()
      .limit(store.getters.pageLimit)
      .callWithSignature(store.getters.keypair)
  },

  addExchange (params) {
    const opts = {
      destination: params.exchangeId,
      startingBalance: '0',
      accountType: 5,
      name: params.name,
      source: config.MASTER_ACCOUNT,
      action: xdr.CreateExchangeAction.exchangeCreate(),
      requireReview: params.requireReview
    }
    const operation = Operation.createAccount(opts)

    return server.submitOperation(operation, true)
  },

  manageExchange (params) {
    const opts = {
      destination: params.exchangeId,
      accountType: 5,
      name: params.name,
      source: config.MASTER_ACCOUNT,
      action: xdr.CreateExchangeAction.exchangeUpdatePolicy(),
      requireReview: false,
      policies: {
        policies: params.policies,
        asset: params.asset
      }
    }
    const operation = Operation.createAccount(opts)

    return server.submitOperation(operation, true)
  }
}
