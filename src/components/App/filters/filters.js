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
    approved: globalize('filters.approved'),
    pending: globalize('filters.pending'),
    rejected: globalize('filters.rejected'),
    permanently_rejected: globalize('filters.permanently-rejected'),
    permanentlyRejected: globalize('filters.permanently-rejected'),
    canceled: globalize('filters.canceled'),
    cancelled: globalize('filters.cancelled'),
  }[type]
}

export function cropAddress (value) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

export function roleIdToString (roleId) {
  return {
    [+store.getters.kvEntryUnverifiedRoleId]: globalize('filters.unverified'),
    [+store.getters.kvEntryGeneralRoleId]: globalize('filters.general'),
    [+store.getters.kvEntryUsVerifiedRoleId]: globalize('filters.us-verified'),
    [+store.getters.kvEntryUsAccreditedRoleId]: globalize('filters.us-accredited'),
    [+store.getters.kvEntryCorporateRoleId]: globalize('filters.corporate'),
    [+store.getters.kvEntryBlockedRoleId]: globalize('filters.blocked'),
  }[+roleId]
}

export function assetTypeToString (assetType) {
  return {
    [+store.getters.kvAssetTypeDefault]: globalize('filters.not-require-kyc'),
    [+store.getters.kvAssetTypeKycRequired]: globalize('filters.requires-kyc'),
    [+store.getters.kvAssetTypeSecurity]: globalize('filters.security'),
  }[+assetType]
}

export function pollTypeToString (value) {
  return {
    [+store.getters.kvPollTypeRestricted]: globalize('filters.restricted'),
    [+store.getters.kvPollTypeUnrestricted]: globalize('filters.unrestricted'),
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
    return globalize('filters.yes')
  } else {
    return globalize('filters.no')
  }
}
