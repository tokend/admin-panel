<template>
  <div class="review-decisions-list">
    <div class="review-decisions-list__list-wrp">
      <div class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">
            {{ "review-decisions-list.email" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "review-decisions-list.role-to-set" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "review-decisions-list.state" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "review-decisions-list.reason" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "review-decisions-list.tasks-to-add" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "review-decisions-list.tasks-to-remove" | globalize }}
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
        :title="checkReadyForReviewDecisions | globalize"
        @click="submitReview"
      >
        {{ "review-decisions-list.btn-submit" | globalize }}
      </button>

      <button
        class="app__btn review-decisions-list__btn"
        @click="resetReview"
      >
        {{ "review-decisions-list.btn-start-new-review" | globalize }}
      </button>
    </div>
  </div>
</template>

<script>
import ReviewDecisionsListItem from './ReviewDecisionsListItem'

import { api } from '@/api'
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
    checkReadyForReviewDecisions () {
      return this.readyForReviewDecisions.length
        ? 'review-decisions-list.btn-default'
        : 'review-decisions-list.btn-no-ready-review'
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
          confirmText: 'Yes',
          cancelText: 'No',
        })
      if (!isConfirmed) { return }

      this.$emit(EVENTS.reset)
    },

    async submitReview () {
      const isConfirmed = await confirmAction({
        title: 'Are you sure? This action cannot be undone',
        confirmText: 'Yes, confirm',
        cancelText: 'No, cancel',
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
        await api.postOperations(operation)

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
            tasks: decision.tasks,
          })
        case DECISION_ACTIONS.reject:
          return this.createReviewRequestOperation({
            request: decision.request,
            action: base.xdr.ReviewRequestOpAction.reject().value,
            reason: decision.reason,
            tasks: {},
          })
      }
    },

    createReviewRequestOperation ({ request, tasks, action, reason = '' }) {
      return base.ReviewRequestBuilder.reviewRequest({
        requestID: request.id,
        requestHash: request.hash,
        requestType: request.type,
        reviewDetails: {
          tasksToAdd: tasks.toAdd || 0,
          tasksToRemove: tasks.toRemove || 0,
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
