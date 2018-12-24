import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { Sdk } from '@/sdk'

export const ASSET_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPolicy')
)
console.log(Sdk.xdr)
export const ASSET_POLICIES_VERBOSE = {
  [ Sdk.xdr.AssetPolicy.transferable().value ]: 'Transferable',
  [ Sdk.xdr.AssetPolicy.baseAsset().value ]: 'Base asset',
  [ Sdk.xdr.AssetPolicy.statsQuoteAsset().value ]: 'Stats quote asset',
  [ Sdk.xdr.AssetPolicy.withdrawable().value ]: 'Withdrawable',
  [ Sdk.xdr.AssetPolicy.twoStepWithdrawal().value ]: 'Two step withdrawal',
  [ Sdk.xdr.AssetPolicy.requiresKyc().value ]: 'Requires Kyc',
  [ Sdk.xdr.AssetPolicy.issuanceManualReviewRequired().value ]: 'Issuance manual review required',
  [ Sdk.xdr.AssetPolicy.withdrawableV2().value ]: 'Withdrawable V2'
}
