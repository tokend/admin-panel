<template>
  <div class="user-details">
    <div class="app__block">
      <h2>User details</h2>

      <template v-if="isLoaded">
        <section
          class="user-details__section"
          v-if="requestToReview.state"
        >
          <h3>
            Current request state
          </h3>
          <p
            :class="`user-details__state-info
                      user-details__state-info--${requestToReview.state}`">
            {{ requestToReview.state }}
          </p>

          <p v-if="requestToReview.isRejected">
            Reason: {{ requestToReview.rejectReason }}
          </p>

          <p
            class="user-details__heading"
            v-if="requestToReview.isRejected"
          >
            <span>External rejection details</span>
            <button
              class="app__btn-secondary app__btn-secondary--iconed"
              @click="isShownExternal = !isShownExternal"
            >
              <mdi-chevron-up-icon v-if="isShownExternal" />
              <mdi-chevron-down-icon v-else />
            </button>
          </p>

          <!-- eslint-disable vue/no-v-html -->
          <p
            v-if="isShownExternal"
            v-html="externalDetails"
          />
          <!-- eslint-enable vue/no-v-html -->
        </section>

        <section class="user-details__section">
          <account-section
            :user="user"
            :original-role="userRole"
            :block-reason="latestBlockedRequest.blockReason"
          />
        </section>

        <template v-if="requestToReview.state">
          <section class="user-details__section">
            <kyc-general-section
              v-if="requestToReview.accountRoleToSet === ACCOUNT_ROLES.general"
              :user="user"
              :blob-id="requestToReview.blobId"
            />

            <!-- eslint-disable max-len -->
            <kyc-syndicate-section
              v-if="requestToReview.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blob-id="requestToReview.blobId"
            />
          </section>
          <!-- eslint-enable max-len -->
        </template>

        <template v-if="verifiedRequest.state">
          <!-- eslint-disable max-len -->
          <section
            v-if="verifiedRequest.accountRoleToSet !== ACCOUNT_ROLES.notVerified && !isUserBlocked"
            class="user-details__section"
          >
            <h2>Previous approved KYC Request</h2>
            <kyc-general-section
              v-if="verifiedRequest.accountRoleToSet === ACCOUNT_ROLES.general"
              :user="user"
              :blob-id="verifiedRequest.blobId"
            />
            <kyc-syndicate-section
              v-else-if="verifiedRequest.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blob-id="verifiedRequest.blobId"
            />
          </section>
          <!-- eslint-enable max-len -->

          <div
            v-if="requestToReview.state"
            class="user-details__latest-request"
          >
            <h3>Latest request</h3>
            <!-- eslint-disable max-len -->
            <p class="text">
              Create a {{ requestToReview.accountRoleToSet | roleIdToString | lowerCase }} account:
              {{ requestToReview.state }}
            </p>
            <!-- eslint-enable max-len -->
          </div>
        </template>

        <div class="user-details__actions-wrp">
          <template v-if="requestToReview.state">
            <request-actions
              class="user-details__actions"
              :user="user"
              :request-to-review="requestToReview"
              :latest-approved-request="verifiedRequest"
              @reviewed="getUpdatedUser"
            />
          </template>

          <template v-else>
            <block-actions
              class="user-details__actions"
              :user="user"
              :latest-approved-request="latestApprovedRequest"
              :verified-request="verifiedRequest"
              :is-pending.sync="isPending"
              @updated="getUpdatedUser"
            />

            <reset-actions
              v-if="!isUserBlocked"
              class="user-details__actions"
              :user="user"
              :verified-request="verifiedRequest"
              :is-pending.sync="isPending"
              @reset="getUpdatedUser"
            />
          </template>
        </div>
      </template>

      <template v-else-if="!isFailed">
        <p>Loading...</p>
      </template>

      <template v-else>
        <p class="danger">
          An error occurred. Please try again later.
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import AccountSection from './UserDetails.Account'

import KycGeneralSection from './UserDetails.Kyc'
import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import RequestActions from './UserDetails.Request'
import ResetActions from './UserDetails.Reset'
import BlockActions from './UserDetails.Block'

import { unCamelCase } from '@/utils/un-camel-case'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

import config from '@/config'

const OPERATION_TYPE = {
  createKycRequest: '22',
}
const EVENTS = {
  reviewed: 'reviewed',
}

export default {
  components: {
    AccountSection,
    KycGeneralSection,
    KycSyndicateSection,
    RequestActions,
    ResetActions,
    BlockActions,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      OPERATION_TYPE,
      isLoaded: false,
      isFailed: false,
      isPending: false,
      isShownExternal: false,
      user: {},
      requests: [],
      verifiedRequest: new ChangeRoleRequest({}),
    }
  },

  computed: {
    externalDetails () {
      if (!this.requestToReview.externalDetails) return ''
      return this.requestToReview.externalDetails
        .map(detail =>
          Object.entries(detail)
            .map(([key, value]) => `${unCamelCase(key)}: ${value}`)
            .join(' ')
        )
        .filter(value => value)
        .join('<br>')
    },

    isUserBlocked () {
      return this.user.role === config.ACCOUNT_ROLES.blocked
    },

    latestApprovedRequest () {
      return this.requests.find(item => item.isApproved) ||
        new ChangeRoleRequest({})
    },

    requestToReview () {
      return this.requests
        .find(item => item.isPending || item.isRejected) ||
        new ChangeRoleRequest({})
    },

    latestBlockedRequest () {
      return this.requests.find(item => {
        return item.accountRoleToSet === config.ACCOUNT_ROLES.blocked
      }) || new ChangeRoleRequest({})
    },

    latestNonBlockedRequest () {
      return this.requests.find(item => {
        return item.isApproved &&
          item.accountRoleToSet !== config.ACCOUNT_ROLES.blocked
      }) || new ChangeRoleRequest({})
    },

    userRole () {
      return String(
        this.latestNonBlockedRequest.accountRoleToSet ||
        config.ACCOUNT_ROLES.notVerified
      )
    },
  },

  async created () {
    await this.getUser()
  },

  methods: {
    async getUser () {
      this.isLoaded = false
      this.isFailed = false
      try {
        const [user, requests] = await Promise.all([
          ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', {
              filter: { address: this.id },
            }),
          ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/v3/change_role_requests', {
              page: { order: 'desc' },
              filter: { requestor: this.id },
              include: ['request_details'],
            }),
        ])
        this.user = user.data[0]
        this.requests = requests.data
          ? requests.data.map(item => new ChangeRoleRequest(item))
          : []
        await this.loadVerifiedRequest()
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isFailed = true
      }
    },

    async loadVerifiedRequest () {
      if (this.latestApprovedRequest) {
        const requestId = this.latestApprovedRequest.relatedRequestId

        if (requestId && requestId !== '0') {
          const { data } = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature(`/v3/change_role_requests/${requestId}`, {
              include: ['request_details'],
            })
          this.verifiedRequest = new ChangeRoleRequest(data)
        } else if (!requestId) {
          this.verifiedRequest = this.latestApprovedRequest
        }
      }
    },

    async getUpdatedUser () {
      this.isLoaded = false
      this.isFailed = false

      setTimeout(async () => {
        await this.getUser()
        this.$emit(EVENTS.reviewed)
      }, 5000)
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.user-details__section {
  flex: 1;

  & > h1, & > h2, & > h3 {
    margin-bottom: 1.2rem;
  }
}

.user-details__section:not(:first-of-type) {
  margin-top: 3rem;
}

.user-details__actions-wrp {
  display: flex;
  align-items: flex-end;
  margin-top: 4rem;
}

.user-details__latest-request {
  margin-top: 3.5rem;
}

.user-details__actions:not(:first-child) {
  margin-left: 1rem;
}

.user-details__heading {
  display: flex;
  line-height: 100%;
  align-items: center;

  span {
    margin-right: 1rem;
  }
}

.user-details__state-info {
  text-transform: capitalize;

  &--approved { color: $color-success; }
  &--pending { color: $color-active; }
  &--rejected { color: $color-danger; }
}
</style>
