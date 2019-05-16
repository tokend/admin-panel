<template>
  <div class="quote-fiat-currency">
    {{ convertedAmount }}
  </div>
</template>

<script>
import { Sdk } from '@/sdk'
import { formatFiatAmount } from '@/utils/formatters'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  props: {
    amount: { type: String, required: true },
    sourceAsset: { type: String, required: true },
  },

  data: _ => ({
    destAsset: 'USD',
    convertedAmount: '',
  }),

  created: function () {
    this.convertAssetPairs()
  },

<<<<<<< HEAD
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
=======
  methods: {
    async convertAssetPairs () {
      if (this.amount && this.sourceAsset) {
        try {
          const convertedAmount = await Sdk.horizon.assetPairs.convert({
            'source_asset': this.sourceAsset,
            'dest_asset': this.destAsset,
            'amount': this.amount,
          })
          this.convertedAmount = formatFiatAmount(
            +convertedAmount.data.amount, this.destAsset
          )
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
>>>>>>> master
        }
      }
    },
  },
}
</script>
