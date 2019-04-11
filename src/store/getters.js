import config from '../config'
import { Sdk } from '@/sdk'
import get from 'lodash/get'

export const keypair = (state) => {
  if (!state.user.keys.seed) return {}
  return Sdk.base.Keypair.fromSecret(state.user.keys.seed)
}

export const masterId = (state) => {
  return config.MASTER_ACCOUNT
}

export const pageLimit = (state) => {
  return config.PAGE_LIMIT
}

export const message = (state) => state.message

export function GET_USER (state) {
  return state.user
}

export function GET_USER_ADDRESS (state) {
  return get(state, 'user.address', '')
}
