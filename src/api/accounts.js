import config from '../config'

import { Sdk } from '@/sdk'

export default {

  manageSigner (params) {
    const signer = {
      pubKey: params.accountId.trim(),
      weight: +params.weight,
      signerType: +params.signerType,
      identity: +params.signerIdentity
    }
    if (params.name) signer.name = params.name

    const operation = Sdk.base.SetOptionsBuilder.setOptions({
      signer,
      source: config.MASTER_ACCOUNT
    })

    return Sdk.horizon.transactions.submitOperations(operation)
  },

  manageMaster (weight) {
    const operation = Sdk.base.SetOptionsBuilder.setOptions({
      source: config.MASTER_ACCOUNT,
      masterWeight: Number(weight)
    })

    return Sdk.horizon.transactions.submitOperations(operation)
  },

  setThresholds (opts) {
    const operation = Sdk.base.SetOptionsBuilder.setOptions({
      lowThreshold: opts.lowThreshold,
      medThreshold: opts.medThreshold,
      highThreshold: opts.highThreshold
    })

    return Sdk.horizon.transactions.submitOperations(operation)
  }
}
