import moment from 'moment'
import { KYC_REQUEST_STATES } from '@/constants'
import config from '@/config'

export function filterDateWithTime (date, format = 'DD MMM YYYY [at] hh:mm:ss') {
  try {
    return moment(date).format(format)
  } catch (error) {
    return date
  }
}

export function localizeIssuanceRequestState (type) {
  return KYC_REQUEST_STATES[type].label
}

export function cropAddress (value) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

export function roleIdToString (roleId) {
  return {
    [+config.ACCOUNT_ROLES.notVerified]: 'Unverified',
    [+config.ACCOUNT_ROLES.general]: 'Individual',
    [+config.ACCOUNT_ROLES.corporate]: 'Corporate'
  }[+roleId]
}

export function lowerCase (string) {
  return String(string).toLowerCase()
}
