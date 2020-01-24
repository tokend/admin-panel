import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { base } from '@tokend/js-sdk'
export const ASSET_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPolicy')
)
export const ASSET_POLICIES_VERBOSE = {
  [ base.xdr.AssetPolicy.transferable().value ]: 'asset-policies.transferable',
  [ base.xdr.AssetPolicy.baseAsset().value ]: 'asset-policies.base-asset',
  [ base.xdr.AssetPolicy.statsQuoteAsset().value ]: 'asset-policies.stats-quote-asset',
  [ base.xdr.AssetPolicy.withdrawable().value ]: 'asset-policies.withdrawable',
  [ base.xdr.AssetPolicy.issuanceManualReviewRequired().value ]: 'asset-policies.issuance-manual-review-required',
  [ base.xdr.AssetPolicy.canBeBaseInAtomicSwap().value ]: 'asset-policies.base-atomic-swap',
  [ base.xdr.AssetPolicy.canBeQuoteInAtomicSwap().value ]: 'asset-policies.quote-atomic-swap',
}
