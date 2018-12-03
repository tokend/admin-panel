import { Sdk } from '@/sdk'

import { Operation, xdr } from 'tokend-js-sdk'

import config from '../config'
import server from '../utils/server'
import store from '../store'

export default {
  getAll () {
    Sdk.horizon.assets.getAll()
  },

  getAllSystemAssets () {
    return Sdk.horizon.assets.getAll({ owner: config.MASTER_ACCOUNT })
  },

  get (code) {
    return Sdk.horizon.assets.get(code)
  },

  getPairs () {
    return Sdk.horizon.assetPairs.getAll()
  },

  getHolders (code) {
    return Sdk.horizon.assets.getHolders(code)
  },

  createPair (params) {
    const operation = Sdk.base.Operation.manageAssetPair({
      base: params.base,
      quote: params.quote,
      action: xdr.ManageAssetPairAction.create(),
      policies: +params.policies,
      physicalPrice: '' + params.physicalPrice,
      physicalPriceCorrection: '' + params.physicalPriceCorrection,
      maxPriceStep: '' + params.maxPriceStep,
      source: config.MASTER_ACCOUNT
    })
    return Sdk.horizon.transactions.submitOperations(operation)
  },

  updatePair (params) {
    let action
    if (params.create) {
      action = xdr.ManageAssetPairAction.create()
    } else if (params.updatePrice) {
      action = xdr.ManageAssetPairAction.updatePrice()
    } else if (params.updatePolicy) {
      action = xdr.ManageAssetPairAction.updatePolicy()
    } else {
      throw new TypeError('manageAssetPair: Action is required')
    }

    const operation = Sdk.base.Operation.manageAssetPair({
      base: params.base,
      quote: params.quote,
      action: action,
      policies: +params.policies,
      physicalPrice: '' + params.physicalPrice,
      physicalPriceCorrection: '' + params.physicalPriceCorrection,
      maxPriceStep: '' + params.maxPriceStep,
      source: config.MASTER_ACCOUNT
    })

    return Sdk.horizon.transactions.submitOperations(operation)
  },

  // legacy

  getAssets () {
    return server.sdkServer.assets().callWithSignature(store.getters.keypair)
  },

  getSystemAssets () {
    return server.sdkServer
      .assets()
      .forOwner(config.MASTER_ACCOUNT)
      .callWithSignature(store.getters.keypair)
  },

  getAssetByCode (code) {
    return server.sdkServer.assets()
      .byCode(code)
      .callWithSignature(store.getters.keypair)
  },

  addAsset (code, policies) {
    const opts = {
      action: xdr.ManageAssetAction.manageAssetCreate(),
      code: code,
      physicalPrice: '1',
      policies: policies,
      assetForms: [{ unit: '1', name: '' }],
      source: config.MASTER_ACCOUNT
    }

    const op = Operation.manageAsset(opts)
    return server.submitOperation(op, true)
  },

  manageAsset (code, policies, token, assetForms) {
    const forms = []
    assetForms.forEach(form => {
      forms.push({
        unit: form.unit_size,
        name: form.name
      })
    })
    const opts = {
      code: code,
      policies: policies,
      assetForms: forms,
      source: config.MASTER_ACCOUNT
    }

    if (token) {
      opts.action = xdr.ManageAssetAction.manageAssetAddToken()
      opts.token = token
      opts.assetForms = [{ unit: '1', name: '' }]
      opts.policies = 0
    } else {
      opts.action = xdr.ManageAssetAction.manageAssetUpdatePolicy()
    }

    const op = Operation.manageAsset(opts)

    return server.submitOperation(op, true)
  },

  getAssetPairs () {
    return server.get('/asset_pairs', false)
  },

  convertAssetPairs (sourceAsset, destAsset, amount) {
    return Sdk.horizon.assetPairs.convert({ 'source_asset': sourceAsset, 'dest_asset': destAsset, 'amount': amount })
  }
}
