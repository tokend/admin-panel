import { globalize } from './filters'

export function formatNumber (value) {
  return globalize('formats.number', { value })
}
