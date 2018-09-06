import { DEFAULT_PRECISION } from '@/constants'
import numeral from 'numeral'

const nbsp = ' ' // non-breakable space
const decimalPart = Array(DEFAULT_PRECISION + 1).join('0')

export function formatAssetAmount (amount, asset) {
  const format = `0,0.${decimalPart}`
  const tail = asset ? `${nbsp}${asset}` : ''

  try {
    return numeral(amount).format(format).concat(tail)
  } catch (error) {
    return `${amount}${tail}`
  }
}
