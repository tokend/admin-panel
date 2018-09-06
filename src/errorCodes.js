const OpFeeMisMatch = 'Fees mismatched'
const OpSuccess = 'Success'
const OpMalformed = 'Operation you are trying to create is malformed in some way'
const OpUnderfunded = 'Not enough funds. Reduce the amount and try again'
const OpAccountNotFound = 'Account not found'
const OpLowReserve = ' Account doesn\'t have enough balance to satisfy what their new minimum balance would be'
const OpLineFull = 'Error. Payment would cause a destination account to exceed their declared trust limit for the asset being sent'
const OpRequestNotFound = 'Request not found'
const OpRequestAlreadyReviewed = 'This request has been already reviewed'
const OpNoAccount = 'Target account does not exist'
const OpInvalidAmount = 'Invalid amount'
const OpAlreadyExists = 'Entry already exists'
const OpAccountBlocked = 'Operations from blocked account are not allowed'
const OpInvalidRequestID = 'Invalid entry ID'
const OpAssetMismatch = 'Asset of balance and asset of operation are not equal'
const OpBalanceMismatch = 'Asset of balance and asset of operation are not equal'
const OpAccountTypeMismatch = 'Wrong account type in operation. Refresh page and try again'
const OpStatsOverflow = 'Overflow during statistics calculation'
const OpLimitsExceeded = 'Limits exceeded'
const OpDemurrageNotRequired = 'Demurrage Not Required'
const OpExchangePolicyViolated = 'Exchange policy violated'
const OpAssetPolicyViolated    = 'Exchange policy violated'
const OpBadAuth = 'You don\'t have permission to complete this action. Transaction you tried to submit is now waiting for verify.'
const OpNoSourceAccount = 'No source account'
const OpNoCounterParty = 'No counterparty'
const OpCounterPartyBlocked = 'Counterparty account is blocked'
const OpCounterPartyWrongType = 'Counterparty has wrong account type'
const OpTypeNotAllowed = 'Type of account you trying to create is not allowed'
const OpNameDuplication = 'Error. Name duplication'
const OpRefererNotFound = 'Referrer not found'
const OpInvoiceWrongAmount = 'Amount must be a positive number'
const OpInvoiceBalanceMismatch = 'This account id has no such balance'
const OpInvoiceAccountMismatch = 'This account id has no such balance'
const OpInvoiceAlreadyPaid = 'Error. Invoice have already been paid'
const OpTooManySigners = 'Error. Signers limit is exceeded'
const OpThresholdOutOfRange = 'Threshold out of range'
const OpBadSigner = 'Invalid signer'
const OpTooManyTrustLines = 'Error. Too many trust lines'
const OpInvalidReference = 'Error. Invalid Reference'
const OpInvalidReason = 'Error. Invalid Reason'
const OpRequestNotEqual = 'Error. Request not equal'
const OpNotEnoughPreemissions = 'Not enough preissuances'
const OpInvalidFeeType = 'Invalid fee type'
const OpMalformedRange = 'Error. Invalid range'
const OpRangeOverlap = 'Range you entered overlapped with another one. Delete or reduce an old one before creating new'
const OpSubTypeNotExist = 'Subtype not exist'
const OpTypeMismatch = 'Type mismatch'
const OpReviewerNotFound = 'Reviewer not found'
const OpInvalidDetails = 'Invalid details'
const OpExchangeRequiresReviewWithReviewerNotAvailable = 'Exchange requires review request with reviewer not available'
const OpOldSignerNotFound = 'Old signer not found'
const OpSignerAlreadyExists = 'Signer already exist'
const OpDestinationNotFound = 'Destination not found'
const OpAnotherExchange = 'Another exchange'
const OpDemurrageRejectionNotAllowed = 'Demurrage rejection not allowed'
const OpTokenAlreadyExists = 'Token already exists'
const OpAssetTokenAlreadySet = 'Asset token already set'
const OpSerialDuplication = 'Serial is duplicated'
const OpMalformedPreemissions = 'Malformed preissuances'
const OpNoTrust = 'No trust'
const OpAssetPairNotFound = 'Asset pair not found'
const OpInvalidAction = 'Invalid action'
const OpInvalidPolicies = 'Invalid policies'
const OpRequiersReview = 'Requires review'
const OpOfferCrossSelf = 'Current order crosses your existing order'
const OpPhysicalPriceRestriction = 'Price cannot be lower than physical'
const OpCurrentPriceRestriction = 'Price cannot be lower than current'
const OpInvalidPercentFee = 'Invalid percent fee'
const OpOfferDirectBuyNotAllowed = 'Buy now is not available'
const OpOfferInsufficientPrice = 'Order insufficient price'
const OpTooManyInvoices = 'Too many invoices'
const OpCanNotDeleteInProgress = 'Cannot delete request while it is progress'
const OpNotAllowed = 'Not allowed'
const OpReferenceDuplication = 'You cannot make two issuances with the same reference'
const ReferenceDuplication = 'You cannot make two issuances with the same reference'
const OpBalanceNotFound = 'Balance not found'
const SrcBalanceNotFound = 'Source balance not found'
const BalanceNotFound = 'Balance not found'
const OpFeeMismatched = 'Fee mismatched. Refresh the page and try again'
const OpBalanceAccountMismatched = 'Error. Account id has no such balance'
const BalanceAssetsMismatched = 'Asset of balance and asset of operation are not equal'
const OpInvoiceNotFound = 'Invoice not found'
const OpInvalidAsset = 'Error. Invalid asset'
const InvalidAsset = 'Error. Invalid asset'
const OpNotFound = 'Error. Not found'
const OpAssetNotFound = 'Asset not found'
const OpPairNotTraded = 'Asset pair not tradable'
const OpOverflow = 'Overflow during statistics calculation'
const Overflow = 'Overflow during statistics calculation'

const TxSuccess = 'Success'
const TxFailed = 'Transaction failed'
const TxTooEarly = 'Too early'
const TxTooLate = 'Too late'
const TxMissingOperation = 'Missing Operation'
const TxBadAuth = 'Bad auth'
const TxNoSourceAccount = 'No source account'
const TxBadAuthExtra = 'Bad auth extra'
const TxInternalError = 'Internal error'
const TxAccountBlocked = 'Account blocked'
const TxDuplication = 'Transaction duplication'

export const OpErrorCodes = new Map([
  ['op_fee_mismatch',  OpFeeMisMatch],
  ['op_success',  OpSuccess],
  ['op_malformed',  OpMalformed],
  ['op_underfunded',  OpUnderfunded],
  ['op_low_reserve',  OpLowReserve],
  ['op_line_full',  OpLineFull],
  ['op_request_not_found',  OpRequestNotFound],
  ['op_request_already_reviewed',  OpRequestAlreadyReviewed],
  ['op_no_account',  OpNoAccount],
  ['op_invalid_amount',  OpInvalidAmount],
  ['op_already_exists',  OpAlreadyExists],
  ['op_account_blocked',  OpAccountBlocked],
  ['op_account_not_found',  OpAccountNotFound],
  ['op_invalid_request_id',  OpInvalidRequestID],
  ['op_asset_mismatch',  OpAssetMismatch],
  ['op_balance_mismatch',  OpBalanceMismatch],
  ['op_account_type_mismatched',  OpAccountTypeMismatch],
  ['op_stats_overflow',  OpStatsOverflow],
  ['op_limits_exceeded',  OpLimitsExceeded],
  ['op_demurrage_not_required',  OpDemurrageNotRequired],
  ['op_exchange_policy_violated',  OpExchangePolicyViolated],
  ['op_exchange_policy_violated', OpAssetPolicyViolated],
  ['op_bad_auth',  OpBadAuth],
  ['op_no_source_account',  OpNoSourceAccount],
  ['op_no_counterparty',  OpNoCounterParty],
  ['op_counterparty_blocked', OpCounterPartyBlocked],
  ['op_counterparty_wrong_type', OpCounterPartyWrongType],
  ['op_type_not_allowed', OpTypeNotAllowed],
  ['op_name_duplication', OpNameDuplication],
  ['op_referrer_not_found', OpRefererNotFound],
  ['op_invoice_wrong_amount', OpInvoiceWrongAmount],
  ['op_invoice_balance_mismatch', OpInvoiceBalanceMismatch],
  ['op_invoice_account_mismatch', OpInvoiceAccountMismatch],
  ['op_invoice_already_paid', OpInvoiceAlreadyPaid],
  ['op_too_many_signers', OpTooManySigners],
  ['op_threshold_out_of_range', OpThresholdOutOfRange],
  ['op_bad_signer', OpBadSigner],
  ['op_too_many_trust_lines', OpTooManyTrustLines],
  ['invalid_reference', OpInvalidReference],
  ['op_invalid_reason', OpInvalidReason],
  ['op_request_not_equal', OpRequestNotEqual],
  ['not_enough_preemissions', OpNotEnoughPreemissions],
  ['invalid_fee_type', OpInvalidFeeType],
  ['op_malformed_range', OpMalformedRange],
  ['op_range_overlap', OpRangeOverlap],
  ['op_sub_type_not_exist', OpSubTypeNotExist],
  ['type_mismatch', OpTypeMismatch],
  ['op_reviewer_not_found', OpReviewerNotFound],
  ['op_invalid_details', OpInvalidDetails],
  ['op_exchange_requires_review_request_with_reviewer_not_available', OpExchangeRequiresReviewWithReviewerNotAvailable],
  ['op_old_signer_not_found', OpOldSignerNotFound],
  ['op_signer_already_exists', OpSignerAlreadyExists],
  ['op_destination_not_found', OpDestinationNotFound],
  ['op_another_exchange', OpAnotherExchange],
  ['demurrage_rejection_not_allowed', OpDemurrageRejectionNotAllowed],
  ['op_token_already_exists', OpTokenAlreadyExists],
  ['op_asset_token_already_set', OpAssetTokenAlreadySet],
  ['serial_duplication', OpSerialDuplication],
  ['malformed_preemissions', OpMalformedPreemissions],
  ['op_no_trust', OpNoTrust],
  ['op_asset_pair_not_found', OpAssetPairNotFound],
  ['op_invalid_action', OpInvalidAction],
  ['op_invalid_policies', OpInvalidPolicies],
  ['op_requiers_review', OpRequiersReview],
  ['op_offer_cross_self', OpOfferCrossSelf],
  ['physical_price_restriction', OpPhysicalPriceRestriction],
  ['op_current_price_restriction', OpCurrentPriceRestriction],
  ['op_invalid_percent_fee', OpInvalidPercentFee],
  ['op_offer_direct_buy_not_allowed', OpOfferDirectBuyNotAllowed],
  ['op_offer_insuffisient_price', OpOfferInsufficientPrice],
  ['op_too_many_invoices', OpTooManyInvoices],
  ['op_can_not_delete_in_progress', OpCanNotDeleteInProgress],
  ['not_allowed', OpNotAllowed],
  ['op_reference_duplication', OpReferenceDuplication],
  ['reference_duplication', ReferenceDuplication],
  ['op_balance_not_found', OpBalanceNotFound],
  ['src_balance_not_found', SrcBalanceNotFound],
  ['balance_not_found', BalanceNotFound],
  ['op_fee_mismatched', OpFeeMismatched],
  ['op_balance_account_mismatched', OpBalanceAccountMismatched],
  ['balance_assets_mismatched', BalanceAssetsMismatched],
  ['op_invoice_not_found', OpInvoiceNotFound],
  ['op_invalid_asset', OpInvalidAsset],
  ['invalid_asset', InvalidAsset],
  ['op_not_found', OpNotFound],
  ['op_asset_not_dound', OpAssetNotFound],
  ['op_pair_not_traded', OpPairNotTraded],
  ['op_overflow', OpOverflow],
  ['overflow', Overflow]
])

export const TxErrorCodes = new Map ([
  ['tx_success', TxSuccess],
  ['tx_failed', TxFailed],
  ['tx_too_early', TxTooEarly],
  ['tx_too_late', TxTooLate],
  ['tx_missing_operation', TxMissingOperation],
  ['tx_bad_auth', TxBadAuth],
  ['tx_no_source_account', TxNoSourceAccount],
  ['tx_bad_auth_extra', TxBadAuthExtra],
  ['tx_internal_error', TxInternalError],
  ['account_blocked', TxAccountBlocked],
  ['tx_duplication', TxDuplication],
])
