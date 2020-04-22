import { globalize } from './filters'

export function formatMoney (value) {
  return globalize('formats.money', { value })
}
