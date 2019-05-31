import { base } from '@/sdk'
import { api } from '@tokend/js-sdk'

export default {
  async createPair (params) {
    const operation = base.Operation.manageAssetPair({
      base: params.base,
      quote: params.quote,
      action: base.xdr.ManageAssetPairAction.create(),
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
      action = base.xdr.ManageAssetPairAction.create()
    } else if (params.updatePrice) {
      action = base.xdr.ManageAssetPairAction.updatePrice()
    } else if (params.updatePolicy) {
      action = base.xdr.ManageAssetPairAction.updatePolicy()
    } else {
      throw new TypeError('manageAssetPair: Action is required')
    }

    const operation = base.Operation.manageAssetPair({
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
