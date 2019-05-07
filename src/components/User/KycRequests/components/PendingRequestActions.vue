<template>
  <div class="user-request">
    <div class="user-details-request__form-actions">
      <button
        class="app__btn user-request__btn"
        @click="approve"
      >
        Approve
      </button>

      <button
        class="app__btn app__btn-outline user-request__btn"
        @click="$emit(EVENTS.reviewed)"
      >
        Skip
      </button>

      <button
        class="app__btn app__btn--danger user-request__btn"
        @click="showRejectModal"
      >
        Reject
      </button>
    </div>

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
import { TextField } from '@comcom/fields'
import Modal from '@comcom/modals/Modal'

import { base } from '@tokend/js-sdk'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

const EVENTS = {
  reviewed: 'reviewed',
}

export default {
  name: 'user-details-request',
  components: {
    Modal,
    TextField,
  },

  props: {
    request: {
      type: ChangeRoleRequest,
      default: () => new ChangeRoleRequest({}),
    },
  },

  data () {
    return {
      rejectForm: {
        reason: '',
        isShown: false,
      },

      EVENTS,
    }
  },

  async created () {
    this.tasksToRemove = this.request.pendingTasks
  },

  methods: {
    async approve () {
      this.request.state = 'approved'
      const action = base.xdr.ReviewRequestOpAction.approve().value
      const approveOp = this.createReviewRequestOperation(action)

      this.$emit(EVENTS.reviewed, approveOp)
    },

    async reject () {
      this.request.state = 'rejected'
      const action = base.xdr.ReviewRequestOpAction.reject().value
      const rejectOp = this.createReviewRequestOperation(
        action, this.rejectForm.reason
      )

      this.$emit(EVENTS.reviewed, rejectOp)
    },

    createReviewRequestOperation (action, reason = '') {
      return base.ReviewRequestBuilder.reviewRequest({
        requestID: this.request.id,
        requestHash: this.request.hash,
        requestType: this.request.type,
        reviewDetails: {
          tasksToAdd: this.request.tasksToAdd || 0,
          tasksToRemove: this.request.tasksToRemove ||
            this.request.pendingTasks,
          externalDetails: '{}',
        },
        action,
        reason,
      })
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
.user-details-request__form-actions {
  display: flex;
  justify-content: space-between;
}

.user-request__btn {
  width: 100%;
  max-width: 15rem;
}
</style>
