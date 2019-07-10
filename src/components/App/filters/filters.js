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
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    permanently_rejected: 'Permanently rejected',
    permanentlyRejected: 'Permanently rejected',
    canceled: 'Canceled',
    cancelled: 'Cancelled',
  }[type]
}

export function cropAddress (value) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

export function roleIdToString (roleId) {
  return {
    [+store.getters.kvEntryUnverifiedRoleId]: 'Unverified',
    [+store.getters.kvEntryGeneralRoleId]: 'General',
    [+store.getters.kvEntryUsVerifiedRoleId]: 'US Verified',
    [+store.getters.kvEntryUsAccreditedRoleId]: 'US Accredited',
    [+store.getters.kvEntryCorporateRoleId]: 'Corporate',
    [+store.getters.kvEntryBlockedRoleId]: 'Blocked',
  }[+roleId]
}

export function assetTypeToString (assetType) {
  return {
    [+store.getters.kvAssetTypeDefault]: 'Does not require KYC',
    [+store.getters.kvAssetTypeKycRequired]: 'Requires KYC',
    [+store.getters.kvAssetTypeSecurity]: 'Security',
  }[+assetType]
}

export function pollTypeToString (value) {
  return {
    [+store.getters.kvPollTypeRestricted]: 'Restricted',
    [+store.getters.kvPollTypeUnrestricted]: 'Unrestricted',
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
