<template>
  <div class="user-request">
    <template v-if="requestToReview.isPending">
      <div class="user-details-request__manage-tasks-section">
        <tasks-manager
          v-model="tasks"
          :request="requestToReview"
          :is-pending="isPending"
        />
      </div>

      <div class="app__form-actions user-details-request__form-actions">
        <button
          class="app__btn user-request__btn"
          @click="approve"
          :disabled="isPending"
        >
          Approve
        </button>

        <button
          class="app__btn app__btn--danger user-request__btn"
          @click="showRejectModal"
          :disabled="isPending"
        >
          Reject
        </button>
      </div>
    </template>

    <template v-else-if="requestToReview.isRejected">
      <button
        class="app__btn app__btn--danger user-request__btn"
        @click="reject(true)"
        :disabled="isPending"
      >
        Reject permanently
      </button>
    </template>

    <modal
      class="user-request__reject-modal"
      v-if="rejectForm.isShown"
      @close-request="hideRejectModal()"
      max-width="40rem"
    >
      <form
        class="user-request__reject-form"
        id="user-request-reject-form"
        @submit.prevent="submitRejectForm"
        novalidate
      >
        <div class="app__form-row">
          <text-field
            label="Reject reason"
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
          form="user-request-reject-form"
        >
          Reject
        </button>
        <button
          class="app__btn-secondary"
          @click="hideRejectModal"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import api from '@/api'

import TasksManager from './UserDetails.TasksManager'
import Modal from '@comcom/modals/Modal'

import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import 'mdi-vue/ChevronDownIcon'
import 'mdi-vue/ChevronUpIcon'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'
import { Bus } from '@/utils/state-bus'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

const EVENTS = {
  reviewed: 'reviewed',
}

const REJECT_REASON_MAX_LENGTH = 255

export default {
  name: 'user-details-request',
  components: {
    Modal,
    TasksManager,
  },
  mixins: [FormMixin],

  props: {
    requestToReview: {
      type: ChangeRoleRequest,
      default: () => new ChangeRoleRequest({}),
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
      tasks: {},
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
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }
      this.isPending = true
      try {
        const reviewDetails = this.requestToReview.record.reviewDetails || {}
        reviewDetails.tasksToAdd = this.tasks.toAdd
        reviewDetails.tasksToRemove = this.tasks.toRemove

        await api.requests.approve({
          ...this.requestToReview.record,
          reviewDetails,
        })

        Bus.success('Request approved successfully')
        this.$emit(EVENTS.reviewed)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async reject (isPermanent = false) {
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }
      this.isPending = true
      const rejectReason = this.rejectForm.reason ||
        this.requestToReview.rejectReason
      try {
        await api.requests.reject(
          { reason: rejectReason, isPermanent },
          {
            ...this.requestToReview.record,
            reviewDetails: { tasksToRemove: 0 },
          }
        )
        Bus.success(`Request rejected successfully`)
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
.user-request__btn {
  width: 15rem;
}
</style>
