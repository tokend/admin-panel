import * as validators from 'vuelidate/lib/validators'
import { base } from '@tokend/js-sdk'

export const password = value => validators.minLength(8)(value)
export const seed = value => base.Keypair.isValidSecretKey(value)
export const amount = value => Number(value) && Number(value) > 0
export const requiredAtLeastOne = value => !!value.length
export const maxDecimalPoints = points => value => {
  const splittedValue = value.split('.')
  if (splittedValue.length < 2) {
    return true
  } else {
    return splittedValue[splittedValue.length - 1].length <= Number(points)
  }
}

export const amountRange = (from, to) => value =>
  !validators.helpers.req(value) || (
    Number(value) &&
    Number(value) >= Number(from) &&
    Number(value) <= Number(to)
  )

export const minAmount = value => {
  return value >= 1 / base.Operation.ONE
}

export const maxAmount = value => {
  return value <= base.MAX_INT64_AMOUNT
}

export const accountId = value => {
  return base.Keypair.isValidPublicKey(value)
}

export const emailOrAccountId = value => {
  return validators.email(value) || accountId(value)
}

export const noMoreThanAvailableOnBalance = balance => value => {
  return +balance >= +value
}

export const noMoreThanAvailableForIssuance = available => value => {
  return +available >= +value
}

export const maxDecimalDigitsCount = maxDecimalDigitsCount => value => {
  const [, decimals] = String(value).split('.')
  if (decimals) {
    return decimals.length <= maxDecimalDigitsCount
  } else {
    return true
  }
}

export * from 'vuelidate/lib/validators'
