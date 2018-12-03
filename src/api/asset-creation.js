import { Sdk } from '@/sdk'

export const assetCreation = {
  createAsset (params) {
    const operation = Sdk.base.ManageAssetBuilder.assetCreationRequest({
      requestID: '0',
      code: String(params.code),
      preissuedAssetSigner: String(params.preissued_asset_signer || params.preissuedAssetSigner),
      maxIssuanceAmount: String(params.max_issuance_amount || params.maxIssuanceAmount),
      policies: Number(params.policy),
      initialPreissuedAmount: params.initialPreissuedAmount,
      details: params.details
    })

    return Sdk.horizon.transactions.submitOperations(operation)
  },

  updateAsset (params) {
    const operation = Sdk.base.ManageAssetBuilder.assetUpdateRequest({
      requestID: '0',
      code: String(params.code),
      policies: Number(params.policy),
      logoId: String(params.logo_id || params.logoId),
      details: params.details
    })

    return Sdk.horizon.transactions.submitOperations(operation)
  }
}
