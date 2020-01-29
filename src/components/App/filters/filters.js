import { i18n } from '@/i18n'
import moment from 'moment'
import store from '../../../store'
import { base } from '@tokend/js-sdk'
import { CREATE_ASSET_REQUEST_STATES, LIMITS_REQUEST_STATES_STR, STELLAR_TYPES, ASSET_REQUEST_TYPES, ID_DOCUMENTS_VERBOSE, ASSET_POLICIES_VERBOSE } from '@/constants'
export function filterDateWithTime (date, format = 'DD MMM YYYY [at] hh:mm:ss') {
  try {
    return moment(date).format(format)
  } catch (error) {
    return date
  }
}

export function localizeIssuanceRequestState (type) {
  return {
    approved: globalize('filters.localize-issuance-request-state.approved'),
    pending: globalize('filters.localize-issuance-request-state.pending'),
    rejected: globalize('filters.localize-issuance-request-state.rejected'),
    permanently_rejected: globalize('filters.localize-issuance-request-state.permanently-rejected'),
    permanentlyRejected: globalize('filters.localize-issuance-request-state.permanently-rejected'),
    canceled: globalize('filters.localize-issuance-request-state.canceled'),
    cancelled: globalize('filters.localize-issuance-request-state.cancelled'),
  }[type]
}

export function cropAddress (value) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

export function roleIdToString (roleId) {
  return {
    [+store.getters.kvEntryUnverifiedRoleId]: globalize('filters.role-id-to-string.unverified'),
    [+store.getters.kvEntryGeneralRoleId]: globalize('filters.role-id-to-string.general'),
    [+store.getters.kvEntryUsVerifiedRoleId]: globalize('filters.role-id-to-string.us-verified'),
    [+store.getters.kvEntryUsAccreditedRoleId]: globalize('filters.role-id-to-string.us-accredited'),
    [+store.getters.kvEntryCorporateRoleId]: globalize('filters.role-id-to-string.corporate'),
    [+store.getters.kvEntryBlockedRoleId]: globalize('filters.role-id-to-string.blocked'),
  }[+roleId]
}

export function assetTypeToString (assetType) {
  return {
    [+store.getters.kvAssetTypeDefault]: globalize('filters.asset-type-to-string.not-require-kyc'),
    [+store.getters.kvAssetTypeKycRequired]: globalize('filters.asset-type-to-string.requires-kyc'),
    [+store.getters.kvAssetTypeSecurity]: globalize('filters.asset-type-to-string.security'),
  }[+assetType]
}

export function pollTypeToString (value) {
  return {
    [+store.getters.kvPollTypeRestricted]: globalize('filters.poll-type-to-string.restricted'),
    [+store.getters.kvPollTypeUnrestricted]: globalize('filters.poll-type-to-string.unrestricted'),
  }[+value]
}

export function lowerCase (string) {
  return String(string).toLowerCase()
}

export function formatVersion (string) {
  const isHash = new RegExp('^[a-zA-Z0-9]*$')
  if (isHash.test(string)) {
    return string.slice(0, 7)
  } else {
    return string
  }
}

export function globalize (translationId, interpolationOps) {
  return i18n.t(translationId, interpolationOps)
}

export function formatDate (value) {
  return globalize('formats.date', { value })
}

export function yesNoFilter (value) {
  if (value) {
    return globalize('filters.yes-no-filter.yes')
  } else {
    return globalize('filters.yes-no-filter.no')
  }
}

export function assetRequestStatesFilter (value) {
  let translationId = ''
  switch (value) {
    case CREATE_ASSET_REQUEST_STATES.pending.codeVerbose: {
      translationId = 'filters.asset-request-states-filter.pending'
      break
    }
    case CREATE_ASSET_REQUEST_STATES.canceled.codeVerbose: {
      translationId = 'filters.asset-request-states-filter.canceled'
      break
    }
    case CREATE_ASSET_REQUEST_STATES.approved.codeVerbose: {
      translationId = 'filters.asset-request-states-filter.approved'
      break
    }
    case CREATE_ASSET_REQUEST_STATES.rejected.codeVerbose: {
      translationId = 'filters.asset-request-states-filter.rejected'
      break
    }
    case CREATE_ASSET_REQUEST_STATES.permanentlyRejected.codeVerbose: {
      translationId = 'filters.asset-request-states-filter.perm-rejected'
      break
    }
    default: {
      translationId = 'filters.asset-request-states-filter.default'
      break
    }
  }
  return globalize(translationId)
}

export function assetRequestTypesFilter (val) {
  let translationId = ''
  switch (val) {
    case ASSET_REQUEST_TYPES.createAsset: {
      translationId = 'filters.asset-request-types-filter.create'
      break
    }
    case ASSET_REQUEST_TYPES.updateAsset: {
      translationId = 'filters.asset-request-types-filter.update'
      break
    }
    default: {
      translationId = 'filters.asset-request-types-filter.default'
      break
    }
  }
  return globalize(translationId)
}

export function assetPoliciesVerboseFilter (value) {
  let translationId = ''
  switch (value) {
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.transferable().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.transferable'
      break
    }
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.baseAsset().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.base-asset'
      break
    }
    // eslint-disable-next-line max-len
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.statsQuoteAsset().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.stats-quote-asset'
      break
    }
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.withdrawable().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.withdrawable'
      break
    }
    // eslint-disable-next-line max-len
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.issuanceManualReviewRequired().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.issuance-manual-review-required'
      break
    }
    // eslint-disable-next-line max-len
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.canBeBaseInAtomicSwap().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.base-atomic-swap'
      break
    }
    // eslint-disable-next-line max-len
    case ASSET_POLICIES_VERBOSE[ base.xdr.AssetPolicy.canBeQuoteInAtomicSwap().value ]: {
      translationId = 'filters.asset-policies-verbose-filter.quote-atomic-swap'
      break
    }
    default: {
      translationId = 'filters.asset-policies-verbose-filter.default'
      break
    }
  }
  return globalize(translationId)
}
export function stellarAssetTypesFilter (value) {
  let translationId

  switch (value) {
    case STELLAR_TYPES.credit_alphanum4:
      translationId = 'filters.stellar-asset-types-filter.alphanumeric-4'
      break

    case STELLAR_TYPES.credit_alphanum12:
      translationId = 'filters.stellar-asset-types-filter.alphanumeric-12'
      break

    case STELLAR_TYPES.native:
      translationId = 'filters.stellar-asset-types-filter.native'
      break

    default:
      translationId = 'filters.stellar-asset-types-filter.default'
      break
  }

  return translationId
}

export function limitsRequestStatesStrFilter (value) {
  let translationId = ''
  switch (value) {
    case LIMITS_REQUEST_STATES_STR.update_limits: {
      translationId = 'filters.limits-request-states-str-filter.limits-update'
      break
    }
    case LIMITS_REQUEST_STATES_STR.initial: {
      translationId = 'filters.limits-request-states-str-filter.initial'
      break
    }
    case LIMITS_REQUEST_STATES_STR.docsUploading: {
      translationId = 'filters.limits-request-states-str-filter.docs-uploading'
      break
    }
    default: {
      translationId = 'filters.limits-request-states-str-filter.default'
      break
    }
  }
  return globalize(translationId)
}

export function roleTypeVerboseFilter (value) {
  let translationId = ''
  switch (value) {
    case store.getters.kvAccountRoles.general: {
      translationId = 'filters.role-type-verbose-filter.general'
      break
    }
    case store.getters.kvAccountRoles.usVerified: {
      translationId = 'filters.role-type-verbose-filter.us-verified'
      break
    }
    case store.getters.kvAccountRoles.usAccredited: {
      translationId = 'filters.role-type-verbose-filter.us-accredited'
      break
    }
    case store.getters.kvAccountRoles.corporate: {
      translationId = 'filters.role-type-verbose-filter.corporate'
      break
    }
    case store.getters.kvAccountRoles.notVerified: {
      translationId = 'filters.role-type-verbose-filter.not-verified'
      break
    }
    default: {
      translationId = 'filters.role-type-verbose-filter.default'
      break
    }
  }
  return globalize(translationId)
}

export function idDocumentsVerboseFilter (value) {
  let translationId = ''
  switch (value) {
    case ID_DOCUMENTS_VERBOSE.passport: {
      translationId = 'filters.id-documents-verbose-filter.passport'
      break
    }
    case ID_DOCUMENTS_VERBOSE.identity_card: {
      translationId = 'filters.id-documents-verbose-filter.identity-card'
      break
    }
    case ID_DOCUMENTS_VERBOSE.driving_license: {
      translationId = 'filters.id-documents-verbose-filter.driving-license'
      break
    }
    case ID_DOCUMENTS_VERBOSE.residence_permit: {
      translationId = 'filters.id-documents-verbose-filter.residence-permit'
      break
    }
    default: {
      translationId = 'filters.id-documents-verbose-filter.default'
      break
    }
  }
  return globalize(translationId)
}
