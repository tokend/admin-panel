import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { xdr } from 'tokend-js-sdk'

export const ASSET_PAIR_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPairPolicy')
)

export const ASSET_PAIR_POLICIES_VERBOSE = {
  [xdr.AssetPairPolicy.tradeableSecondaryMarket().value]: 'Tradable on secondary market',
  [xdr.AssetPairPolicy.physicalPriceRestriction().value]: '',
  [xdr.AssetPairPolicy.currentPriceRestriction().value]: ''
}
