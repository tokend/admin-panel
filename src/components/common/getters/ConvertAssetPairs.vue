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
        }
      }
    },
  },
}
</script>
