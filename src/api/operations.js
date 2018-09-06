import { Operation } from 'tokend-js-sdk'
import server from '../utils/server'
import store from '../store'

export default {
  createPaymentOperation (details, sourceAccountId) {
    const operation = Operation.payment(details)
    const sourceID = sourceAccountId
    const kp = store.getters.keypair
    const isPending = true
    return server.sdkServer.submitOperation(operation, sourceID, kp, isPending)
  },

  createRedeemOperation (details, sourceAccountId) {
    const operation = Operation.manageForfeitRequest(details)
    const sourceID = sourceAccountId
    const kp = store.getters.keypair
    const isPending = true
    return server.sdkServer.submitOperation(operation, sourceID, kp, isPending)
  },

  getRedemptionStructure (accountId, amount, asset) {
    return server.sdkServer.fees()
      .forfeitRequest(accountId, amount, asset)
      .callWithSignature(store.getters.keypair)
  }
}
