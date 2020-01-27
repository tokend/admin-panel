import { base } from '@tokend/js-sdk'
import { globalize } from '@/components/App/filters/filters'

export function xdrTypeFromValue (xdrEnum, value) {
  xdrEnum = typeof xdrEnum === 'string'
    ? base.xdr[xdrEnum]
    : xdrEnum

  try {
    return xdrEnum.values().filter(item => item.value === value)[0]
  } catch (error) {
    throw new Error(globalize('xdr-type-from-value.error', {
      xdrEnum: xdrEnum,
    })
    )
  }
}
