import { Sdk } from '@/sdk'

import { xdr } from 'tokend-js-sdk'

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

  getAssetPairs () {
    return server.get('/asset_pairs', false)
  },

  convertAssetPairs (sourceAsset, destAsset, amount) {
    return Sdk.horizon.assetPairs.convert({ 'source_asset': sourceAsset, 'dest_asset': destAsset, 'amount': amount })
  }
}
