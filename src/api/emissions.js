import { PreIssuanceRequestOpBuilder, ReviewRequestBuilder } from 'tokend-js-sdk'
import { Sdk } from '@/sdk'

import params from '../config'
import server from '../utils/server'

export default {
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
    const operation = Sdk.base.CreateIssuanceRequestBuilder.createIssuanceRequest({
      asset: data.asset,
      amount: data.amount,
      receiver: data.receiver,
      reference: data.reference,
      source: params.MASTER_ACCOUNT,
      externalDetails: {},
      allTasks: data.allTasks || 0
    })
    return Sdk.horizon.transactions.submitOperations(operation)
  }
}
