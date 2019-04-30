<template>
  <div class="user-request">
    <template v-if="requestToReview.isPending">
      <div class="user-details-request__manage-tasks-section">
        <h3 class="user-details-request__manage-tasks-title">
          Manage tasks (advanced)
        </h3>

        <h4 class="user-details-request__task-section-heading">
          Current state
        </h4>

        <div class="user-details-request__task-section-content">
          <p>Pending tasks: {{ requestToReview.pendingTasks }}</p>
          <p>All tasks: {{ requestToReview.allTasks }}</p>
        </div>

        <h4 class="user-details-request__task-section-heading">
          Tasks to add
        </h4>

        <div class="user-details-request__task-section-content">
          <!--eslint-disable max-len-->
          <tick-field
            class="app__form-field"
            v-model="tasksToAdd"
            :label="`Submit auto verification request (${CHANGE_ROLE_TASKS.submitAutoVerification})`"
            :cb-value="CHANGE_ROLE_TASKS.submitAutoVerification"
            :disabled="isPending"
          />
          <!--eslint-enable max-len-->

          <!--eslint-disable max-len-->
          <tick-field
            class="app__form-field"
            v-model="tasksToAdd"
            :label="`Complete auto verification request (${CHANGE_ROLE_TASKS.completeAutoVerification})`"
            :cb-value="CHANGE_ROLE_TASKS.completeAutoVerification"
            :disabled="isPending"
          />
          <!--eslint-enable max-len-->

          <!--eslint-disable max-len-->
          <tick-field
            class="app__form-field"
            v-model="tasksToAdd"
            :label="`Manual review required (${CHANGE_ROLE_TASKS.manualReviewRequired})`"
            :cb-value="CHANGE_ROLE_TASKS.manualReviewRequired"
            :disabled="isPending"
          />
          <!--eslint-enable max-len-->

          <tick-field
            class="app__form-field"
            v-model="tasksToAdd"
            :label="`Default (${CHANGE_ROLE_TASKS.default})`"
            :cb-value="CHANGE_ROLE_TASKS.default"
            :disabled="isPending"
          />
        </div>

        <h4 class="user-details-request__task-section-heading">
          Tasks to remove
        </h4>

        <div class="user-details-request__task-section-content">
          <!--eslint-disable max-len-->
          <tick-field
            class="app__form-field"
            v-model="tasksToRemove"
            :label="`Submit auto verification request (${CHANGE_ROLE_TASKS.submitAutoVerification})`"
            :cb-value="CHANGE_ROLE_TASKS.submitAutoVerification"
            :disabled="isPending"
          />
          <!--eslint-enable max-len-->

          <!--eslint-disable max-len-->
          <tick-field
            class="app__form-field"
            v-model="tasksToRemove"
            :label="`Complete auto verification request (${CHANGE_ROLE_TASKS.completeAutoVerification})`"
            :cb-value="CHANGE_ROLE_TASKS.completeAutoVerification"
            :disabled="isPending"
          />
          <!--eslint-enable max-len-->

          <!--eslint-disable max-len-->
          <tick-field
            class="app__form-field"
            v-model="tasksToRemove"
            :label="`Manual review required (${CHANGE_ROLE_TASKS.manualReviewRequired})`"
            :cb-value="CHANGE_ROLE_TASKS.manualReviewRequired"
            :disabled="isPending"
          />
          <!--eslint-enable max-len-->

          <tick-field
            class="app__form-field"
            v-model="tasksToRemove"
            :label="`Default (${CHANGE_ROLE_TASKS.default})`"
            :cb-value="CHANGE_ROLE_TASKS.default"
            :disabled="isPending"
          />
        </div>
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
      >
        <div class="app__form-row">
          <text-field
            label="Reject reason"
            :autofocus="true"
            v-model="rejectForm.reason"
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
import config from '@/config'

import { TextField, TickField } from '@comcom/fields'
import Modal from '@comcom/modals/Modal'

import 'mdi-vue/ChevronDownIcon'
import 'mdi-vue/ChevronUpIcon'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

const EVENTS = {
  reviewed: 'reviewed',
}

export default {
  name: 'user-details-request',
  components: {
    Modal,
    TextField,
    TickField,
  },

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
      tasksToAdd: 0,
      tasksToRemove: 0,

      rejectForm: {
        reason: '',
        isShown: false,
      },
      isShownAdvanced: false,
      isPending: false,

      CHANGE_ROLE_TASKS: config.CHANGE_ROLE_TASKS,
    }
  },

  async created () {
    this.tasksToRemove = this.requestToReview.pendingTasks
  },

  methods: {
    async approve () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }
      this.isPending = true
      try {
        const reviewDetails = this.requestToReview.record.reviewDetails || {}
        reviewDetails.tasksToAdd = this.tasksToAdd
        reviewDetails.tasksToRemove = this.tasksToRemove

        await api.requests.approve({
          ...this.requestToReview.record,
          reviewDetails,
        })

        this.$store.dispatch('SET_INFO', 'Request approved successfully')
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
        this.$store.dispatch('SET_INFO', `Request rejected successfully`)
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

.user-details-request__manage-tasks-title {
  margin-bottom: 1.5rem;
}

.user-details-request__task-section-heading {
  margin-bottom: 1rem;
}

.user-details-request__task-section-content {
  margin-bottom: 2rem;
}
</style>
