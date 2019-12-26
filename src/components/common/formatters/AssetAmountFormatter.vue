<template>
  <span
    class="asset-amount-formatter"
    :title="isTitled && formatted"
  >
    {{ formatted }}
  </span>
</template>

<script>
import { formatAssetAmount } from '@/utils/formatters'

export default {
  props: {
    amount: { type: [String, Number], required: true },
    asset: { type: String, default: '' },
    isTitled: { type: Boolean, default: false },
  },

  computed: {
    formatted () {
      return formatAssetAmount(this.amount, this.asset)
    },
  },
}
</script>
