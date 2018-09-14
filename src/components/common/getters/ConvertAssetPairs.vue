<template>
  <div class="quote-fiat-currency">
    {{ convertedAmount }}
  </div>
</template>
<script>
  import api from '@/api'
  import { formatFiatAmount } from '@/utils/formatters'

  export default {
    props: ['amount', 'sourceAsset'],
    data: _ => ({
      destAsset: 'USD',
      convertedAmount: ''
    }),
    methods: {
      async convertAssetPairs () {
        if (this.amount && this.sourceAsset) {
          try {
            const convertedAmount = await api.assets.convertAssetPairs(this.sourceAsset, this.destAsset, this.amount)
            this.convertedAmount = formatFiatAmount(+convertedAmount.data.amount, this.destAsset)
          } catch (error) {
            console.error(error)
          }
        }
      }
    },
    created: function () {
      this.convertAssetPairs()
    }
  }
</script>
<style scoped lang="scss">
</style>
