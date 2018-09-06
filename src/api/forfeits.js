import { Operation } from 'tokend-js-sdk'

import config from '../config'
import server from '../utils/server'
import store from '../store'

export default {
  getForfeits (state) {
    const request = server.sdkServer.forfeitRequests().limit(store.getters.pageLimit)

    if (!state) {
      return request.callWithSignature(store.getters.keypair)
    } else {
      return request.forState(state).callWithSignature(store.getters.keypair)
    }
  },

  getForfeitById (id) {
    return server.sdkServer.forfeitRequests()
      .forfeitRequest(id)
      .callWithSignature(store.getters.keypair)
  },

  getForfeitByPaymentId (id) {
    return server.get(`/payment_requests/${id}?by_payment_id=true`, true)
  },

  manageForfeitRequest (opts) {
    opts.source = config.COMMISSION_ACCOUNT
    const operation = Operation.manageForfeitRequest(opts)
    return server.submitOperation(operation, true)
  },

  reviewForfeitRequest (opts) {
    opts.source = config.MASTER_ACCOUNT
    const operation = Operation.reviewPaymentRequest(opts)
    return server.submitOperation(operation, true)
  }
}
