import { base } from '@tokend/js-sdk'
import { globalize } from '@/components/App/filters/filters'

export function xdrEnumToConstant (xdrEnum) {
  xdrEnum = typeof xdrEnum === 'string'
    ? base.xdr[xdrEnum]
    : xdrEnum

  try {
    const res = {}
    xdrEnum.values().forEach(function (item) { res[item.name] = item.value })
    return res
  } catch (error) {
    throw new Error(globalize('xdr-enum-to-constant.error', {
      xdrEnum: xdrEnum,
    })
    )
  }
}
