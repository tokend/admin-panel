import { Sdk } from '@/sdk'

import config from '../config'
import server from '../utils/server'
import store from '../store'

export default {
  async getAll () {
    return (await Sdk.horizon.assets.getAll())
  },

  async getAllSystemAssets () {
    return (await Sdk.horizon.assets.getAll({ owner: config.MASTER_ACCOUNT }))
  },

  async get (code) {
    return (await Sdk.horizon.assets.get(code))
  },

  async getPairs () {
    return (await Sdk.horizon.assetPairs.getAll())
  },

  async getHolders (code) {
    return (await Sdk.horizon.assets.getHolders(code))
  },

  async createPair (params) {
    const operation = Sdk.base.Operation.manageAssetPair({
      base: params.base,
      quote: params.quote,
      action: Sdk.xdr.ManageAssetPairAction.create(),
      policies: +params.policies,
      physicalPrice: '' + params.physicalPrice,
      physicalPriceCorrection: '' + params.physicalPriceCorrection,
      maxPriceStep: '' + params.maxPriceStep,
      source: config.MASTER_ACCOUNT
    })
    return (await Sdk.horizon.transactions.submitOperations(operation))
  },

  async updatePair (params) {
    let action
    if (params.create) {
      action = Sdk.xdr.ManageAssetPairAction.create()
    } else if (params.updatePrice) {
      action = Sdk.xdr.ManageAssetPairAction.updatePrice()
    } else if (params.updatePolicy) {
      action = Sdk.xdr.ManageAssetPairAction.updatePolicy()
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

    return (await Sdk.horizon.transactions.submitOperations(operation))
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

  async convertAssetPairs (sourceAsset, destAsset, amount) {
    return (await Sdk.horizon.assetPairs.convert({ 'source_asset': sourceAsset, 'dest_asset': destAsset, 'amount': amount }))
  }
}
