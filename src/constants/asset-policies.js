import { xdrEnumToConstant } from '@/utils/xdrEnumToConstant'
import { xdr } from 'tokend-js-sdk'

export const ASSET_POLICIES = Object.freeze(
  xdrEnumToConstant('AssetPolicy')
)

export const ASSET_POLICIES_VERBOSE = {
  [xdr.AssetPolicy.transferable().value]: 'Transferable',
  [xdr.AssetPolicy.baseAsset().value]: 'Base asset',
  [xdr.AssetPolicy.statsQuoteAsset().value]: 'Stats quote asset',
  [xdr.AssetPolicy.withdrawable().value]: 'Withdrawable',
  [xdr.AssetPolicy.twoStepWithdrawal().value]: 'Two step withdrawal',
  [xdr.AssetPolicy.requiresKyc().value]: 'Requires Kyc',
  [xdr.AssetPolicy.issuanceManualReviewRequired().value]: 'Issuance manual review required'
}
