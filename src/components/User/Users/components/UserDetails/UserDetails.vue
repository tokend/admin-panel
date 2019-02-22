<template>
  <div class="user-details">
    <div class="app__block">
      <h2>User details</h2>

      <template v-if="isLoaded && view.mode === VIEW_MODES.user">
        <section
          class="user-details__section"
          v-if="latestRequest"
        >
          <h3>
            Current state
          </h3>
          <p :class="`user-details__state-info
                      user-details__state-info--${latestRequest.state}`">
            {{ stat }}
          </p>
          <p v-if="latestRequest.state === REQUEST_STATES_STR.rejected">
            Reason: {{ latestRequest.rejectReason }}
          </p>
          <p
            class="user-details__heading"
            v-if="latestRequest.state === REQUEST_STATES_STR.rejected"
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
            :account="account"
          />
        </section>

        <template v-if="latestRequest">
          <section class="user-details__section">
            <kyc-general-section
              v-if="latestRequest.requestDetails.accountRoleToSet === ACCOUNT_ROLES.general"
              :user="user"
              :blobId="latestRequest.requestDetails.kycData.blobId"
            />

            <kyc-syndicate-section
              v-if="latestRequest.requestDetails.accountRoleToSet === ACCOUNT_ROLES.syndicate"
              :user="user"
              :blobId="latestRequest.requestDetails.kycData.blobId"
            />
          </section>
          <section
            v-if="previousBlobIdForKycRequest"
            class="user-details__section"
          >
            <h1>Previous KYC Request</h1>
            <kyc-general-section
              v-if="latestRequest.requestDetails.accountRoleToSet === ACCOUNT_ROLES.general"
              :user="user"
              :blobId="previousBlobIdForKycRequest"
            />
            <kyc-syndicate-section
              v-if="latestRequest.requestDetails.accountRoleToSet === ACCOUNT_ROLES.syndicate"
              :user="user"
              :blobId="previousBlobIdForKycRequest"
            />
          </section>
        </template>

        <div class="user-details__actions-wrp">
          <template v-if="requestToReview">
            <section class="user-details__section">
              <request-section
                :user="user"
                :account="account"
                :requestToReview="requestToReview"
                @update-request="getUser"
                update-request-event="update-request"
              />
            </section>
          </template>

          <template>
            <div class="user-details__block-section">
              <block-section
                :user="user"
                :account="account"
                @update-request="getUser"
                update-request-event="update-request"
              />
            </div>
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
import { Sdk } from '@/sdk'
import {
  USER_STATES_STR,
  REQUEST_STATES,
  REQUEST_STATES_STR,
  PENDING_TASKS_VOCABULARY
} from '@/constants'
import AccountSection from './UserDetails.Account'

import KycGeneralSection from './UserDetails.Kyc'
import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import RequestSection from './UserDetails.Request'
import BlockSection from './UserDetails.Block'
import { formatDate } from '@/utils/formatters'
import { unCamelCase } from '@/utils/un-camel-case'
import { ApiWrp } from '@/api-wrp'
import { ErrorHandler } from '@/utils/ErrorHandler'
import config from '@/config'

const OPERATION_TYPE = {
  createKycRequest: '22'
}
const VIEW_MODES = Object.freeze({
  user: 'user',
  requests: 'requests'
})

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
      view: {
        mode: VIEW_MODES.user
      },
      VIEW_MODES,
      REQUEST_STATES_STR,
      PENDING_TASKS_VOCABULARY,
      previousBlobIdForKycRequest: null
    }
  },

  props: ['id'],

  async created () {
    await this.getUser()
  },

  computed: {

    latestRequest () {
      return this.requestToReview || this.requests[0] || null
    },
    externalDetails () {
      if (!this.latestRequest.externalDetails) return ''
      return this.latestRequest.externalDetails
        .map(detail =>
          Object.entries(detail)
            .map(([key, value]) => `${unCamelCase(key)}: ${value}`)
            .join(' ')
        )
        .filter(value => value)
        .join('<br>')
    },
    requestState () {
      if (!this.latestRequest) return
      if (this.latestRequest.state !== REQUEST_STATES_STR.pending) {
        return this.latestRequest.state
      }
      return PENDING_TASKS_VOCABULARY[this.latestRequest.pendingTasks] || REQUEST_STATES_STR.pending
    }
  },

  methods: {
    async getUser () {
      this.isLoaded = false
      this.isFailed = false
      try {
        const [user, requests] = await Promise.all([
          ApiWrp.createCallerInstance()
            .getWithSignature('/identities', {
              filter: { address: this.id }
            }),
          this.getAllChangeRoleRequests()
        ])
        this.user = user.data[0]
        // this.account = account.data
        this.requestToReview = requests.data
          .find(item => item.stateI === REQUEST_STATES.pending)
        this.requests = requests
        this.isLoaded = true
        console.log(this.user)
        console.log(this.requestState)
        console.log(requests)
      } catch (error) {
        ErrorHandler.process(error)
        this.isFailed = true
      }
      if (this.latestRequest) {
        this.getPreviousKycBlobId()
      }
    },
    async getPreviousKycBlobId () {
      const operationList = await this.getOperationsList()
      if (operationList[1]) {
        this.previousBlobIdForKycRequest = operationList[1].kycData.blobId
      }
    },
    async getOperationsList () {
      const operationsList = await Sdk.horizon.account.getOperations(this.id, {
        order: 'desc',
        operation_type: OPERATION_TYPE.createKycRequest
      })
      return operationsList.data
    },
    async getAllChangeRoleRequests () {
      const pageLimit = 100
      const list = await ApiWrp.createCallerInstance()
        .getWithSignature('/v3/change_role_requests', {
          filter: { requestor: this.id },
          page: { limit: pageLimit },
          include: ['request_details']
        },
      )

      let isListFullyLoaded = list.data.length < pageLimit
      while (!isListFullyLoaded) {
        const newChunk = await list.fetchNext()
        const oldLength = list.data.length
        list._data = list.data.concat(newChunk)
        if (oldLength === list.data.length) {
          isListFullyLoaded = true
        }
      }

      return list
    },
    formatDate
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

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
