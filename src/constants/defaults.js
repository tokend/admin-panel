import { Operation } from 'tokend-js-sdk'

export const DEFAULT_BASE_ASSET = 'SUN'
export const DEFAULT_QUOTE_ASSET = 'BTC'
export const DEFAULT_PRECISION = String(Operation.ONE || 1000000).match(/0/g).length
export const DEFAULT_INPUT_STEP = `0.${'0'.repeat(DEFAULT_PRECISION - 1)}1`
export const DEFAULT_INPUT_MIN = `0.${'0'.repeat(DEFAULT_PRECISION - 1)}1`
export const DEFAULT_DATE_FORMAT = 'DD MMM YYYY'
export const DEFAULT_DATE_TIME_FORMAT = 'DD MMM YYYY [at] HH:mm:ss'
export const DEFAULT_MAX_AMOUNT = Operation.MAX_INT64_AMOUNT
