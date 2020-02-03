import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { base } from '@tokend/js-sdk'
export const ASSET_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPolicy')
)
export const ASSET_POLICIES_VERBOSE = {
  [ base.xdr.AssetPolicy.transferable().value ]: 'transferable',
  [ base.xdr.AssetPolicy.baseAsset().value ]: 'baseAsset',
  [ base.xdr.AssetPolicy.statsQuoteAsset().value ]: 'statsQuoteAsset',
  [ base.xdr.AssetPolicy.withdrawable().value ]: 'withdrawable',
  [ base.xdr.AssetPolicy.issuanceManualReviewRequired().value ]: 'issuanceManualReviewRequired',
  [ base.xdr.AssetPolicy.canBeBaseInAtomicSwap().value ]: 'canBeBaseInAtomicSwap',
  [ base.xdr.AssetPolicy.canBeQuoteInAtomicSwap().value ]: 'canBeQuoteInAtomicSwap',
}
