<template>
  <div class="user-request">
    <h3>Latest request</h3>
    <p class="user-request__block text">
      Create a {{ requestToReview.requestDetails.accountRoleToSet | roleIdToString | lowerCase }} account:
      {{ requestToReview.state }}
    </p>

    <template v-if="isRequestPending">
      <div class="app__form-actions user-details-request__form-actions">
        <button
          class="app__btn"
          @click="approve"
          :disabled="isPending"
        >
          Approve
        </button>

        <button
          class="app__btn app__btn--danger"
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
const EVENTS = {
  reviewed: 'reviewed'
}

export default {
  name: 'user-details-request',
  components: {
    Modal,
    TextField,
    TickField
  },

  data () {
    return {
      USER_STATES_STR,
      USER_TYPES_STR,
      REQUEST_STATES_STR,
      ACCOUNT_TYPES,
      ACCOUNT_TYPES_VERBOSE,
      rejectForm: {
        reason: '' + EMPTY_REASON,
        isShown: false,
        isReset: false
      },
      isShownAdvanced: false,
      isPending: false
    }
  },

  props: ['requestToReview'],

  computed: {
    isRequestPending () {
      return this.requestToReview.state === REQUEST_STATES_STR.pending
    }
  },

  methods: {
    async approve () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }
      this.isPending = true
      try {
        await api.requests.approve(this.requestToReview)
        this.$store.dispatch('SET_INFO', 'Request approved successfully')
        this.$emit(EVENTS.reviewed)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async reject () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }
      this.isPending = true
      try {
        await api.requests.reject(
          { reason: this.rejectForm.reason },
          { ...this.requestToReview, reviewDetails: { tasksToRemove: 0 }}
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
