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
        :disabled="!readyForReviewDecisions.length"
        :title="readyForReviewDecisions.length
          ? ''
          : 'No ready for review decisions yet'"
        @click="submitReview"
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

import { DECISION_ACTIONS } from '../constants/decision-actions'

const EVENTS = {
  edit: 'edit',
  reset: 'reset',
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
        decision.setProcessingState()

        const operation = this.createDecisionOperation(decision)
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)

        decision.setReviewedState()
      } catch (e) {
        const errorMessage = ErrorHandler.extractErrorMessage(e)
        decision.setErrorState(errorMessage)

        ErrorHandler.processWithoutFeedback(e)
      }
    },

    createDecisionOperation (decision) {
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
