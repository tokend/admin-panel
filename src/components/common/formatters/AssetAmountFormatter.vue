<template>
  <span
    class="asset-amount-formatter"
    :title="isTitled && formatted"
  >
    {{ amount | assetAmountFilter(asset) }}
  </span>
</template>

<script>

export default {
  props: {
    amount: { type: [String, Number], required: true },
    asset: { type: String, default: '' },
    isTitled: { type: Boolean, default: false },
  },
}
</script>
