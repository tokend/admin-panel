<template>
  <div class="user-details">
    <div class="app__block">
      <h2>User details</h2>

      <template v-if="isLoaded">
        <section
          class="user-details__section"
          v-if="requestToReview"
        >
          <h3>
            Current request state
          </h3>
          <p :class="`user-details__state-info
                      user-details__state-info--${requestToReview.state}`">
            {{ requestToReview.state }}
          </p>

          <p v-if="requestToReview.state === REQUEST_STATES_STR.rejected">
            Reason: {{ requestToReview.rejectReason }}
          </p>

          <p
            class="user-details__heading"
            v-if="requestToReview.state === REQUEST_STATES_STR.rejected"
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
          <p
            v-if="isShownExternal"
            v-html="externalDetails"
          />
        </section>

        <section class="user-details__section">
          <account-section
            :user="user"
            :original-role="userRole"
            :block-reason="blockReason"
          />
        </section>

        <template v-if="requestToReview">
          <section class="user-details__section">
            <kyc-general-section
              v-if="requestToReview.requestDetails.accountRoleToSet === ACCOUNT_ROLES.general"
              :user="user"
              :blobId="requestToReview.requestDetails.creatorDetails.blobId"
            />

            <kyc-syndicate-section
              v-if="requestToReview.requestDetails.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blobId="requestToReview.requestDetails.creatorDetails.blobId"
            />
          </section>
        </template>

        <template v-if="previousUserRole !== ACCOUNT_ROLES.notVerified && !isUserBlocked">
          <section class="user-details__section">
            <h2>Previous approved KYC Request</h2>
            <kyc-general-section
              v-if="previousUserRole === ACCOUNT_ROLES.general"
              :user="user"
              :blobId="verifiedRequest.requestDetails.creatorDetails.blobId"
            />
            <kyc-syndicate-section
              v-else-if="previousUserRole === ACCOUNT_ROLES.corporate"
              :user="user"
              :blobId="verifiedRequest.requestDetails.creatorDetails.blobId"
            />
          </section>

          <div
            v-if="requestToReview"
            class="user-details__latest-request"
          >
            <h3>Latest request</h3>
            <p class="text">
              Create a {{ requestToReview.requestDetails.accountRoleToSet | roleIdToString | lowerCase }} account:
              {{ requestToReview.state }}
            </p>
          </div>
        </template>

        <div class="user-details__actions-wrp">
          <template v-if="requestToReview">
            <request-actions
              class="user-details__actions"
              :user="user"
              :requestToReview="requestToReview"
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
        <p class="danger">An error occurred. Please try again later.</p>
      </template>
    </div>
  </div>
</template>

<script>
import { REQUEST_STATES, REQUEST_STATES_STR } from '@/constants'
import AccountSection from './UserDetails.Account'

import KycGeneralSection from './UserDetails.Kyc'
import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import RequestActions from './UserDetails.Request'
import ResetActions from './UserDetails.Reset'
import BlockActions from './UserDetails.Block'

import { unCamelCase } from '@/utils/un-camel-case'
import safeGet from 'lodash/get'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import config from '@/config'

const OPERATION_TYPE = {
  createKycRequest: '22'
}
const EVENTS = {
  reviewed: 'reviewed'
}

export default {
  components: {
    AccountSection,
    KycGeneralSection,
    KycSyndicateSection,
    RequestActions,
    ResetActions,
    BlockActions
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
      verifiedRequest: {},
      REQUEST_STATES_STR
    }
  },

  props: ['id'],

  async created () {
    await this.getUser()
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

    previousUserRole () {
      return safeGet(
        this.verifiedRequest,
        'requestDetails.accountRoleToSet'
      )
    },

    latestApprovedRequest () {
      return this.requests
        .find(item => item.stateI === REQUEST_STATES.approved)
    },

    latestNonBlockedRequest () {
      return this.requests.find(item => {
        const accountRoleToSet = safeGet(
          item, 'requestDetails.accountRoleToSet'
        )

        return item.stateI === REQUEST_STATES.approved &&
          accountRoleToSet !== config.ACCOUNT_ROLES.blocked
      })
    },

    requestToReview () {
      return this.requests
        .find(item => {
          return item.stateI === REQUEST_STATES.pending ||
            item.stateI === REQUEST_STATES.rejected
        })
    },

    latestBlockedRequest () {
      return this.requests.find(item => {
        const accountRoleToSet = safeGet(
          item, 'requestDetails.accountRoleToSet'
        )

        return accountRoleToSet === config.ACCOUNT_ROLES.blocked
      })
    },

    userRole () {
      const accountRoleToSet = safeGet(
        this.latestNonBlockedRequest,
        'requestDetails.accountRoleToSet'
      )

      return String(accountRoleToSet || config.ACCOUNT_ROLES.notVerified)
    },

    blockReason () {
      return safeGet(
        this.latestBlockedRequest,
        'requestDetails.creatorDetails.blockReason'
      )
    }
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
              filter: { address: this.id }
            }),
          ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/v3/change_role_requests', {
              page: { order: 'desc' },
              filter: { requestor: this.id },
              include: ['request_details']
            })
        ])
        this.user = user.data[0]
        this.requests = requests.data || []
        await this.loadVerifiedRequest()
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.process(error)
        this.isFailed = true
      }
    },

    async loadVerifiedRequest () {
      if (this.latestApprovedRequest) {
        const requestId = safeGet(
          this.latestApprovedRequest,
          'requestDetails.creatorDetails.latestApprovedRequestId'
        )

        if (requestId > 0) {
          const { data } = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature(`/v3/change_role_requests/${requestId}`, {
              include: ['request_details']
            })
          this.verifiedRequest = data
        } else if (requestId !== '0') {
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
      }, 1500)
    }
  }
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

  &--approved {
    color: $color-success;
  }
  &--pending {
    color: $color-active;
  }
  &--rejected {
    color: $color-danger;
  }
}
</style>
