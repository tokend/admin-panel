-<template>
  <div class="request-action">
    <template v-if="requestToReview.isPending">
      <div class="app__form-actions user-details-request__form-actions">
        <button
          class="app__btn request-action__btn"
          @click="approve"
          :disabled="isPending"
        >
          {{ "kyc-recovery-request-action.btn-approve" | globalize }}
        </button>

        <button
          class="app__btn app__btn--danger request-action__btn"
          @click="showRejectModal"
          :disabled="isPending"
        >
          {{ "kyc-recovery-request-action.btn-reject" | globalize }}
        </button>
      </div>
    </template>

    <template v-else-if="requestToReview.isRejected">
      <button
        class="app__btn app__btn--danger request-action__btn"
        @click="reject(true)"
        :disabled="isPending"
      >
        {{ "kyc-recovery-request-action.btn-reject-perm" | globalize }}
      </button>
    </template>

    <modal
      class="request-action__reject-modal"
      v-if="rejectForm.isShown"
      @close-request="hideRejectModal()"
      max-width="40rem"
    >
      <form
        class="request-action__reject-form"
        id="request-action-reject-form"
        @submit.prevent="submitRejectForm"
        novalidate
      >
        <div class="app__form-row">
          <text-field
            :label="'kyc-recovery-request-action.lbl-reject-reason' | globalize"
            :autofocus="true"
            v-model="rejectForm.reason"
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
          form="request-action-reject-form"
        >
          {{ "kyc-recovery-request-action.form-btn-reject" | globalize }}
        </button>
        <button
          class="app__btn-secondary"
          @click="hideRejectModal"
        >
          {{ "kyc-recovery-request-action.form-btn-cancel" | globalize }}
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import apiHelper from '@/apiHelper'
import { globalize } from '@/components/App/filters/filters'
import Modal from '@comcom/modals/Modal'

import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'
import { Bus } from '@/utils/bus'

import { KycRecoveryRequest } from '@/apiHelper/responseHandlers/requests/KycRecoveryRequest'
import { ChangeRoleRequest } from '@/apiHelper/responseHandlers/requests/ChangeRoleRequest'

const EVENTS = {
  reviewed: 'reviewed',
}

const REJECT_REASON_MAX_LENGTH = 255

export default {
  name: 'request-actions',
  components: {
    Modal,
  },
  mixins: [FormMixin],

  props: {
    requestToReview: {
      type: KycRecoveryRequest,
      default: () => new KycRecoveryRequest({}),
    },
    latestApprovedRequest: {
      type: ChangeRoleRequest,
      default: () => new ChangeRoleRequest({}),
    },
    user: {
      type: Object,
      default: () => ({}),
    },
  },

  data () {
    return {
      rejectForm: {
        reason: '',
        isShown: false,
      },
      isShownAdvanced: false,
      isPending: false,
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

  methods: {
    async approve () {
      if (
        !(await confirmAction(globalize('kyc-recovery-request-action.confirm-message')))
      ) {
        return
      }
      this.isPending = true
      try {
        const reviewDetails = this.requestToReview.record.reviewDetails || {}

        await apiHelper.requests.approve({
          ...this.requestToReview.record,
          reviewDetails,
        })

        Bus.success('kyc-recovery-request-action.request-approved-successfully')
        this.$emit(EVENTS.reviewed)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async reject (isPermanent = false) {
      if (
        !(await confirmAction(globalize('kyc-recovery-request-action.confirm-message')))
      ) {
        return
      }
      this.isPending = true
      const rejectReason = this.rejectForm.reason
      try {
        await apiHelper.requests.reject(
          { reason: rejectReason, isPermanent },
          {
            ...this.requestToReview.record,
            reviewDetails: { tasksToRemove: 0 },
          }
        )
        Bus.success('kyc-recovery-request-action.request-rejected-successfully')
        this.$emit(EVENTS.reviewed)
      } catch (error) {
        this.isPending = false
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    showRejectModal () {
      this.rejectForm.reason = ''
      this.rejectForm.isShown = true
    },

    hideRejectModal () {
      this.rejectForm.isShown = false
    },

    async submitRejectForm () {
      if (!this.isFormValid()) return

      this.hideRejectModal()
      await this.reject()
    },
  },
}
</script>

<style scoped>
.request-action__btn {
  width: 15rem;
}
</style>
