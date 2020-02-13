import { i18n } from '@/i18n'
import moment from 'moment'
import store from '../../../store'
import { base, SALE_TYPES } from '@tokend/js-sdk'
import {
  LIMITS_REQUEST_STATES_STR,
  STELLAR_TYPES, ASSET_REQUEST_TYPES,
  ID_DOCUMENT_TYPES,
  PAYMENT_FEE_TYPES,
} from '@/constants'

export function filterDateWithTime (date, format = 'DD MMM YYYY [at] hh:mm:ss') {
  try {
    return moment(date).format(format)
  } catch (error) {
    return date
  }
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
  }[+roleId] || globalize('filters.role-id-to-string.not-found')
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

export function accountState (role) {
  return role === +store.getters.kvAccountRoles.blocked
    ? globalize('filters.account-state.blocked')
    : globalize('filters.account-state.active')
}

export function globalize (translationId, interpolationOps) {
  return '$_' + i18n.t(translationId, interpolationOps)
}

export function formatDate (value) {
  return globalize('formats.date', { value })
}

export function formatDateDMY (value) {
  return globalize('formats.dmy', { value })
}

export function formatDateDMYT (value) {
  return globalize('formats.dmyt', { value })
}

export function yesNoFilter (value) {
  if (value) {
    return globalize('filters.yes-no-filter.yes')
  } else {
    return globalize('filters.yes-no-filter.no')
  }
}

export function assetRequestTypesFilter (value) {
  let translationId = ''
  switch (value) {
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

export function assetPoliciesFilter (value) {
  let translationId = ''
  switch (+value) {
    case base.xdr.AssetPolicy.transferable().value: {
      translationId = 'filters.asset-policies-filter.transferable'
      break
    }
    case base.xdr.AssetPolicy.baseAsset().value: {
      translationId = 'filters.asset-policies-filter.base-asset'
      break
    }
    case base.xdr.AssetPolicy.statsQuoteAsset().value: {
      translationId = 'filters.asset-policies-filter.stats-quote-asset'
      break
    }
    case base.xdr.AssetPolicy.withdrawable().value: {
      translationId = 'filters.asset-policies-filter.withdrawable'
      break
    }
    case base.xdr.AssetPolicy.issuanceManualReviewRequired().value: {
      translationId = 'filters.asset-policies-filter.issuance-manual-review-required'
      break
    }
    case base.xdr.AssetPolicy.canBeBaseInAtomicSwap().value: {
      translationId = 'filters.asset-policies-filter.base-atomic-swap'
      break
    }
    case base.xdr.AssetPolicy.canBeQuoteInAtomicSwap().value: {
      translationId = 'filters.asset-policies-filter.quote-atomic-swap'
      break
    }
    default: {
      translationId = 'filters.asset-policies-filter.default'
      break
    }
  }
  return globalize(translationId)
}

export function stellarAssetTypesFilter (value) {
  let translationId

  switch (value) {
    case STELLAR_TYPES.creditAlphanum4: {
      translationId = 'filters.stellar-asset-types-filter.alphanumeric-4'
      break
    }
    case STELLAR_TYPES.creditAlphanum12: {
      translationId = 'filters.stellar-asset-types-filter.alphanumeric-12'
      break
    }
    case STELLAR_TYPES.native: {
      translationId = 'filters.stellar-asset-types-filter.native'
      break
    }
    default: {
      translationId = 'filters.stellar-asset-types-filter.default'
      break
    }
  }

  return globalize(translationId)
}

export function limitsRequestStatesStrFilter (value) {
  let translationId = ''
  switch (value) {
    case LIMITS_REQUEST_STATES_STR.updateLimits: {
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
    case ID_DOCUMENT_TYPES.passport: {
      translationId = 'filters.id-documents-verbose-filter.passport'
      break
    }
    case ID_DOCUMENT_TYPES.identityCard: {
      translationId = 'filters.id-documents-verbose-filter.identity-card'
      break
    }
    case ID_DOCUMENT_TYPES.drivingLicense: {
      translationId = 'filters.id-documents-verbose-filter.driving-license'
      break
    }
    case ID_DOCUMENT_TYPES.residencePermit: {
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

export function localizedSaleTypesFilter (value) {
  let translationId = ''
  switch (+value) {
    case SALE_TYPES.fixedPrice: {
      translationId = 'filters.localized-sale-types-filter.fixed-price'
      break
    }
    case SALE_TYPES.immediate: {
      translationId = 'filters.localized-sale-types-filter.immediate'
      break
    }
    case SALE_TYPES.basicSale: {
      translationId = 'filters.localized-sale-types-filter.basic-sale'
      break
    }
    case SALE_TYPES.crowdFunding: {
      translationId = 'filters.localized-sale-types-filter.crowd-funding'
      break
    }
    default: {
      translationId = 'filters.localized-sale-types-filter.default'
    }
  }
  return globalize(translationId)
}

export function feeTypesFilter (value) {
  let translationId = ''
  switch (+value) {
    case PAYMENT_FEE_TYPES.outgoing: {
      translationId = 'filters.fee-type-filter.outgoing'
      break
    }
    case PAYMENT_FEE_TYPES.incoming: {
      translationId = 'filters.fee-type-filter.incoming'
      break
    }
    default: {
      translationId = 'filters.fee-type-filter.unknown-type'
    }
  }
  return globalize(translationId)
}
