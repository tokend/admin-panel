<template>
  <span class="asset-amount-formatter">
    {{ formatAssetAmount(amount, asset) }}
  </span>
</template>

<script>
import { formatAssetAmount } from '@/utils/formatters'

export default {
  props: {
    amount: { type: [String, Number], required: true },
    asset: { type: String, default: '' },
  },

  methods: {
    formatAssetAmount,
  },
}
</script>
