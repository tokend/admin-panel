import config from '../config'
import server from '../utils/server'
import store from '../store'

import { Sdk } from '@/sdk'

export default {
  get (address) {
    return Sdk.horizon.account.get(address)
  },

  operationsOf (id) {
    return {
      getAllByType (type) {
        return Sdk.horizon.account.getOperations(id, {
          order: 'desc',
          operation_type: type
        })
      }
    }
  },

  getLimits (address) {
    return Sdk.horizon.account.getLimits(address)
  },

  // legacy

  loadAccount (accountId) {
    return server.sdkServer.loadAccountWithSign(accountId, store.getters.keypair)
  },

  getAccountById (accountId) {
    return server.sdkServer.accounts()
      .accountId(accountId)
      .callWithSignature(store.getters.keypair)
  },

  getSignerById (id) {
    return server.sdkServer.accounts()
      .signer(config.MASTER_ACCOUNT, id)
      .call()
      .then((result) => {
        return {
          signer: result,
          isSigner: true
        }
      }).catch((err) => {
        console.error(err)
        return {
          isSigner: false
        }
      })
  },

  manageAccount (params) {
    const operation = Sdk.base.Operation.manageAccount({
      block: params.isBlock,
      accountType: params.accountType,
      account: params.account,
      source: config.MASTER_ACCOUNT,
      [params.isBlock ? 'blockReasonsToAdd' : 'blockReasonsToRemove']: params.blockReasons
    })
    return Sdk.horizon.transactions.submitOperations(operation)
  },

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
