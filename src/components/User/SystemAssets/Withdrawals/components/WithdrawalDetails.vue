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
        <span :title="request.details.withdraw.creatorDetails.address">{{request.details.withdraw.creatorDetails.address}}</span>
      </li>
      <template v-if="request.details.withdraw.reviewerDetails">
        <li>
          <span>Hash</span>
          <span :title="request.details.withdraw.reviewerDetails.hash">{{request.details.withdraw.reviewerDetails.hash}}</span>
        </li>
        <li>
          <span>Transaction</span>
          <span :title="request.details.withdraw.reviewerDetails.tx">{{request.details.withdraw.reviewerDetails.tx}}</span>
        </li>
      </template>
      <li>
        <span>Source amount</span>
        <asset-amount-formatter :amount="request.details.withdraw.amount" :asset="request.details.withdraw.destAssetCode" />
      </li>
      <li>
        <span>Destination amount</span>
        <asset-amount-formatter :amount="request.details.withdraw.destAssetAmount" :asset="request.details.withdraw.destAssetCode" />
      </li>
      <li>
        <span>Fixed fee</span>
        <asset-amount-formatter :amount="request.details.withdraw.fixedFee" :asset="request.details.withdraw.destAssetCode" />
      </li>
      <li>
        <span>Percent fee</span>
        <asset-amount-formatter :amount="request.details.withdraw.percentFee" :asset="request.details.withdraw.destAssetCode" />
      </li>
      <li>
        <span>Total fee</span>
        <asset-amount-formatter
          :amount="Number(request.details.withdraw.fixedFee) + Number(request.details.withdraw.percentFee)"
          :asset="request.details.withdraw.destAssetCode"
        />
      </li>
    </ul>
    <div class="withdrawal-details__action-btns" v-if="reviewAllowed">
      <button class="app__btn withdrawal-details__action-btn"
              @click="fulfill(request)"
              :disabled="isSubmitting">
        Fulfill
      </button>

      <button class="app__btn app__btn--danger withdrawal-details__action-btn"
              @click="selectForRejection(request)"
              :disabled="isSubmitting">
        Reject
      </button>
    </div>

    <modal v-if="itemToReject"
            @close-request="clearRejectionSelection()"
            max-width="40rem">
      <form id="withdrawal-details-reject-form"
            @submit.prevent="reject(itemToReject) && clearRejectionSelection()">
        <div class="app__form-row">
          <text-field label="Enter reject reason" v-model="rejectForm.reason"/>
        </div>
      </form>

      <div class="app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="withdrawal-details-reject-form"
          :disabled="isSubmitting">
          Reject
        </button>
        <button
          class="app__btn-secondary"
          @click="clearRejectionSelection"
          :disabled="isSubmitting">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import { VerboseFormatter, AssetAmountFormatter } from '@comcom/formatters'
import api from '@/api'
import { confirmAction } from '@/js/modals/confirmation_message'
import Modal from '@comcom/modals/Modal'
import TextField from '@comcom/fields/TextField'
import { ASSET_POLICIES } from '@/constants'

export default {
  components: {
    EmailGetter,
    VerboseFormatter,
    AssetAmountFormatter,
    Modal,
    TextField
  },

  data () {
    return {
      isSubmitting: false,
      itemToReject: null,
      rejectForm: {
        reason: ''
      },
      ASSET_POLICIES
    }
  },
  props: ['request', 'assets'],
  computed: {
    reviewAllowed () {
      return this.assets
        .find(item => item.code === this.request.details.withdraw.destAssetCode)
        .policy & ASSET_POLICIES.withdrawable
    }
  },
  methods: {
    async fulfill (request) {
      if (!this.reviewAllowed) return
      if (!await confirmAction()) return
      this.isSubmitting = true
      try {
        await api.requests.approveWithdraw(request)
        this.$store.dispatch('SET_INFO', 'Request fulfilled succesfully.')
        this.$emit('close-request')
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isSubmitting = false
    },
    async reject (request) {
      if (!this.reviewAllowed) return
      this.isSubmitting = true
      try {
        await api.requests.rejectWithdraw({
          reason: this.rejectForm.reason,
          isPermanent: true
        },
        request)
        this.$store.dispatch('SET_INFO', 'Request rejected succesfully.')
        this.$emit('close-request')
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isSubmitting = false
    },
    selectForRejection (item) {
      this.itemToReject = item
      this.rejectForm.reason = ''
    },
    clearRejectionSelection () {
      this.itemToReject = null
    }
  }
}
</script>

<style scoped lang="scss">
  .withdrawal-details__action-btns {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-top: 4rem;
  }

  .withdrawal-details__action-btn {
    margin-right: 1rem;
    max-width: 15rem;
  }
</style>
