import { CreateIssuanceRequestBuilder, PreIssuanceRequestOpBuilder, ReviewRequestBuilder } from 'tokend-js-sdk'
import { envelopOperations } from './helpers/envelopOperations'
import { ServerCallBuilder } from './ServerCallBuilder'

import params from '../config'
import store from '../store'
import server from '../utils/server'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('transactions')

export default {
  getAvailableEmissions () {
    const prefix = '/coins_amount_info'

    return server.get(prefix, true)
      .then(response => {
        return { ok: true, coinsAmountInfo: response }
      }).catch(errResp => {
        return { ok: false, coinsAmountInfo: {}}
      })
  },

  getEmissionRequests (asset = '') {
    if (asset === 'All') {
      asset = ''
    }

    return server.sdkServer.reviewableRequests()
      .forAsset(asset)
      .order('desc')
      .forReviewer(params.MASTER_ACCOUNT)
      .limit(store.getters.pageLimit)
      .callWithSignature(store.getters.keypair)
      .then(response => Promise.resolve(response.records))
  },

  checkPreEmission (serialNumber) {
    const prefix = `/check_pre_emission/${serialNumber}`

    return server.get(prefix, true)
      .then(response => {
        return true
      }).catch(errResp => {
        return false
      })
  },

  uploadPreEmissions (preIssuances) {
    return Promise.all(preIssuances.map(function (item) {
      const op = PreIssuanceRequestOpBuilder.createPreIssuanceRequestOp({
        request: item
      })
      return server.submitOperation(op, true)
    }))
  },

  reviewRequest (opts) {
    opts.source = params.MASTER_ACCOUNT
    const operation = ReviewRequestBuilder.reviewRequest(opts)
    return server.submitOperation(operation, true)
  },

  manualEmission (data) {
    const tx = envelopOperations(
      CreateIssuanceRequestBuilder.createIssuanceRequest({
        asset: data.asset,
        amount: data.amount,
        receiver: data.receiver,
        reference: data.reference,
        source: params.MASTER_ACCOUNT,
        externalDetails: {},
        allTasks: data.allTasks || 0
      })
    )
    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  }
}
