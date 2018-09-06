<template>
  <span class="asset-amount-formatter">
    {{formatAssetAmount(amount, asset)}}
  </span>
</template>

<script>
import { formatAssetAmount } from '@/utils/formatters'
export default {
  props: ['amount', 'asset'],

  methods: {
    formatAssetAmount
  }
}
</script>

<style scoped>

</style>
