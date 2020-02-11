<template>
  <div class="withdrawal-details">
    <h2>{{ "withdrawal-details.header" | globalize }}</h2>

    <ul class="key-value-list">
      <li>
        <span>{{ "withdrawal-details.request-id" | globalize }}</span>
        <span>{{ request.id }}</span>
      </li>
      <li>
        <span>{{ "withdrawal-details.request-state" | globalize }}</span>
        <verbose-formatter :string="request.state" />
      </li>
      <li>
        <span>{{ "withdrawal-details.requestor" | globalize }}</span>
        <email-getter :account-id="request.requestor.id" is-titled />
      </li>
      <li>
        <span>{{ "withdrawal-details.requestor-id" | globalize }}</span>
        <span>{{ request.requestor.id }} </span>
      </li>
      <template v-if="request.requestDetails.creatorDetails.comment">
        <li>
          <span>{{ "withdrawal-details.comment" | globalize }}</span>
          <span :title="request.requestDetails.creatorDetails.comment">
            {{ request.requestDetails.creatorDetails.comment }}
          </span>
        </li>
        <li>
          <span>{{ "withdrawal-details.hash" | globalize }}</span>
          <span :title="request.hash">
            {{ request.hash }}
          </span>
        </li>
      </template>
      <template v-if="request.requestDetails.creatorDetails.address">
        <li>
          <span>{{ "withdrawal-details.receiver-address" | globalize }}</span>
          <span :title="request.requestDetails.creatorDetails.address">
            {{ request.requestDetails.creatorDetails.address }}
          </span>
        </li>
      </template>
      <li>
        <span>{{ "WithdrawalDetails.amount" | globalize }}</span>
        <asset-amount-formatter
          :amount="request.requestDetails.amount"
          :asset="request.requestDetails.asset.id"
        />
      </li>
      <li>
        <span>{{ "withdrawal-details.fixed-fee" | globalize }}</span>
        <asset-amount-formatter
          :amount="request.requestDetails.fee.fixed"
          :asset="request.requestDetails.asset.id"
        />
      </li>
      <li>
        <span>{{ "withdrawal-details.persent-fee" | globalize }}</span>
        <asset-amount-formatter
          :amount="request.requestDetails.fee.calculatedPercent"
          :asset="request.requestDetails.asset.id"
        />
      </li>
      <li>
        <span>{{ "withdrawal-details.total-fee" | globalize }}</span>
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
        :disabled="isSubmitting"
      >
        {{ "withdrawal-details.btn-fulfill" | globalize }}
      </button>

      <button
        class="app__btn app__btn--danger withdrawal-details__action-btn"
        @click="selectForRejection(request)"
        :disabled="isSubmitting"
      >
        {{ "withdrawal-details.btn-reject" | globalize }}
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
            :label="'withdrawal-details.lbl-enter-reject-reason' | globalize"
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
          :disabled="formMixin.isDisabled"
        >
          {{ "withdrawal-details.form-reject" | globalize }}
        </button>
        <button
          class="app__btn-secondary"
          @click="clearRejectionSelection"
          :disabled="formMixin.isDisabled"
        >
          {{ "withdrawal-details.form-cancel" | globalize }}
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
import { Bus } from '@/utils/bus'

import { mapGetters } from 'vuex'
import { getters } from '@store/types'

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
    ...mapGetters({ userAddress: getters.GET_USER_ADDRESS }),
    reviewAllowed () {
      return this.request.stateI === REQUEST_STATES.pending.stateI &&
        this.userAddress === this.request.reviewer.id
    },
  },

  methods: {
    async fulfill (request) {
      if (!this.reviewAllowed) return
      if (!(await confirmAction())) return

      this.isSubmitting = true
      try {
        await apiHelper.requests.approveWithdraw(request)
        Bus.success('withdrawal-details.request-fulfilled-successfully')
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

        Bus.success('withdrawal-details.request-rejected-successfully')
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
