import { OPERATION_DETAILS_TYPES } from '@/constants'
import { globalize } from '@/components/App/filters/filters'

export function globalizeOperationType (value) {
  let translationId = ''
  switch (value) {
    case OPERATION_DETAILS_TYPES.bindExternalSystemAccountId: {
      translationId = 'filters.operation-type.bind-external-system-account-id'
      break
    }
    case OPERATION_DETAILS_TYPES.cancelAtomicSwapAsk: {
      translationId = 'filters.operation-type.cancel-atomic-swap-ask'
      break
    }
    case OPERATION_DETAILS_TYPES.cancelChangeRoleRequest: {
      translationId = 'filters.operation-type.cancel-change-role-request'
      break
    }
    case OPERATION_DETAILS_TYPES.cancelSaleRequest: {
      translationId = 'filters.operation-type.cancel-sale-request'
      break
    }
    case OPERATION_DETAILS_TYPES.checkSaleState: {
      translationId = 'filters.operation-type.check-sale-state'
      break
    }
    case OPERATION_DETAILS_TYPES.closeSwap: {
      translationId = 'filters.operation-type.close-swap'
      break
    }
    case OPERATION_DETAILS_TYPES.createAccount: {
      translationId = 'filters.operation-type.create-account'
      break
    }
    case OPERATION_DETAILS_TYPES.createAmlAlert: {
      translationId = 'filters.operation-type.create-aml-alert'
      break
    }
    case OPERATION_DETAILS_TYPES.createAtomicSwapAskRequest: {
      translationId = 'filters.operation-type.create-atomic-swap-ask-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createAtomicSwapBidRequest: {
      translationId = 'filters.operation-type.create-atomic-swap-bid-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createChangeRoleRequest: {
      translationId = 'filters.operation-type.create-change-role-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createIssuanceRequest: {
      translationId = 'filters.operation-type.create-issuance-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createKycRecoveryRequest: {
      translationId = 'filters.operation-type.create-kyc-recovery-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createManageLimitsRequest: {
      translationId = 'filters.operation-type.create-manage-limits-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createManageOfferRequest: {
      translationId = 'filters.operation-type.create-manage-offer-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createPaymentRequest: {
      translationId = 'filters.operation-type.create-payment-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createPreissuanceRequest: {
      translationId = 'filters.operation-type.create-preissuance-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createRedemptionRequest: {
      translationId = 'filters.operation-type.create-redemption-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createSaleRequest: {
      translationId = 'filters.operation-type.create-sale-request'
      break
    }
    case OPERATION_DETAILS_TYPES.createWithdrawalRequest: {
      translationId = 'filters.operation-type.create-withdrawal-request'
      break
    }
    case OPERATION_DETAILS_TYPES.initiateKycRecovery: {
      translationId = 'filters.operation-type.initiate-kyc-recovery'
      break
    }
    case OPERATION_DETAILS_TYPES.license: {
      translationId = 'filters.operation-type.license'
      break
    }
    case OPERATION_DETAILS_TYPES.createAccountRole: {
      translationId = 'filters.operation-type.create-account-role'
      break
    }
    case OPERATION_DETAILS_TYPES.updateAccountRole: {
      translationId = 'filters.operation-type.update-account-role'
      break
    }
    case OPERATION_DETAILS_TYPES.removeAccountRole: {
      translationId = 'filters.operation-type.remove-account-role'
      break
    }
    case OPERATION_DETAILS_TYPES.createAccountRule: {
      translationId = 'filters.operation-type.create-account-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.updateAccountRule: {
      translationId = 'filters.operation-type.update-account-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.removeAccountRule: {
      translationId = 'filters.operation-type.remove-account-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.manageAccountSpecificRule: {
      translationId = 'filters.operation-type.manage-account-specific-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.manageAsset: {
      translationId = 'filters.operation-type.manage-asset'
      break
    }
    case OPERATION_DETAILS_TYPES.manageAssetPair: {
      translationId = 'filters.operation-type.manage-asset-pair'
      break
    }
    case OPERATION_DETAILS_TYPES.manageBalance: {
      translationId = 'filters.operation-type.manage-balance'
      break
    }
    case OPERATION_DETAILS_TYPES.manageContract: {
      translationId = 'filters.operation-type.manage-contract'
      break
    }
    case OPERATION_DETAILS_TYPES.manageContractRequest: {
      translationId = 'filters.operation-type.manage-contract-request'
      break
    }
    case OPERATION_DETAILS_TYPES.manageCreatePollRequest: {
      translationId = 'filters.operation-type.manage-create-poll-request'
      break
    }
    case OPERATION_DETAILS_TYPES.manageExternalSystemAccountIdPoolEntry: {
      translationId = 'filters.operation-type.manage-external-system-account-id-pool-entry'
      break
    }
    case OPERATION_DETAILS_TYPES.manageInvoice: {
      translationId = 'filters.operation-type.manage-invoice'
      break
    }
    case OPERATION_DETAILS_TYPES.manageKeyValue: {
      translationId = 'filters.operation-type.manage-key-value'
      break
    }
    case OPERATION_DETAILS_TYPES.manageLimits: {
      translationId = 'filters.operation-type.manage-limits'
      break
    }
    case OPERATION_DETAILS_TYPES.manageOffer: {
      translationId = 'filters.operation-type.manage-offer'
      break
    }
    case OPERATION_DETAILS_TYPES.managePoll: {
      translationId = 'filters.operation-type.manage-poll'
      break
    }
    case OPERATION_DETAILS_TYPES.manageSale: {
      translationId = 'filters.operation-type.manage-sale'
      break
    }
    case OPERATION_DETAILS_TYPES.createSigner: {
      translationId = 'filters.operation-type.create-signer'
      break
    }
    case OPERATION_DETAILS_TYPES.updateSigner: {
      translationId = 'filters.operation-type.update-signer'
      break
    }
    case OPERATION_DETAILS_TYPES.removeSigner: {
      translationId = 'filters.operation-type.remove-signer'
      break
    }
    case OPERATION_DETAILS_TYPES.createSignerRole: {
      translationId = 'filters.operation-type.create-signer-role'
      break
    }
    case OPERATION_DETAILS_TYPES.updateSignerRole: {
      translationId = 'filters.operation-type.update-signer-role'
      break
    }
    case OPERATION_DETAILS_TYPES.removeSignerRole: {
      translationId = 'filters.operation-type.remove-signer-role'
      break
    }
    case OPERATION_DETAILS_TYPES.createSignerRule: {
      translationId = 'filters.operation-type.create-signer-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.updateSignerRule: {
      translationId = 'filters.operation-type.update-signer-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.removeSignerRule: {
      translationId = 'filters.operation-type.remove-signer-rule'
      break
    }
    case OPERATION_DETAILS_TYPES.manageVote: {
      translationId = 'filters.operation-type.manage-vote'
      break
    }
    case OPERATION_DETAILS_TYPES.openSwap: {
      translationId = 'filters.operation-type.open-swap'
      break
    }
    case OPERATION_DETAILS_TYPES.operations: {
      translationId = 'filters.operation-type.operations'
      break
    }
    case OPERATION_DETAILS_TYPES.payment: {
      translationId = 'filters.operation-type.payment'
      break
    }
    case OPERATION_DETAILS_TYPES.payout: {
      translationId = 'filters.operation-type.payout'
      break
    }
    case OPERATION_DETAILS_TYPES.removeAsset: {
      translationId = 'filters.operation-type.remove-asset'
      break
    }
    case OPERATION_DETAILS_TYPES.removeAssetPair: {
      translationId = 'filters.operation-type.remove-asset-pair'
      break
    }
    case OPERATION_DETAILS_TYPES.reviewRequest: {
      translationId = 'filters.operation-type.review-request'
      break
    }
    case OPERATION_DETAILS_TYPES.setFees: {
      translationId = 'filters.operation-type.set-fees'
      break
    }
    case OPERATION_DETAILS_TYPES.stamp: {
      translationId = 'filters.operation-type.stamp'
      break
    }
    default: {
      translationId = 'filters.operation-type.default'
      break
    }
  }
  return globalize(translationId)
}
