<template>
  <div class="quote-fiat-currency">
    {{ convertedAmount }}
  </div>
</template>
<script>
  import { Sdk } from '@/sdk'
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
            // TODO: No /v3 endpoint for asset pairs convert yet
            const convertedAmount = await Sdk.horizon.assetPairs.convert({
              'source_asset': this.sourceAsset,
              'dest_asset': this.destAsset,
              'amount': this.amount
            })
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
