import { Sdk } from '@/sdk'
import { api } from '@/api'

export default {
  async createPair (params) {
    const operation = Sdk.base.Operation.manageAssetPair({
      base: params.base,
      quote: params.quote,
      action: Sdk.xdr.ManageAssetPairAction.create(),
      policies: +params.policies,
      physicalPrice: '' + params.physicalPrice,
      physicalPriceCorrection: '' + params.physicalPriceCorrection,
      maxPriceStep: '' + params.maxPriceStep,
    })
    const response = await api.postOperations(operation)
    return response.data
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
    })
    const response = await api.postOperations(operation)
    return response.data
  },
}
