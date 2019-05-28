<template>
  <div class="withdrawal-details">
    <h2>Withdrawal details</h2>

    <ul class="key-value-list">
      <li>
        <span>Request ID</span>
        <span>{{ request.id }}</span>
      </li>
      <li>
        <span>Request state</span>
        <verbose-formatter :string="request.state" />
      </li>
      <li>
        <span>Requestor</span>
        <email-getter :account-id="request.requestor.id" is-titled />
      </li>
      <li>
        <span>Requestor id</span>
        <span>{{ request.requestor.id }} </span>
      </li>
      <li>
        <span>Receiver address</span>
        <span :title="request.requestDetails.creatorDetails.address">
          {{ request.requestDetails.creatorDetails.address }}
        </span>
      </li>
      <li>
        <span>Source amount</span>
        <asset-amount-formatter
          :amount="request.requestDetails.amount"
        />
      </li>
      <li>
        <span>Fixed fee</span>
        <asset-amount-formatter
          :amount="request.requestDetails.fee.fixed"
        />
      </li>
      <li>
        <span>Percent fee</span>
        <asset-amount-formatter
          :amount="request.requestDetails.fee.calculatedPercent"
        />
      </li>
      <li>
        <span>Total fee</span>
        <asset-amount-formatter
          :amount="Number(request.requestDetails.fee.fixed) +
            Number(request.requestDetails.fee.calculatedPercent)"
        />
      </li>
    </ul>
    <div class="withdrawal-details__action-btns" v-if="reviewAllowed">
      <button
        class="app__btn withdrawal-details__action-btn"
        @click="fulfill(request)"
        :disabled="isSubmitting">
        Fulfill
      </button>

      <button
        class="app__btn app__btn--danger withdrawal-details__action-btn"
        @click="selectForRejection(request)"
        :disabled="isSubmitting">
        Reject
      </button>
    </div>

    <modal
      v-if="itemToReject"
      @close-request="clearRejectionSelection()"
      max-width="40rem">
      <form
        id="withdrawal-details-reject-form"
        @submit.prevent="reject(itemToReject) && clearRejectionSelection()">
        <div class="app__form-row">
          <text-field label="Enter reject reason" v-model="rejectForm.reason" />
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
import TextField from '@comcom/fields/TextField'

import { EmailGetter } from '@comcom/getters'
import { VerboseFormatter, AssetAmountFormatter } from '@comcom/formatters'

import Modal from '@comcom/modals/Modal'
import { confirmAction } from '@/js/modals/confirmation_message'

import api from '@/api'
import { REQUEST_STATES } from '@/constants'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    EmailGetter,
    VerboseFormatter,
    AssetAmountFormatter,
    Modal,
    TextField,
  },

  props: {
    request: { type: Object, required: true },
    assets: { type: Array, required: true },
  },

  data () {
    return {
      isSubmitting: false,
      itemToReject: null,
      rejectForm: {
        reason: '',
      },
      REQUEST_STATES,
    }
  },

  computed: {
    reviewAllowed () {
      return this.request.stateI === REQUEST_STATES.pending
    },
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
        ErrorHandler.process(error)
      }
      this.isSubmitting = false
    },

    async reject (request) {
      if (!this.reviewAllowed) return

      this.isSubmitting = true
      try {
        await api.requests.rejectWithdraw(
          {
            reason: this.rejectForm.reason,
            isPermanent: true,
          },
          request
        )

        this.$store.dispatch('SET_INFO', 'Request rejected succesfully.')
        this.$emit('close-request')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isSubmitting = false
    },

    selectForRejection (item) {
      this.itemToReject = item
      this.rejectForm.reason = ''
    },

    clearRejectionSelection () {
      this.itemToReject = null
    },
  },
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
