import * as validators from 'vuelidate/lib/validators'
import { base } from '@tokend/js-sdk'

export const password = value => validators.minLength(8)(value)
export const seed = value => base.Keypair.isValidSecretKey(value)
export const accountId = value => base.Keypair.isValidPublicKey(value)
export const balanceId = value => base.Keypair.isValidBalanceKey(value)

export const emailOrAccountId = value => {
  return validators.email(value) || accountId(value)
}

export const emailOrAccountIdOrBalanceId = value => {
  return validators.email(value) || accountId(value) || balanceId(value)
}

export const noMoreThanAvailableForIssuance = available => value => {
  return +available >= +value
}

export const hex = value => {
  return /^(0x|0X)?[a-fA-F0-9]+$/.test(value)
}

export * from 'vuelidate/lib/validators'
