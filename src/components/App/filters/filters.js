import { i18n } from '@/i18n'
import moment from 'moment'
import store from '../../../store'

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

export function assetRequestStatesToString (value) {
  if (value === 'pending') {
    return globalize('filters.asset-request-states-to-string.pending')
  } else if (value === 'canceled') {
    return globalize('filters.asset-request-states-to-string.canceled')
  } else if (value === 'approved') {
    return globalize('filters.asset-request-states-to-string.approved')
  } else if (value === 'rejected') {
    return globalize('filters.asset-request-states-to-string.rejected')
  } else if (value === 'permanentlyRejected') {
    return globalize('filters.asset-request-states-to-string.perm-rejected')
  } else {
    return 1
  }
}
