import { Sdk } from '@/sdk'

export function xdrTypeFromValue (xdrEnum, value) {
  xdrEnum = typeof xdrEnum === 'string'
    ? Sdk.xdr[xdrEnum]
    : xdrEnum

  try {
    return xdrEnum.values().filter(item => item.value === value)[0]
  } catch (error) {
    throw new Error(`xdrEnumToConstant: Cannot get values from provided xdrEnum (${xdrEnum})`)
  }
}
