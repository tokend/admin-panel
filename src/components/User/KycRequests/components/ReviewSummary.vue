<template>
  <div class="review-summary">
    <div class="review-summary__list-wrp">
      <template v-if="decisions.length">
        <div class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Email
            </span>
            <span class="app-list__cell">
              Role
            </span>
            <span class="app-list__cell">
              State
            </span>
          </div>

          <decision-list-item
            v-for="decision in decisions"
            :decision="decision"
            :key="decision.request.id"
            @click="emitDecisionEditing"
          />
        </div>
      </template>

      <template v-else>
        <p class="app__block">
          You haven't reviewed any request
        </p>
      </template>
    </div>

    <div class="review-summary__actions">
      <button
        v-if="decisions.length"
        class="app__btn review-summary__btn"
        :disabled="!readyToReviewDecisions.length"
        :title="readyToReviewDecisions.length
          ? ''
          : 'No ready to review decisions yet'"
        @click="review"
      >
        Submit
      </button>

      <button
        class="app__btn review-summary__btn"
        @click="resetReview"
      >
        Start new review
      </button>
    </div>
  </div>
</template>

<script>
import DecisionListItem from './DecisionListItem'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { confirmAction } from '@/js/modals/confirmation_message'

import { base } from '@tokend/js-sdk'

const EVENTS = {
  edit: 'edit',
  reset: 'reset',
}

const DECISION_STATES = {
  approve: 'approve',
  approving: 'approving',
  approved: 'approved',
  error: 'error',
  reject: 'reject',
  rejecting: 'rejecting',
  rejected: 'rejected',
  skip: 'skip',
}

export default {
  name: 'review-summary',
  components: { DecisionListItem },

  props: {
    decisions: { type: Array, required: true },
  },

  data () {
    return {
      EVENTS,
    }
  },

  computed: {
    readyToReviewDecisions () {
      const readyToReviewStates = [
        DECISION_STATES.approve,
        DECISION_STATES.reject,
      ]

      return this.decisions
        .filter(item => readyToReviewStates.includes(item.state))
    },
  },

  methods: {
    emitDecisionEditing (decision) {
      this.$emit(EVENTS.edit, decision)
    },

    async resetReview () {
      const isConfirmed = !this.decisions.length || await confirmAction({
        title: 'Are you sure? All your decisions will be lost',
      })
      if (!isConfirmed) { return }

      this.$emit(EVENTS.reset)
    },

    async review () {
      const isConfirmed = await confirmAction({
        title: 'Are you sure? This action cannot be undone',
      })
      if (!isConfirmed) { return }

      const reviewPromises = this.readyToReviewDecisions
        .map(item => this.reviewDecision(item))
      await Promise.all(reviewPromises)
    },

    async reviewDecision (decision) {
      try {
        this.setDecisionProcessingState(decision)

        const operation = this.createDecisionOperation(decision)
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)

        this.setDecisionReviewedState(decision)
      } catch (e) {
        decision.state = DECISION_STATES.error
        decision.errorMessage = ErrorHandler.extractErrorMessage(e)
        ErrorHandler.processWithoutFeedback(e)
      }
    },

    setDecisionProcessingState (decision) {
      if (decision.state === DECISION_STATES.approve) {
        decision.state = DECISION_STATES.approving
      } else if (decision.state === DECISION_STATES.reject) {
        decision.state = DECISION_STATES.rejecting
      }
    },

    setDecisionReviewedState (decision) {
      if (decision.state === DECISION_STATES.approving) {
        decision.state = DECISION_STATES.approved
      } else if (decision.state === DECISION_STATES.rejecting) {
        decision.state = DECISION_STATES.rejected
      }
    },

    createDecisionOperation (decision) {
      switch (decision.state) {
        case DECISION_STATES.approving:
          return this.createReviewRequestOperation({
            request: decision.request,
            action: base.xdr.ReviewRequestOpAction.approve().value,
          })
        case DECISION_STATES.rejecting:
          return this.createReviewRequestOperation({
            request: decision.request,
            action: base.xdr.ReviewRequestOpAction.reject().value,
            reason: decision.reason,
          })
      }
    },

    createReviewRequestOperation ({ request, action, reason = '' }) {
      return base.ReviewRequestBuilder.reviewRequest({
        requestID: request.id,
        requestHash: request.hash,
        requestType: request.type,
        reviewDetails: {
          tasksToAdd: request.tasksToAdd || 0,
          tasksToRemove: request.tasksToRemove ||
            request.pendingTasks,
          externalDetails: '{}',
        },
        action,
        reason,
      })
    },
  },
}
</script>

<style scoped>
.review-summary__btn {
  margin-top: 4rem;
  max-width: 16rem;
}

.review-summary__status-cell {
  display: flex;
}

.review-summary__status-cell-text {
  margin-left: 0.6rem;
}

.review-summary__actions {
  display: flex;
  justify-content: space-between;
}
</style>
