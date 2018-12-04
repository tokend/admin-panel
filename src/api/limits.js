import { Operation, ManageLimitsBuilder, xdr } from 'tokend-js-sdk'

import params from '../config'
import store from '../store'
import server from '../utils/server'
import { clearObject } from '@/utils/clearObject'
import { ServerCallBuilder } from './ServerCallBuilder'
import { envelopOperations } from './helpers/envelopOperations'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('limits')
  .registerResource('transactions')

export default {
  getAll (filters) {
    return new ScopedServerCallBuilder()
      .limits()
      .sign()
      .get(clearObject({
        account_id: filters.address,
        account_type: filters.accountType,
        stats_op_type: filters.statsOpType,
        asset: filters.asset,
        email: filters.email
      }))
  },

  update (params) {
    const tx = envelopOperations(
      ManageLimitsBuilder.createLimits(params)
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .post({ tx })
  },

  // legacy
  getLimits () {
    return server.sdkServer.defaultLimits()
      .limits(xdr.AccountType.general().value)
      .callWithSignature(store.getters.keypair)
  },

  updateLimits (limits) {
    const operation = {
      accountType: xdr.AccountType.general().value,
      limits: limits,
      source: params.MASTER_ACCOUNT
    }
    const op = Operation.setLimits(operation)
    return server.submitOperation(op, true)
  }
}
