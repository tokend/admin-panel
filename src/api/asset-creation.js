import { ManageAssetBuilder } from 'tokend-js-sdk'
import { ServerCallBuilder } from './ServerCallBuilder'
import { envelopOperations } from './helpers/envelopOperations'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('transactions')

export const assetCreation = {
  createAsset (params) {
    const tx = envelopOperations(
      ManageAssetBuilder.assetCreationRequest({
        requestID: '0',
        code: String(params.code),
        preissuedAssetSigner: String(params.preissued_asset_signer || params.preissuedAssetSigner),
        maxIssuanceAmount: String(params.max_issuance_amount || params.maxIssuanceAmount),
        policies: Number(params.policy),
        initialPreissuedAmount: params.initialPreissuedAmount,
        details: params.details
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  updateAsset (params) {
    const tx = envelopOperations(
      ManageAssetBuilder.assetUpdateRequest({
        requestID: '0',
        code: String(params.code),
        policies: Number(params.policy),
        logoId: String(params.logo_id || params.logoId),
        details: params.details
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  }
}
