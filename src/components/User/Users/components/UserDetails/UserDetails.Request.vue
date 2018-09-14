<template>
  <div class="user-request">
    <h3>Latest request</h3>
    <p class="user-request__block text">
      Create a {{ (ACCOUNT_TYPES_VERBOSE[requestToReview.accountTypeToSet.int]).toLowerCase() }} account:
      {{ requestToReview.requestState }}
    </p>

    <template v-if="RENDERED_TASKS_TO_ADD.includes(REVIEW_TASKS.nonLatinDocs)">
      <div class="user-request__block" v-if="hasManualTasks">
        <h3>Details</h3>
        <tick-field v-model="details.tasksToAdd"
                    :label="REVIEW_TASKS_VOCABULARY[REVIEW_TASKS.nonLatinDocs]"
                    :cb-value="REVIEW_TASKS.nonLatinDocs"
        />
      </div>
    </template>

    <template v-if="RENDERED_TASKS_TO_REMOVE.length ||
                    RENDERED_TASKS_TO_ADD.length">

      <div class="user-request__block" v-if="isRequestPending">

        <div class="user-request__heading">
          <h3>Advanced</h3>
          <button class="app__btn-secondary app__btn-secondary--iconed"
                  @click="isShownAdvanced = !isShownAdvanced">
            <mdi-chevron-up-icon   v-if="isShownAdvanced"/>
            <mdi-chevron-down-icon v-else/>
          </button>
        </div>

        <template v-if="isShownAdvanced"
        >
          <h4 v-if="RENDERED_TASKS_TO_REMOVE.length">Tasks to remove</h4>
          <template v-for="task in RENDERED_TASKS_TO_REMOVE">
            <tickField class="user-request__tick-field"
                       v-model="details.tasksToRemove"
                       v-if="task !== 0"
                       :cb-value="task"
                       :label="REVIEW_TASKS_VOCABULARY[task]"
            />
          </template>
          <h4 v-if="RENDERED_TASKS_TO_ADD.length">Tasks to add</h4>
          <template v-for="task in RENDERED_TASKS_TO_ADD">
            <tickField class="user-request__tick-field"
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
      <div class="user-request__actions">
        <button class="app__btn"
                @click="approve"
                :disabled="isPending"
        >{{ isShownAdvanced ? 'Update request state' : 'Approve' }}</button>

        <button class="app__btn-secondary"
                @click="showRejectModal"
                :disabled="isPending"
        >Reject</button>
      </div>
    </template>

    <template v-if="isAccreditedInvestor">
      <div class="user-request__actions">
        <button class="app__btn user-request__approve-ai-btn"
                @click="approveAccreditedInvestor"
                :disabled="isPending"
        >Approve accredited investor</button>
      </div>
    </template>

    <template v-if="account.accountTypeI !== ACCOUNT_TYPES.notVerified">
      <div class="user-request__actions">
        <button class="app__btn-secondary app__btn-secondary--danger user-request__approve-ai-btn"
                @click="showRejectModal(true)"
                :disabled="isPending"
        >Reset to unverified</button>
      </div>
    </template>



    <modal class="user-request__reject-modal"
      v-if="rejectForm.isShown"
      @close-request="hideRejectModal(); this.rejectForm.isReset = false"
      max-width="40rem">
      <form class="user-request__reject-form"
        id="user-request-reject-form"
        @submit.prevent="hideRejectModal() || reject()">
        <div class="app__form-row">
          <text-field label="Reject reason"
            :autofocus="true"
            v-model="rejectForm.reason"
          />
        </div>
      </form>
      {{col}}
      <div class="app__form-actions user-request__reject-form-actions">
        <button class="app__btn app__btn--danger" form="user-request-reject-form">
          Reject
        </button>
        <button class="app__btn-secondary" @click="hideRejectModal">
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
  KYC_TASKS_TO_ADD_ON_APPROVE,
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

const EMPTY_REASON = ''

export default {
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
        this.requestToReview.requestState === REQUEST_STATES_STR.pending
    },
    isAccreditedInvestor () {
      return this.requestToReview.pendingTasks === REVIEW_TASKS.accreditedInvestor
    },
    isRequestPending () {
      return this.requestToReview.requestState === REQUEST_STATES_STR.pending
    }
  },

  methods: {
    async approve () {
      if (!window.confirm('Are you sure? This action cannot be undone')) return
      this.isPending = true
      try {
        const tasksToRemove = this.details.tasksToRemove.reduce((sum, task) => sum | task, 0)
        const tasksToAdd = this.details.tasksToAdd.reduce((sum, task) => sum | task, 0)
        await api.requests.approveKyc(this.requestToReview, {
          tasksToRemove,
          tasksToAdd
        })
        this.$store.dispatch('SET_INFO', 'Request approved successfully')
        this.$emit(this.updateRequestEvent)
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isPending = false
    },

    async approveAccreditedInvestor () {
      if (!window.confirm('Are you sure? This action cannot be undone')) return
      this.isPending = true
      try {
        const tasksToRemove = REVIEW_TASKS.accreditedInvestor
        const tasksToAdd = KYC_TASKS_TO_ADD_ON_APPROVE
        await api.requests.approveKyc(this.requestToReview, {
          tasksToRemove,
          tasksToAdd
        })
        this.$store.dispatch('SET_INFO', 'Request approved successfully')
        this.$emit(this.updateRequestEvent)
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isPending = false
    },

    async reject () {
      if (!window.confirm('Are you sure? This action cannot be undone')) return
      this.isPending = true
      try {
        const submitter = this.rejectForm.isReset
          ? api.requests.resetToUnverified({
            accountToUpdateKyc: this.requestToReview.accountToUpdateKyc,
            accountTypeToSet: this.requestToReview.accountTypeToSet.int,
            blobId: this.requestToReview.kycData.blobId,
            rejectReason: this.rejectForm.reason,
            requestToApprove: this.requestToReview.requestState !== REQUEST_STATES_STR.approved
              ? this.requestToReview : null
          })
          : api.requests.rejectKyc(
            this.requestToReview,
            this.rejectForm.reason
          )
        this.rejectForm.isReset = false
        await submitter
        this.$store.dispatch('SET_INFO', `Request rejected successfully`)
        this.$emit(this.updateRequestEvent)
      } catch (error) {
        this.isPending = false
        console.error(error)
        error.showMessage()
      }
      this.isPending = false
    },

    showRejectModal (isReset = false) {
      if (typeof isReset !== 'boolean') {
        isReset = false
      }
      this.rejectForm.reason = '' + EMPTY_REASON
      this.rejectForm.isShown = true
      this.rejectForm.isReset = isReset
    },

    hideRejectModal () {
      this.rejectForm.isShown = false
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../../assets/scss/colors';

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
  margin-bottom: .5rem;
}

.user-request__reject-form-actions {
  margin-top: 2rem;
}
.user-request__approve-ai-btn {
  min-width: 25rem;
}
</style>
