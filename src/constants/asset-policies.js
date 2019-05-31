import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { base } from '@tokend/js-sdk'

export const ASSET_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPolicy')
)
export const ASSET_POLICIES_VERBOSE = {
  [ base.xdr.AssetPolicy.transferable().value ]: 'Transferable',
  [ base.xdr.AssetPolicy.baseAsset().value ]: 'Base asset',
  [ base.xdr.AssetPolicy.statsQuoteAsset().value ]: 'Stats quote asset',
  [ base.xdr.AssetPolicy.withdrawable().value ]: 'Withdrawable',
  [ base.xdr.AssetPolicy.issuanceManualReviewRequired().value ]: 'Issuance manual review required',
}
