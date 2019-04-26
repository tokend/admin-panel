<template>
  <span class="asset-amount-formatter">
    {{ formatAssetAmount(amount, asset) }}
  </span>
</template>

<script>
import { formatAssetAmount } from '@/utils/formatters'

export default {
  props: {
    amount: { type: String, required: true },
    asset: { type: String, required: true },
  },

  methods: {
    formatAssetAmount,
  },
}
</script>
