import { Operation } from 'tokend-js-sdk'
import server from '../utils/server'
import store from '../store'
import { xdrTypeFromValue } from '@/utils/xdrTypeFromValue'
import { FEE_TYPES } from '@/constants'
import { Sdk } from '@/sdk'

export default {
  getFees (filter = {}) {
    let path = '/fees'
    if (filter.accountId || filter.address) {
      path = '/fees?account_id=' + (filter.accountId || filter.address)
    }
    if (filter.accountType) {
      path = '/fees?account_type=' + filter.accountType
    }
    return server.get(path, true)
  },

  getFeesOverview () {
    return server.sdkServer.feesOverview()
      .callWithSignature(store.getters.keypair)
  },

  updateFees (fees, params = {}) {
    const opts = {
      fee: {
        feeType: xdrTypeFromValue('FeeType', +fees.fee_type),
        subtype: '' + fees.subtype || '0',
        asset: String(fees.asset),
        fixedFee: String(fees.fixed),
        percentFee: String(fees.percent),
        accountId: params.accountId || params.address,
        accountType: Number(params.accountType),
        lowerBound: String(fees.lower_bound),
        upperBound: String(fees.upper_bound)
      },
      isDelete: fees.isDelete
    }

    if (+fees.fee_type === FEE_TYPES.paymentFee) {
      opts.fee.feeAsset = fees.feeAsset || fees.fee_asset
    }

    const operation = Sdk.base.Operation.setFees(opts)

    return Sdk.horizon.transactions.submitOperations(operation)
  },

  updatePeriods (params) {
    const operation = Operation.setFees({}, params.storageFeePeriod, params.payoutsPeriod)
    return server.submitOperation(operation, true)
  }
}
