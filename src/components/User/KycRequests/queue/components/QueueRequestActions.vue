<template>
  <div class="queue-request-actions">
    <div class="queue-request-actions__manage-tasks-section">
      <tasks-manager
        v-model="decision.tasks"
        :request="decision.request"
      />
    </div>

    <div class="queue-request-actions__btn-blocks">
      <div class="queue-request-actions__btn-block">
        <button
          class="app__btn queue-request-actions__btn"
          @click="approve"
        >
          Approve
        </button>

        <button
          class="app__btn app__btn-outline queue-request-actions__btn"
          @click="skip"
        >
          Skip
        </button>

        <button
          class="app__btn app__btn--danger queue-request-actions__btn"
          @click="showRejectModal"
        >
          Reject
        </button>
      </div>

      <div class="queue-request-actions__btn-block">
        <button
          class="app__btn app__btn queue-request-actions__btn"
          @click="$emit(EVENTS.finished)"
        >
          Finish
        </button>
      </div>
    </div>

    <modal
      class="queue-request-actions__reject-modal"
      v-if="rejectForm.isShown"
      @close-request="hideRejectModal()"
      max-width="40rem"
    >
      <form
        class="queue-request-actions__reject-form"
        id="queue-request-actions-reject-form"
        @submit.prevent="submitRejectForm"
        novalidate
      >
        <div class="app__form-row">
          <text-field
            label="Reject reason"
            :autofocus="true"
            v-model="rejectForm.reason"
            :disabled="formMixin.isDisabled"
            @blur="touchField('rejectForm.reason')"
            :error-message="getFieldErrorMessage('rejectForm.reason')"
          />
        </div>
      </form>

      <div class="app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="queue-request-actions-reject-form"
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
import TasksManager from '@/components/User/Users/components/UserDetails/UserDetails.TasksManager'
import Modal from '@comcom/modals/Modal'

import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { ReviewDecision } from '../wrappers/ReviewDecision'

const EVENTS = {
  reviewed: 'reviewed',
  finished: 'finished',
}

const REJECT_REASON_MAX_LENGTH = 255

export default {
  name: 'queue-request-actions',
  components: {
    Modal,
    TasksManager,
  },
  mixins: [FormMixin],

  props: {
    decision: { type: ReviewDecision, required: true },
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
    approve () {
      this.decision.approve()
      this.$emit(EVENTS.reviewed)
    },

    reject () {
      this.decision.reject(this.rejectForm.reason)
      this.$emit(EVENTS.reviewed)
    },

    skip () {
      this.decision.skip()
      this.$emit(EVENTS.reviewed)
    },

    showRejectModal () {
      this.rejectForm.reason = ''
      this.rejectForm.isShown = true
    },

    hideRejectModal () {
      this.rejectForm.isShown = false
    },

    submitRejectForm () {
      if (!this.isFormValid()) return

      this.hideRejectModal()
      this.reject()
    },
  },
}
</script>

<style scoped>
.queue-request-actions__btn-blocks {
  display: flex;
  justify-content: space-between;
  margin-top: 4rem;
}

.queue-request-actions__btn-block {
  display: flex;
  margin: 0 -1rem;
}

.queue-request-actions__btn {
  width: 100%;
  max-width: 15rem;
  margin: 0 1rem;
}
</style>
