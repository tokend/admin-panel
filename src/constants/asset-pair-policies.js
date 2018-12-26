import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { Sdk } from '@/sdk'

export const ASSET_PAIR_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPairPolicy')
)

export const ASSET_PAIR_POLICIES_VERBOSE = {
  [Sdk.xdr.AssetPairPolicy.tradeableSecondaryMarket().value]: 'Tradable on secondary market',
  [Sdk.xdr.AssetPairPolicy.physicalPriceRestriction().value]: '',
  [Sdk.xdr.AssetPairPolicy.currentPriceRestriction().value]: ''
}
