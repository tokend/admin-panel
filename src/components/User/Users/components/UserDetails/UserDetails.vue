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
          <account-section :user="user" />
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

        <template v-if="prevApprovedRequest">
          <section class="user-details__section">
            <h2>Previous approved KYC Request</h2>
            <kyc-general-section
              v-if="prevApprovedRequest.requestDetails.accountRoleToSet === ACCOUNT_ROLES.general"
              :user="user"
              :blobId="prevApprovedRequest.requestDetails.creatorDetails.blobId"
            />
            <kyc-syndicate-section
              v-if="prevApprovedRequest.requestDetails.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blobId="prevApprovedRequest.requestDetails.creatorDetails.blobId"
            />
          </section>

        </template>

        <template v-if="requestToReview">
          <div class="user-details__actions-wrp">
            <section class="user-details__section">
              <request-section
                :user="user"
                :requestToReview="requestToReview"
                @reviewed="getUpdatedUser"
              />
            </section>
          </div>
        </template>
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
import {
  USER_STATES_STR,
  REQUEST_STATES,
  REQUEST_STATES_STR
} from '@/constants'
import AccountSection from './UserDetails.Account'

import KycGeneralSection from './UserDetails.Kyc'
import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import RequestSection from './UserDetails.Request'
import BlockSection from './UserDetails.Block'
import { unCamelCase } from '@/utils/un-camel-case'
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
    RequestSection,
    BlockSection
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      USER_STATES_STR,
      OPERATION_TYPE,
      isLoaded: false,
      isFailed: false,
      isShownExternal: false,
      user: {},
      account: {},
      requestToReview: null,
      requests: [],
      REQUEST_STATES_STR,
      prevApprovedRequest: null
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
              filter: { requestor: this.id },
              include: ['request_details']
            })
        ])
        this.user = user.data[0]
        this.requests = requests || []
        this.requestToReview = this.requests.data
          .find(item => item.stateI === REQUEST_STATES.pending)
        this.prevApprovedRequest = this.requests.data
          .find(item => item.stateI === REQUEST_STATES.approved)
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.process(error)
        this.isFailed = true
      }
    },

    async getUpdatedUser () {
      this.$emit(EVENTS.reviewed)
      this.isLoaded = false
      this.isFailed = false
      setTimeout(async () => {
        await this.getUser()
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

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
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 4rem;
}

.user-details__heading {
  display: flex;
  line-height: 100%;
  align-items: center;

  span {
    margin-right: 1rem;
  }
}

.user-details__blocked-msg {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.user-details__request-header {
  font-weight: bold;
  margin-bottom: 1.2rem;
}

.user-details__switch-view-btn {
  cursor: pointer;
  font-size: 1.4rem;
  margin: 2rem 0;
  color: $color-active;
  &:hover {
    opacity: 0.85;
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
