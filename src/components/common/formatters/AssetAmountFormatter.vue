<template>
  <span
    class="asset-amount-formatter"
    :title="isTitled && formatted"
  >
    {{ formatAmount | formatMoney }}
  </span>
</template>

<script>

export default {
  props: {
    amount: { type: [String, Number], required: true },
    asset: { type: String, default: '' },
    isTitled: { type: Boolean, default: false },
  },
  computed: {
    formatAmount () {
      return {
        value: this.amount,
        currency: this.asset,
      }
    },
  },
}
</script>
