import { ADMIN_SIGNER_SET } from '../../../constants/admin-signer-types'

const ADMIN_SIGNER_SET_LOCALIZED = Object.freeze({
  [ADMIN_SIGNER_SET.super]: 'Super',
  [ADMIN_SIGNER_SET.security]: 'Security',
  [ADMIN_SIGNER_SET.issuance]: 'Issuance',
  [ADMIN_SIGNER_SET.operationManager]: 'Operation  manager',
  [ADMIN_SIGNER_SET.balanceManager]: 'Balance manager',
  [ADMIN_SIGNER_SET.kyc]: 'KYC',
  [ADMIN_SIGNER_SET.fees]: 'Fees',
  [ADMIN_SIGNER_SET.limits]: 'Limits',
  [ADMIN_SIGNER_SET.trade]: 'Trade',
  [ADMIN_SIGNER_SET.crowdfunding]: 'Crowdfunding'
})

export function getAdminSignerTypeLabel (type) {
  if (ADMIN_SIGNER_SET_LOCALIZED[type]) {
    return ADMIN_SIGNER_SET_LOCALIZED[type]
  } else {
    return 'Custom'
  }
}
