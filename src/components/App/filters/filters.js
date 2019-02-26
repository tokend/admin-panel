import moment from 'moment'
import config from '@/config'

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
    cancelled: 'Cancelled'
  }[type]
}

export function cropAddress (value) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

export function roleIdToString (roleId) {
  return {
    [+config.ACCOUNT_ROLES.notVerified]: 'Unverified',
    [+config.ACCOUNT_ROLES.general]: 'General',
    [+config.ACCOUNT_ROLES.corporate]: 'Corporate'
  }[+roleId]
}

export function lowerCase (string) {
  return String(string).toLowerCase()
}
