<template>
  <div class="issuance-details">
    <div class="issuance-details app__block">
      <h2>Issuance details</h2>
      <template v-if="isLoaded">
        <ul class="key-value-list">
          <li class="issuance-details__list-item">
            <span>ID</span>
            <span>{{ issuance.id }}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>Date</span>
            <span>{{ issuance.createdAt | dateTime }}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>Initiator</span>
            <span>{{ issuance.requestor.id }}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>Initiator (Email)</span>
            <span>
              <email-getter :account-id="issuance.requestor.id" is-titled />
            </span>
          </li>
          <li class="issuance-details__list-item">
            <span>Value</span>
            <span>
              {{ localize(issuance.requestDetails.amount) }}
              {{ issuance.requestDetails.asset.id }}
            </span>
          </li>
          <li class="issuance-details__list-item">
            <span>State</span>
            <span>
              {{ issuance.state | localizeIssuanceRequestState }}
            </span>
          </li>
        </ul>
        <template v-if="issuance.stateI === REQUEST_STATES.pending">
          <div class="issuance-details__action-btns">
            <!-- eslint-disable max-len -->
            <button
              class="app__btn issuance-details__action-btn"
              @click="fulfill(issuance)"
              :disabled="isSubmitting || issuance.stateI !== REQUEST_STATES.pending"
            >
              Fulfill
            </button>

            <button
              class="app__btn app__btn--danger issuance-details__action-btn"
              @click="selectForRejection(issuance)"
              :disabled="isSubmitting || issuance.stateI !== REQUEST_STATES.pending"
            >
              Reject
            </button>
            <!-- eslint-enable max-len -->
          </div>
        </template>
      </template>
      <template v-else>
        <span class="issuance-details__list-item">
          Loading...
        </span>
      </template>
      <modal
        v-if="itemToReject"
        @close-request="clearRejectionSelection()"
        max-width="40rem"
      >
        <form
          class="issuance-rl__reject-form"
          id="issuance-rl-reject-form"
          @submit.prevent="reject(itemToReject)"
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

        <div class="issuance-rl__reject-form-actions app__form-actions">
          <button
            class="app__btn app__btn--danger"
            form="issuance-rl-reject-form"
            :disabled="formMixin.isDisabled"
          >
            Reject
          </button>
          <button
            class="app__btn-secondary"
            @click="clearRejectionSelection"
            :disabled="formMixin.isDisabled"
          >
            Cancel
          </button>
        </div>
      </modal>
    </div>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { EmailGetter } from '@comcom/getters'

import Modal from '@comcom/modals/Modal'
import { confirmAction } from '../../../../js/modals/confirmation_message'

import apiHelper from '@/apiHelper'
import { REQUEST_STATES } from '@/constants'

import localize from '@/utils/localize'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

const REJECT_REASON_MAX_LENGTH = 255

export default {
  components: {
    EmailGetter,
    Modal,
  },
  mixins: [FormMixin],

  props: {
    id: { type: String, required: true },
  },

  data: _ => ({
    REQUEST_STATES,
    issuance: null,
    itemToReject: null,
    isRejectionModalShown: false,
    isSubmitting: false,
    isLoaded: false,
    rejectForm: {
      reason: '',
    },
    REJECT_REASON_MAX_LENGTH,
  }),

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

  async created () {
    await this.getIssuance(this.id)
    this.isLoaded = true
  },

  methods: {
    localize,

    async getIssuance (id) {
      try {
        this.issuance = await apiHelper.requests.get(id)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async fulfill (issuance) {
      this.isSubmitting = true
      if (await confirmAction()) {
        try {
          let tasksToRemove = issuance.pendingTasks
          if (tasksToRemove & 1) tasksToRemove -= 1
          if (tasksToRemove & 4) tasksToRemove -= 4

          await apiHelper.requests.approve({
            ...issuance,
            reviewDetails: { tasksToRemove },
          })

          await this.getIssuance(this.id)
          Bus.success('Request fulfilled successfully.')
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
        this.isSubmitting = false
      } else {
        this.isSubmitting = false
      }
    },

    selectForRejection (item) {
      this.itemToReject = item
      this.rejectForm.reason = ''
    },

    async reject (issuance) {
      if (!this.isFormValid()) return

      this.disableForm()
      try {
        let tasksToRemove = issuance.pendingTasks
        if (tasksToRemove & 1) tasksToRemove -= 1
        if (tasksToRemove & 4) tasksToRemove -= 4

        await apiHelper.requests.reject(
          { reason: this.rejectForm.reason, isPermanent: true },
          {
            ...issuance,
            reviewDetails: { tasksToRemove },
          }
        )

        await this.getIssuance(this.id)
        this.clearRejectionSelection()
        Bus.success('Request rejected successfully.')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },

    clearRejectionSelection () {
      this.itemToReject = null
    },
  },
}
</script>

<style scoped>
.issuance-details.app__block {
  max-width: 64rem;
}

.issuance-details__list-item {
  padding: 0.3rem 0.8rem;
  margin: 0 -0.8rem;
  display: flex;
  justify-content: space-between;
}

.issuance-details__action-btns {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-top: 4rem;
}

.issuance-details__action-btn {
  margin-right: 1rem;
  max-width: 15rem;
}
</style>
