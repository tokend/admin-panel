import { SIGNER_TYPES, SIGNER_TYPES_SECONDARY } from './signer-types'

const ADMIN_SIGNER_SET_SUPER = [
  SIGNER_TYPES.kycSuperAdmin,
  SIGNER_TYPES.accountManager,
  SIGNER_TYPES_SECONDARY.viewUserList,
  SIGNER_TYPES_SECONDARY.viewPendingKycRequests,
  SIGNER_TYPES_SECONDARY.viewHistoryKycRequests
]

const ADMIN_SIGNER_SET_SECURITY = [
  SIGNER_TYPES.viewTransactionHistory,
  SIGNER_TYPES.syndicateAccManager,
  SIGNER_TYPES.exchangeAccManager,
  SIGNER_TYPES.notVerifiedAccManager,
  SIGNER_TYPES.generalAccManager,
  SIGNER_TYPES.searchUserAccount
]

const ADMIN_SIGNER_SET_ISSUANCE = [
  SIGNER_TYPES.issuanceManager,
  SIGNER_TYPES_SECONDARY.viewIssuanceHistory,
  SIGNER_TYPES_SECONDARY.viewPendingIssuanceRequests,
  SIGNER_TYPES.userIssuanceManager,
  SIGNER_TYPES.withdrawManager
]

const ADMIN_SIGNER_SET_KYC = [SIGNER_TYPES.kycAccManager]
const ADMIN_SIGNER_SET_FEES = [SIGNER_TYPES.feesManager]
const ADMIN_SIGNER_SET_LIMITS = [SIGNER_TYPES.limitsManager]

const ADMIN_SIGNER_SET_TRADE = [
  SIGNER_TYPES.assetManager,
  SIGNER_TYPES.assetRateManager
]

const ADMIN_SIGNER_SET_CROWDFUNDING = [
  SIGNER_TYPES_SECONDARY.viewCrowdfundingCampaignRequests,
  SIGNER_TYPES.userAssetManager
]

export const ADMIN_SIGNER_SET = Object.freeze({
  super: ADMIN_SIGNER_SET_SUPER.reduce((a, c) => a + c),
  security: ADMIN_SIGNER_SET_SECURITY.reduce((a, c) => a + c),
  issuance: ADMIN_SIGNER_SET_ISSUANCE.reduce((a, c) => a + c),
  kyc: ADMIN_SIGNER_SET_KYC.reduce((a, c) => a + c),
  fees: ADMIN_SIGNER_SET_FEES.reduce((a, c) => a + c),
  limits: ADMIN_SIGNER_SET_LIMITS.reduce((a, c) => a + c),
  trade: ADMIN_SIGNER_SET_TRADE.reduce((a, c) => a + c),
  crowdfunding: ADMIN_SIGNER_SET_CROWDFUNDING.reduce((a, c) => a + c)
})

export const ADMIN_SIGNER_SET_INCLUDED_RIGHTS = Object.freeze({
  [ADMIN_SIGNER_SET.super]: ADMIN_SIGNER_SET_SUPER,
  [ADMIN_SIGNER_SET.security]: ADMIN_SIGNER_SET_SECURITY,
  [ADMIN_SIGNER_SET.issuance]: ADMIN_SIGNER_SET_ISSUANCE,
  [ADMIN_SIGNER_SET.kyc]: ADMIN_SIGNER_SET_KYC,
  [ADMIN_SIGNER_SET.fees]: ADMIN_SIGNER_SET_FEES,
  [ADMIN_SIGNER_SET.limits]: ADMIN_SIGNER_SET_LIMITS,
  [ADMIN_SIGNER_SET.trade]: ADMIN_SIGNER_SET_TRADE,
  [ADMIN_SIGNER_SET.crowdfunding]: ADMIN_SIGNER_SET_CROWDFUNDING
})
