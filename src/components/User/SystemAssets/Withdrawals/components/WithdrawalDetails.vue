<template>
  <div class="withdrawal-details">
    <h2>Withdrawal details</h2>

    <ul class="key-value-list">
      <li>
        <span>Request ID</span>
        <span>{{request.id}}</span>
      </li>
      <li>
        <span>Request state</span>
        <verbose-formatter :string="request.requestState" />
      </li>
      <li>
        <span>Requestor</span>
        <email-getter :address="request.requestor" is-titled />
      </li>
      <li>
        <span>Requestor id</span>
        <span>{{ request.requestor }} </span>
      </li>
      <li>
        <span>Receiver address</span>
        <span :title="request.externalDetails.address">{{request.externalDetails.address}}</span>
      </li>
      <template v-if="request.reviewerDetails">
        <li>
          <span>Hash</span>
          <span :title="request.reviewerDetails.hash">{{request.reviewerDetails.hash}}</span>
        </li>
        <li>
          <span>Transaction</span>
          <span :title="request.reviewerDetails.tx">{{request.reviewerDetails.tx}}</span>
        </li>
      </template>
      <li>
        <span>Source amount</span>
        <asset-amount-formatter :amount="request.amount" :asset="request.destAssetCode" />
      </li>
      <li>
        <span>Destination amount</span>
        <asset-amount-formatter :amount="request.destAssetAmount" :asset="request.destAssetCode" />
      </li>
      <li>
        <span>Fixed fee</span>
        <asset-amount-formatter :amount="request.fixedFee" :asset="request.destAssetCode" />
      </li>
      <li>
        <span>Percent fee</span>
        <asset-amount-formatter :amount="request.percentFee" :asset="request.destAssetCode" />
      </li>
      <li>
        <span>Total fee</span>
        <asset-amount-formatter
          :amount="Number(request.fixedFee) + Number(request.percentFee)"
          :asset="request.destAssetCode"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import { VerboseFormatter, AssetAmountFormatter } from '@comcom/formatters'

export default {
  components: {
    EmailGetter,
    VerboseFormatter,
    AssetAmountFormatter
  },

  props: ['request']
}
</script>

<style scoped>

</style>
