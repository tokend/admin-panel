import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { base } from '@tokend/js-sdk'

export const ASSET_PAIR_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPairPolicy')
)

export const ASSET_PAIR_POLICIES_VERBOSE = {
  [base.xdr.AssetPairPolicy.tradeableSecondaryMarket().value]: 'asset-pair-policies.tradable-secondary-market',
  [base.xdr.AssetPairPolicy.physicalPriceRestriction().value]: '',
  [base.xdr.AssetPairPolicy.currentPriceRestriction().value]: '',
}
