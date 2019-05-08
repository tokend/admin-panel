<template>
  <div class="kyc-requests-queue">
    <template v-if="reviewDecisions.length">
      <div class="kyc-requests-queue__warning-msg">
        <span class="kyc-requests-queue__header-title">
          Your actions will be lost after page reload
        </span>
        <span class="kyc-requests-queue__header-subtitle">
          Please, do not reload the page until you finish your review
        </span>
      </div>

      <template v-if="!isConfirmationShown">
        <div class="app__block">
          <h2>
            {{ currentRequestIndex + 1 }} /
            {{ pendingRequests.length }} requests
          </h2>

          <pending-request-viewer
            :request="pendingRequests[currentRequestIndex]"
          />

          <div
            v-if="isCurrentDecisionShown"
            class="kyc-requests-queue__current-decision"
          >
            <h3>Current decision</h3>
            <review-decision-viewer :decision="currentDecision" />
          </div>

          <pending-request-actions
            class="kyc-requests-queue__actions"
            :decision="currentDecision"
            @reviewed="nextRequest"
            @finished="isConfirmationShown = true"
          />
        </div>
      </template>

      <template v-else>
        <review-summary
          :decisions="reviewDecisions"
          @edit="editDecision"
          @reset="resetQueue"
        />
      </template>
    </template>

    <template v-else>
      <div>
        <template v-if="isLoading">
          <p>
            <span>
              Loading...
            </span>
          </p>
        </template>

        <template v-else>
          <p>
            <span>
              No requests to review yet
            </span>
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import PendingRequestViewer from './components/PendingRequestViewer'
import PendingRequestActions from './components/PendingRequestActions'
import ReviewSummary from './components/ReviewSummary'
import ReviewDecisionViewer from './components/ReviewDecisionViewer'

import config from '@/config'
import { ApiCallerFactory } from '@/api-caller-factory'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { REQUEST_STATES } from '@tokend/js-sdk'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'
import { ReviewDecision } from './wrappers/ReviewDecision'
import { DECISION_ACTIONS } from './constants/decision-actions'

import { confirmAction } from '@/js/modals/confirmation_message'

export default {
  name: 'kyc-requests-queue',
  components: {
    PendingRequestViewer,
    PendingRequestActions,
    ReviewSummary,
    ReviewDecisionViewer,
  },

  data () {
    return {
      isLoading: false,
      isConfirmationShown: false,
      isDecisionEdited: false,
      pendingRequests: [],
      reviewDecisions: [],
      currentRequestIndex: 0,
      REQUEST_STATES,
      CHANGE_ROLE_TASKS: config.CHANGE_ROLE_TASKS,
    }
  },

  computed: {
    currentRequest () {
      return this.pendingRequests[this.currentRequestIndex]
    },

    currentDecision () {
      return this.reviewDecisions
        .find(item => item.request === this.currentRequest)
    },

    isCurrentDecisionShown () {
      return this.currentDecision &&
        this.currentDecision.action !== DECISION_ACTIONS.skip
    },

    isReviewActive () {
      return this.reviewDecisions.some(item => item.isReadyForReview)
    },
  },

  watch: {
    isReviewActive (value) {
      if (value) {
        window.addEventListener('beforeunload', this.preventReload)
      } else {
        window.removeEventListener('beforeunload', this.preventReload)
      }
    },
  },

  async beforeRouteLeave (to, from, next) {
    const isConfirmed = !this.isReviewActive ||
      await confirmAction({
        title: 'Quit the review? All your decisions will be lost',
      })

    if (isConfirmed) {
      next()
    }
  },

  async created () {
    await this.loadList()
  },

  destroyed () {
    window.removeEventListener('beforeunload', this.preventReload)
  },

  methods: {
    preventReload (event) {
      const dialogMessage = 'Changes you made may not be saved.'
      event.returnValue = dialogMessage
      return dialogMessage
    },

    async loadList () {
      this.isLoading = true
      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: { state: REQUEST_STATES.pending },
            include: ['request_details'],
          })

        this.pendingRequests = data.map(item => new ChangeRoleRequest(item))
        this.reviewDecisions = this.pendingRequests
          .map(item => new ReviewDecision(item))
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
    },

    nextRequest () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
      this.currentRequestIndex++

      if (this.isDecisionEdited) {
        this.isConfirmationShown = true
        this.isDecisionEdited = false
      } else if (this.currentRequestIndex === this.pendingRequests.length) {
        this.isConfirmationShown = true
      }
    },

    editDecision (decision) {
      const decisionRequest = this.pendingRequests
        .find(item => item.id === decision.request.id)

      this.currentRequestIndex = this.pendingRequests.indexOf(decisionRequest)
      this.isDecisionEdited = true
      this.isConfirmationShown = false
    },

    async resetQueue () {
      this.isConfirmationShown = false
      this.reviewDecisions = []
      this.currentRequestIndex = 0

      await this.loadList()
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.kyc-requests-queue__actions {
  margin-top: 4rem;
}

.kyc-requests-queue__current-decision {
  margin-top: 4rem;
}

.kyc-requests-queue__header-title {
  color: $color-text-inverse;
  font-weight: bold;
  margin-bottom: .5rem;
}

.kyc-requests-queue__header-subtitle {
  color: $color-text-inverse;
}

.kyc-requests-queue__warning-msg {
  padding: 1rem 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  background-color: $color-banner-bg;
}
</style>
