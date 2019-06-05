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
        <span>Requestor ID</span>
        <span>{{ request.requestor.id }} </span>
      </li>
      <template v-if="request.requestDetails.creatorDetails.comment">
        <li>
          <span>Comment</span>
          <span :title="request.requestDetails.creatorDetails.comment">
            {{ request.requestDetails.creatorDetails.comment }}
          </span>
        </li>
        <li>
          <span>Hash</span>
          <span :title="request.hash">
            {{ request.hash }}
          </span>
        </li>
      </template>
      <template v-if="request.requestDetails.creatorDetails.address">
        <li>
          <span>Receiver address</span>
          <span :title="request.requestDetails.creatorDetails.address">
            {{ request.requestDetails.creatorDetails.address }}
          </span>
        </li>
      </template>
      <li>
        <span>Amount</span>
        <asset-amount-formatter
          :amount="request.requestDetails.amount"
          :asset="request.requestDetails.asset.id"
        />
      </li>
      <li>
        <span>Fixed fee</span>
        <asset-amount-formatter
          :amount="request.requestDetails.fee.fixed"
          :asset="request.requestDetails.asset.id"
        />
      </li>
      <li>
        <span>Percent fee</span>
        <asset-amount-formatter
          :amount="request.requestDetails.fee.calculatedPercent"
          :asset="request.requestDetails.asset.id"
        />
      </li>
      <li>
        <span>Total fee</span>
        <asset-amount-formatter
          :amount="Number(request.requestDetails.fee.fixed) +
            Number(request.requestDetails.fee.calculatedPercent)"
          :asset="request.requestDetails.asset.id"
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
      max-width="40rem"
    >
      <form
        id="withdrawal-details-reject-form"
        @submit.prevent="reject(itemToReject) && clearRejectionSelection()"
        novalidate
      >
        <div class="app__form-row">
          <text-field
            label="Enter reject reason"
            v-model="rejectForm.reason"
            :disabled="formMixin.isDisabled"
            @blur="touchField('rejectForm.reason')"
            :error-message="getFieldErrorMessage(
              'rejectForm.reason',
              { maxLength: REJECT_REASON_MAX_LENGTH }
            )"
          />
        </div>
      </form>

      <div class="app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="withdrawal-details-reject-form"
          :disabled="formMixin.isDisabled">
          Reject
        </button>
        <button
          class="app__btn-secondary"
          @click="clearRejectionSelection"
          :disabled="formMixin.isDisabled">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { EmailGetter } from '@comcom/getters'
import { VerboseFormatter, AssetAmountFormatter } from '@comcom/formatters'

import Modal from '@comcom/modals/Modal'
import { confirmAction } from '@/js/modals/confirmation_message'

import apiHelper from '@/apiHelper'
import { REQUEST_STATES } from '@/constants'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/state-bus'

const REJECT_REASON_MAX_LENGTH = 255

export default {
  components: {
    EmailGetter,
    VerboseFormatter,
    AssetAmountFormatter,
    Modal,
  },
  mixins: [FormMixin],

  props: {
    request: { type: Object, required: true },
  },

  data () {
    return {
      isSubmitting: false,
      itemToReject: null,
      rejectForm: {
        reason: '',
      },
      REQUEST_STATES,
      REJECT_REASON_MAX_LENGTH,
    }
  },

  validations () {
    return {
      rejectForm: {
        reason: {
          required,
          maxLength: maxLength(REJECT_REASON_MAX_LENGTH),
        },
      },
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
        await apiHelper.requests.approveWithdraw(request)
        Bus.success('Request fulfilled successfully.')
        this.$emit('close-request')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isSubmitting = false
    },

    async reject (request) {
      if (!this.reviewAllowed || !this.isFormValid()) return

      this.disableForm()
      try {
        await apiHelper.requests.rejectWithdraw(
          {
            reason: this.rejectForm.reason,
            isPermanent: true,
          },
          request
        )

        Bus.success('Request rejected succesfully.')
        this.$emit('close-request')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
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
