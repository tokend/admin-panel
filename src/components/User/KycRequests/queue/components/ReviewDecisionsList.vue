<template>
  <div class="review-decisions-list">
    <div class="review-decisions-list__list-wrp">
      <div class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">
            Email
          </span>
          <span class="app-list__cell">
            Role to set
          </span>
          <span class="app-list__cell">
            State
          </span>
          <span class="app-list__cell">
            Reason
          </span>
        </div>

        <review-decisions-list-item
          v-for="decision in decisions"
          :decision="decision"
          :key="decision.request.id"
          @click="emitDecisionEditing"
        />
      </div>
    </div>

    <div class="review-decisions-list__actions">
      <button
        class="app__btn review-decisions-list__btn"
        :disabled="!readyForReviewDecisions.length"
        :title="readyForReviewDecisions.length
          ? ''
          : 'No ready for review decisions yet'"
        @click="submitReview"
      >
        Submit
      </button>

      <button
        class="app__btn review-decisions-list__btn"
        @click="resetReview"
      >
        Start new review
      </button>
    </div>
  </div>
</template>

<script>
import ReviewDecisionsListItem from './ReviewDecisionsListItem'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { confirmAction } from '@/js/modals/confirmation_message'

import { base } from '@tokend/js-sdk'

import { DECISION_ACTIONS } from '../constants/decision-actions'

const EVENTS = {
  edit: 'edit',
  reset: 'reset',
}

export default {
  name: 'review-decisions-list',
  components: { ReviewDecisionsListItem },

  props: {
    decisions: { type: Array, required: true },
  },

  data () {
    return {
      EVENTS,
    }
  },

  computed: {
    readyForReviewDecisions () {
      return this.decisions.filter(item => item.isReadyForReview)
    },
  },

  methods: {
    emitDecisionEditing (decision) {
      this.$emit(EVENTS.edit, decision)
    },

    async resetReview () {
      const isConfirmed = !this.readyForReviewDecisions.length ||
        await confirmAction({
          title: 'Are you sure? All your decisions will be lost',
        })
      if (!isConfirmed) { return }

      this.$emit(EVENTS.reset)
    },

    async submitReview () {
      const isConfirmed = await confirmAction({
        title: 'Are you sure? This action cannot be undone',
      })
      if (!isConfirmed) { return }

      const reviewPromises = this.readyForReviewDecisions
        .map(item => this.reviewDecision(item))
      await Promise.all(reviewPromises)
    },

    async reviewDecision (decision) {
      try {
        decision.setProcessing()

        const operation = this.convertDecisionToReviewOperation(decision)
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)

        decision.setReviewed()
      } catch (e) {
        const errorMessage = ErrorHandler.extractErrorMessage(e)
        decision.setError(errorMessage)

        ErrorHandler.processWithoutFeedback(e)
      }
    },

    convertDecisionToReviewOperation (decision) {
      switch (decision.action) {
        case DECISION_ACTIONS.approve:
          return this.createReviewRequestOperation({
            request: decision.request,
            action: base.xdr.ReviewRequestOpAction.approve().value,
          })
        case DECISION_ACTIONS.reject:
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
          tasksToRemove: request.tasksToRemove,
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
.review-decisions-list__btn {
  margin-top: 4rem;
  max-width: 16rem;
}

.review-decisions-list__status-cell {
  display: flex;
}

.review-decisions-list__status-cell-text {
  margin-left: 0.6rem;
}

.review-decisions-list__actions {
  display: flex;
  justify-content: space-between;
}
</style>
