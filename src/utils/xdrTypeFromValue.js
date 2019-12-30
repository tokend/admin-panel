import { base } from '@tokend/js-sdk'

export function xdrTypeFromValue (xdrEnum, value) {
  xdrEnum = typeof xdrEnum === 'string'
    ? base.xdr[xdrEnum]
    : xdrEnum

  try {
    return xdrEnum.values().filter(item => item.value === value)[0]
  } catch (error) {
    throw new Error(`xdrEnumToConstant: Cannot get values from provided xdrEnum (${xdrEnum})`)
  }
}
