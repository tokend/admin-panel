import { SetOptionsBuilder, Operation } from 'tokend-js-sdk'

import config from '../config'
import server from '../utils/server'
import store from '../store'
import { ServerCallBuilder } from './ServerCallBuilder'
import { envelopOperations } from './helpers/envelopOperations'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('accounts')
  .registerResource('transactions')
  .registerResource('operations')
  .registerResource('limits')

export default {
  get (address) {
    return new ScopedServerCallBuilder()
      .accounts(address)
      .sign()
      .get()
  },

  operationsOf (id) {
    return {
      _owner: id,
      _blank: new ScopedServerCallBuilder().accounts(id).operations(),
      /**
       * Get operations by type
       * @param {string} type
       * @returns {Promise} A Promise with the response
       */
      getAllByType (type) {
        return this._blank
          .sign()
          .get({
            order: 'desc',
            operation_type: type
          })
      }
    }
  },

  getLimits (address) {
    return new ScopedServerCallBuilder()
      .accounts(address)
      .limits()
      .sign()
      .get()
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
    const tx = envelopOperations(
      Operation.manageAccount({
        block: params.isBlock,
        accountType: params.accountType,
        account: params.account,
        source: config.MASTER_ACCOUNT,
        [params.isBlock ? 'blockReasonsToAdd' : 'blockReasonsToRemove']: params.blockReasons
      })
    )
    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  manageSigner (params) {
    const signer = {
      pubKey: params.accountId.trim(),
      weight: +params.weight,
      signerType: +params.signerType,
      identity: +params.signerIdentity
    }
    if (params.name) signer.name = params.name

    const tx = envelopOperations(
      SetOptionsBuilder.setOptions({
        signer,
        source: config.MASTER_ACCOUNT
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  manageMaster (weight) {
    const tx = envelopOperations(
      SetOptionsBuilder.setOptions({
        source: config.MASTER_ACCOUNT,
        masterWeight: Number(weight)
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  setThresholds (opts) {
    const tx = envelopOperations(
      SetOptionsBuilder.setOptions({
        lowThreshold: opts.lowThreshold,
        medThreshold: opts.medThreshold,
        highThreshold: opts.highThreshold
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  getReferrals (accountId) {
    return server.sdkServer.accounts()
      .referrals(accountId)
      .limit(2)
      .callWithSignature(store.getters.keypair)
  }
}
