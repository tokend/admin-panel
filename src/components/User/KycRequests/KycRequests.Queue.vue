<template>
  <div class="kyc-requests-queue">
    <template v-if="pendingRequests.length">
      <div class="kyc-requests-queue__warning-msg">
        <span class="kyc-requests-queue__header-title">
          Your actions will not be saved
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
            v-if="currentDecision"
            class="kyc-requests-queue__current-decision"
          >
            <h3>Current decision</h3>
            <ul class="key-value-list">
              <li>
                <span>Action</span>
                <span>{{ currentDecision.action }}</span>
              </li>
              <li v-if="currentDecision.reason">
                <span>Reason</span>
                <span>{{ currentDecision.reason }}</span>
              </li>
            </ul>
          </div>

          <pending-request-actions
            class="kyc-requests-queue__actions"
            :request="pendingRequests[currentRequestIndex]"
            @reviewed="nextRequest"
            @finished="isConfirmationShown = true"
          />
        </div>
      </template>

      <template v-else>
        <review-summary
          :decisions="reviewDecisions"
          @edit="editRequest"
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

import config from '@/config'
import { ApiCallerFactory } from '@/api-caller-factory'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { REQUEST_STATES } from '@tokend/js-sdk'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

export default {
  name: 'kyc-requests-queue',
  components: {
    PendingRequestViewer,
    PendingRequestActions,
    ReviewSummary,
  },

  data () {
    return {
      isLoading: false,
      isConfirmationShown: false,
      isRequestEdited: false,
      pendingRequests: [],
      reviewDecisions: [],
      currentRequestIndex: 0,
      REQUEST_STATES,
      CHANGE_ROLE_TASKS: config.CHANGE_ROLE_TASKS,
    }
  },

  computed: {
    currentDecision () {
      return this.reviewDecisions.find(item => {
        return item.request === this.pendingRequests[this.currentRequestIndex]
      })
    },
  },

  async created () {
    await this.loadList()
  },

  methods: {
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
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
    },

    nextRequest (payload) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })

      if (this.isRequestEdited) {
        this.currentDecision.action = payload.action
        this.currentDecision.reason = payload.reason

        this.isConfirmationShown = true
        this.isRequestEdited = false
      } else {
        this.reviewDecisions.push(payload)
        this.currentRequestIndex++
      }

      if (this.currentRequestIndex === this.pendingRequests.length) {
        this.isConfirmationShown = true
      }
    },

    editRequest (decision) {
      this.currentRequestIndex = this.pendingRequests.indexOf(
        this.pendingRequests.find(item => item.id === decision.request.id)
      )
      this.isRequestEdited = true
      this.isConfirmationShown = false
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
