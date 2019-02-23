<template>
  <div class="user-request">
    <h3>Latest request</h3>
    <p class="user-request__block text">
      Create a {{ requestToReview.requestDetails.accountRoleToSet | roleIdToString | lowerCase }} account:
      {{ requestToReview.state }}
    </p>

    <template v-if="RENDERED_TASKS_TO_ADD.includes(REVIEW_TASKS.nonLatinDocs)">
      <div
        class="user-request__block"
        v-if="hasManualTasks"
      >
        <h3>Details</h3>
        <tick-field
          v-model="details.tasksToAdd"
          :label="REVIEW_TASKS_VOCABULARY[REVIEW_TASKS.nonLatinDocs]"
          :cb-value="REVIEW_TASKS.nonLatinDocs"
        />
      </div>
    </template>

    <template v-if="RENDERED_TASKS_TO_REMOVE.length || RENDERED_TASKS_TO_ADD.length">
      <div
        class="user-request__block"
        v-if="isRequestPending"
      >
        <div class="user-request__heading">
          <h3>Advanced</h3>
          <button
            class="app__btn-secondary app__btn-secondary--iconed"
            @click="isShownAdvanced = !isShownAdvanced"
          >
            <mdi-chevron-up-icon v-if="isShownAdvanced" />
            <mdi-chevron-down-icon v-else />
          </button>
        </div>

        <template v-if="isShownAdvanced">
          <h4 v-if="RENDERED_TASKS_TO_REMOVE.length">Tasks to remove</h4>
          <template v-for="(task, t) in RENDERED_TASKS_TO_REMOVE">
            <tickField
              :key="`user-details-request-${task}-1-${t}`"
              class="user-request__tick-field"
              v-model="details.tasksToRemove"
              v-if="task !== 0"
              :cb-value="task"
              :label="REVIEW_TASKS_VOCABULARY[task]"
            />
          </template>
          <h4 v-if="RENDERED_TASKS_TO_ADD.length">Tasks to add</h4>
          <template v-for="(task, t) in RENDERED_TASKS_TO_ADD">
            <tickField
              :key="`user-details-request-${task}-2-${t}`"
              class="user-request__tick-field"
              v-model="details.tasksToAdd"
              v-if="task !== 0"
              :cb-value="task"
              :label="REVIEW_TASKS_VOCABULARY[task]"
            />
          </template>
        </template>

      </div>
    </template>

    <template v-if="hasManualTasks || (isShownAdvanced && isRequestPending)">
      <div class="app__form-actions user-details-request__form-actions">
        <button
          class="app__btn"
          @click="approve"
          :disabled="isPending"
        >
          {{ isShownAdvanced ? 'Update request state' : 'Approve' }}
        </button>

        <button
          class="app__btn-secondary"
          @click="showRejectModal"
          :disabled="isPending"
        >
          Reject
        </button>
      </div>
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
        @submit.prevent="hideRejectModal() || reject()"
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
import {
  USER_STATES_STR,
  USER_TYPES_STR,
  REQUEST_STATES_STR,
  KYC_TASKS_TO_REMOVE_ON_APPROVE,
  REVIEW_TASKS,
  RENDERED_TASKS_TO_ADD,
  RENDERED_TASKS_TO_REMOVE,
  SELECTED_TASKS_TO_ADD,
  SELECTED_TASKS_TO_REMOVE,
  REVIEW_TASKS_VOCABULARY,
  ACCOUNT_TYPES,
  ACCOUNT_TYPES_VERBOSE
} from '@/constants'
import { TextField, TickField } from '@comcom/fields'
import Modal from '@comcom/modals/Modal'

import 'mdi-vue/ChevronDownIcon'
import 'mdi-vue/ChevronUpIcon'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'

const EMPTY_REASON = ''

export default {
  name: 'user-details-request',
  components: {
    Modal,
    TextField,
    TickField
  },

  inject: ['kycRequestsList'],

  data () {
    return {
      USER_STATES_STR,
      USER_TYPES_STR,
      REQUEST_STATES_STR,
      REVIEW_TASKS,
      RENDERED_TASKS_TO_ADD,
      RENDERED_TASKS_TO_REMOVE,
      SELECTED_TASKS_TO_ADD,
      SELECTED_TASKS_TO_REMOVE,
      REVIEW_TASKS_VOCABULARY,
      ACCOUNT_TYPES,
      ACCOUNT_TYPES_VERBOSE,
      rejectForm: {
        reason: '' + EMPTY_REASON,
        isShown: false,
        isReset: false
      },
      details: {
        tasksToAdd: [...SELECTED_TASKS_TO_ADD],
        tasksToRemove: [...SELECTED_TASKS_TO_REMOVE]
      },
      isShownAdvanced: false,
      isPending: false
    }
  },

  props: ['user', 'requestToReview', 'account', 'updateRequestEvent'],

  computed: {
    hasManualTasks () {
      return !((this.requestToReview.pendingTasks & KYC_TASKS_TO_REMOVE_ON_APPROVE) === 0) &&
        this.requestToReview.state === REQUEST_STATES_STR.pending
    },
    isRequestPending () {
      return this.requestToReview.state === REQUEST_STATES_STR.pending
    }
  },

  methods: {
    async approve () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) return
      this.isPending = true
      try {
        await api.requests.approveKyc(this.requestToReview)
        this.$store.dispatch('SET_INFO', 'Request approved successfully')
        this.kycRequestsList.updateAsk = true
        this.$emit(this.updateRequestEvent)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async reject () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) return
      this.isPending = true
      try {
        await api.requests.rejectKyc(
          this.requestToReview,
          this.rejectForm.reason
        )
        this.$store.dispatch('SET_INFO', `Request rejected successfully`)
        this.kycRequestsList.updateAsk = true
        this.$emit(this.updateRequestEvent)
      } catch (error) {
        this.isPending = false
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    showRejectModal () {
      this.rejectForm.reason = '' + EMPTY_REASON
      this.rejectForm.isShown = true
    },

    hideRejectModal () {
      this.rejectForm.isShown = false
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../assets/scss/colors";

.user-request__actions {
  display: flex;
  margin-top: 3.5rem;

  & > .app__btn + .app__btn-secondary,
  & > .app__btn + .app__btn,
  & > .app__btn-secondary + .app__btn {
    margin-left: 1rem;
  }
}

.user-request__heading {
  color: $color-active;
  display: flex;
  line-height: 100%;
  align-items: center;

  h3 {
    margin-right: 1rem;
  }
}

.user-request__block {
  margin-bottom: 2rem;
}

.user-request__tick-field {
  margin-bottom: 0.5rem;
}

.user-details-request__form-actions {
  max-width: 48rem;
}
</style>
