<template>
  <span
    class="asset-amount-formatter"
    :title="isTitled && {
      value: amount,
      currency: asset,
    } | formatMoney"
  >
    {{
      {
        value: amount,
        currency: asset,
      } | formatMoney
    }}
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
