import config from '../config'
export default {
  propsList: {
    demurrage: ['id', 'ledger_close_time', 'source_account', 'amount', 'asset', 'period_from', 'period_to'],
    create_account: ['id', 'ledger_close_time', 'source_account', 'funder', 'account', 'account_type'],

    payment: ['id', 'ledger_close_time', 'source_account', 'amount', 'asset', 'from', 'to', 'from_balance', 'to_balance',
      'source_payment_fee', 'source_fixed_fee', 'destination_payment_fee', 'destination_fixed_fee',
      'source_pays_for_dest', 'subject'],
    manage_invoice: ['id', 'ledger_close_time', 'source_account', 'invoice_id', 'amount', 'asset',
      'receiver_balance', 'sender', 'state', 'reject_reason'],

    manage_account: ['id', 'ledger_close_time', 'source_account', 'state', 'account', 'block_reasons_to_add', 'block_reasons_to_remove'],
    manage_balance: ['id', 'ledger_close_time', 'source_account', 'user'],
    manage_forfeit_request: ['id', 'ledger_close_time', 'source_account', 'state', 'user_details', 'amount', 'asset', 'action'],
    manage_coins_emission_request: ['id', 'ledger_close_time', 'source_account', 'state', 'amount', 'asset', 'approved', 'reason'],
    review_coins_emission_request: ['id', 'ledger_close_time', 'source_account', 'state', 'amount', 'asset', 'approved', 'reason'],
    set_options: ['id', 'ledger_close_time', 'source_account', 'state', 'master_key_weight', 'signer_key', 'signer_weight', 'signer_type', 'signer_identity'],

    direct_debit: ['id', 'ledger_close_time', 'source_account', 'state'],
    manage_offer: ['id', 'ledger_close_time', 'source_account', 'state'],
    other: ['id', 'ledger_close_time', 'source_account', 'state'],

    create_issuance_request: ['id', 'ledger_close_time', 'source_account', 'asset', 'amount', 'reference', 'state']
  },

  isSystemAccount (accountId) {
    let accountName = accountId;

    ['MASTER_ACCOUNT', 'COMMISSION_ACCOUNT', 'OPERATIONAL_ACCOUNT', 'STORAGE_FEE_ACCOUNT'].forEach(acc => {
      if (config[acc] === accountId) {
        accountName = acc.charAt(0) + acc.slice(1).toLowerCase().split('_').join(' ').replace('storage fee', 'demurrage')
      }
    })
    return accountName
  },

  makeSystemAccountsList () {
    return ['MASTER_ACCOUNT', 'COMMISSION_ACCOUNT', 'OPERATIONAL_ACCOUNT', 'STORAGE_FEE_ACCOUNT'].map(acc => {
      const id = config[acc]
      const type = this.isSystemAccount(id)
      return { id, type }
    })
  },

  getSystemAccount (accountName) {
    return config[accountName]
  },

  participantsInfo (participant) {
    if (!participant.email) {
      return this.isSystemAccount(participant.account_id)
    }

    if (participant.full_name) {
      return `${participant.email} (${participant.full_name})`
    }

    return participant.email
  },

  enumToSting (xdrEnum, value, prefixForRemove = '') {
    const values = []
    xdrEnum.values().forEach(e => {
      if ((e.value & value) !== 0) {
        values.push(e.name.replace(prefixForRemove, '').replace(/([A-Z])/g, ' $1'))
      }
    })
    const s = values.join('; ')
    return s && s[0].toUpperCase() + s.slice(1)
  }
}

// OperationTypeCreateAccount              OperationType = 0
// OperationTypePayment                    OperationType = 1
// OperationTypeSetOptions                 OperationType = 2
// OperationTypeManageCoinsEmissionRequest OperationType = 3
// OperationTypeReviewCoinsEmissionRequest OperationType = 4
// OperationTypeSetFees                    OperationType = 5
// OperationTypeManageAccount              OperationType = 6
// OperationTypeForfeit                    OperationType = 7
// OperationTypeManageForfeitRequest       OperationType = 8
// OperationTypeRecover                    OperationType = 9
// OperationTypeManageBalance              OperationType = 10
// OperationTypeReviewPaymentRequest       OperationType = 11
// OperationTypeManageAsset                OperationType = 12
// OperationTypeDemurrage                  OperationType = 13
// OperationTypeUploadPreemissions         OperationType = 14
// OperationTypeSetLimits                  OperationType = 15
// OperationTypeDirectDebit                OperationType = 16
// OperationTypeManageAssetPair            OperationType = 17
// OperationTypeManageOffer                OperationType = 18
// OperationTypeManageInvoice              OperationType = 19
