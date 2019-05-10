<template>
  <div class="kyc-requests-queue">
    <div
      v-if="reviewDecisions.length"
      class="kyc-requests-queue__warning-msg"
    >
      <span class="kyc-requests-queue__header-title">
        Your actions will be lost after page reload
      </span>
      <span class="kyc-requests-queue__header-subtitle">
        Please, do not reload the page until you finish your review
      </span>
    </div>

    <div
      v-if="!isDecisionsListShown"
      class="app-list-filters kyc-requests-queue__roles-select-wrp"
    >
      <select-field
        class="kyc-requests-queue__roles-select"
        :value="filters.role"
        @input="setRoleFilter"
        label="Role to set"
      >
        <option :value="ALL_ROLES_FILTER">
          All
        </option>
        <option
          v-for="role in verifiedAccountRoles"
          :value="role"
          :key="role"
        >
          {{ role | roleIdToString }}
        </option>
      </select-field>
    </div>

    <template v-if="reviewDecisions.length">
      <template v-if="!isDecisionsListShown">
        <div class="app__block">
          <div class="kyc-requests-queue__nav">
            <button
              class="kyc-requests-queue__nav-btn"
              @click="incrementRequestIndex"
            >
              <mdi-chevron-left-icon />
            </button>
            <p class="kyc-requests-queue__nav-title">
              {{ currentRequestIndex + 1 }} /
              {{ pendingRequests.length }} requests
            </p>
            <button
              class="kyc-requests-queue__nav-btn"
              @click="decrementRequestIndex"
            >
              <mdi-chevron-right-icon />
            </button>
          </div>

          <queue-request-viewer
            :request="pendingRequests[currentRequestIndex]"
          />
          <div
            v-if="currentDecision.action !== DECISION_ACTIONS.none"
            class="kyc-requests-queue__current-decision"
          >
            <p class="kyc-requests-queue__current-decision-title">
              Current decision
            </p>
            <review-decision-viewer :decision="currentDecision" />
          </div>

          <queue-request-actions
            class="kyc-requests-queue__actions"
            :decision="currentDecision"
            @reviewed="nextRequest"
            @finished="isDecisionsListShown = true"
          />
        </div>
      </template>

      <template v-else>
        <review-decisions-list
          :decisions="reviewDecisions"
          @edit="editSingleDecision"
          @reset="resetQueue"
        />
      </template>
    </template>

    <template v-else>
      <div class="app__block">
        <template v-if="isLoading">
          <p>
            <span>Loading...</span>
          </p>
        </template>

        <template v-else>
          <p>
            <span>No requests to review yet</span>
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import SelectField from '@comcom/fields/SelectField'

import QueueRequestViewer from './queue/components/QueueRequestViewer'
import QueueRequestActions from './queue/components/QueueRequestActions'
import ReviewDecisionsList from './queue/components/ReviewDecisionsList'
import ReviewDecisionViewer from './queue/components/ReviewDecisionViewer'

import { ApiCallerFactory } from '@/api-caller-factory'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { REQUEST_STATES } from '@tokend/js-sdk'

import config from '@/config'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'
import { ReviewDecision } from './queue/wrappers/ReviewDecision'
import { DECISION_ACTIONS } from './queue/constants/decision-actions'

import { confirmAction } from '@/js/modals/confirmation_message'

import _omit from 'lodash/omit'

import 'mdi-vue/ChevronLeftIcon'
import 'mdi-vue/ChevronRightIcon'

const ALL_ROLES_FILTER = '0'

export default {
  name: 'kyc-requests-queue',
  components: {
    SelectField,
    QueueRequestViewer,
    QueueRequestActions,
    ReviewDecisionsList,
    ReviewDecisionViewer,
  },

  data () {
    return {
      filters: {
        role: ALL_ROLES_FILTER,
      },
      isLoading: false,
      isDecisionsListShown: false,
      isSingleDecisionEdited: false,
      pendingRequests: [],
      reviewDecisions: [],
      currentRequestIndex: 0,
      ALL_ROLES_FILTER,
      REQUEST_STATES,
      DECISION_ACTIONS,
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

    isReviewActive () {
      return this.reviewDecisions.some(item => item.isReadyForReview)
    },

    verifiedAccountRoles () {
      return _omit(config.ACCOUNT_ROLES, ['notVerified', 'blocked'])
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
      event.returnValue = ''
      return ''
    },

    async loadList () {
      this.isLoading = true
      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: {
              state: REQUEST_STATES.pending,
              'request_details.account_role_to_set':
                this.filters.role === ALL_ROLES_FILTER ? '' : this.filters.role,
            },
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

    async setRoleFilter (role) {
      const prevRole = this.filters.role
      this.filters.role = role

      const isConfirmed = !this.isReviewActive ||
        await confirmAction({
          title: 'Filter requests? All your decisions will be lost',
        })

      if (isConfirmed) {
        await this.resetQueue()
      } else {
        this.filters.role = prevRole
      }
    },

    incrementRequestIndex () {
      this.currentRequestIndex++

      if (this.currentRequestIndex === this.pendingRequests.length) {
        this.currentRequestIndex = 0
      }
    },

    decrementRequestIndex () {
      this.currentRequestIndex--

      if (this.currentRequestIndex < 0) {
        this.currentRequestIndex = this.pendingRequests.length - 1
      }
    },

    nextRequest () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
      this.currentRequestIndex++

      if (this.isSingleDecisionEdited) {
        this.isDecisionsListShown = true
        this.isSingleDecisionEdited = false
      } else if (this.currentRequestIndex === this.pendingRequests.length) {
        this.isDecisionsListShown = true
      }
    },

    editSingleDecision (decision) {
      const decisionRequest = this.pendingRequests
        .find(item => item.id === decision.request.id)

      this.currentRequestIndex = this.pendingRequests.indexOf(decisionRequest)
      this.isSingleDecisionEdited = true
      this.isDecisionsListShown = false
    },

    async resetQueue () {
      this.isDecisionsListShown = false
      this.reviewDecisions = []
      this.currentRequestIndex = 0

      await this.loadList()
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.kyc-requests-queue__roles-select-wrp {
  margin-bottom: 4rem;
}

.kyc-requests-queue__roles-select {
  max-width: 20rem;
}

.kyc-requests-queue__actions {
  margin-top: 4rem;
}

.kyc-requests-queue__current-decision {
  margin-top: 4rem;
  border: solid 0.1rem;
  padding: 2rem;
}

.kyc-requests-queue__current-decision-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.kyc-requests-queue__header-title {
  color: $color-text-inverse;
  font-weight: bold;
  margin-bottom: 0.5rem;
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

.kyc-requests-queue__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
}

.kyc-requests-queue__nav-title {
  font-size: 2.4rem;
}

.kyc-requests-queue__nav-btn {
  display: flex;
  border: solid 0.1rem;
  padding: 0.6rem;
  border-radius: 5rem;
}
</style>
