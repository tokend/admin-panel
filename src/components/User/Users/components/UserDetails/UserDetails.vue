<template>
  <div class="user-details">
    <div class="app__block">
      <h2>User details</h2>

      <template v-if="isLoaded && view.mode === VIEW_MODES.user">
        <section class="user-details__section" v-if="latestRequest">
          <h3>
            Current state
          </h3>
          <p :class="`user-details__state-info user-details__state-info--${latestRequest.requestState}`">
              {{ requestState }}
          </p>
          <p v-if="latestRequest.requestState === REQUEST_STATES_STR.rejected">
            Reason: {{ latestRequest.rejectReason }}
          </p>
          <p class="user-details__heading"
             v-if="latestRequest.requestState === REQUEST_STATES_STR.rejected">
            <span>External rejection details</span>
            <button class="app__btn-secondary app__btn-secondary--iconed"
                    @click="isShownExternal = !isShownExternal">
              <mdi-chevron-up-icon   v-if="isShownExternal"/>
              <mdi-chevron-down-icon v-else/>
            </button>
          </p>
          <p v-if="isShownExternal" v-html="externalDetails"></p>
        </section>

        <section class="user-details__section">
          <account-section :user="user" :account="account"/>
        </section>

        <template v-if="latestRequest">
          <section class="user-details__section">
            <kyc-general-section v-if="latestRequest.accountTypeToSet.string === USER_TYPES_STR.general"
                                 :user="user" :blobId="latestRequest.kycData.blobId"/>

            <kyc-syndicate-section v-if="latestRequest.accountTypeToSet.string === USER_TYPES_STR.syndicate"
                                 :user="user" :blobId="latestRequest.kycData.blobId"
            :previousBlobId="previousBlobIdForKycRequest"/>
          </section>


          <section v-if="previousBlobIdForKycRequest" class="user-details__section">
            <h1>Previous KYC Request</h1>
            <kyc-general-section v-if="latestRequest.accountTypeToSet.string === USER_TYPES_STR.general"
                                 :user="user" :blobId="previousBlobIdForKycRequest"/>
            <kyc-syndicate-section v-if="latestRequest.accountTypeToSet.string === USER_TYPES_STR.syndicate"
                                   :user="user" :blobId="previousBlobIdForKycRequest"/>
          </section>
        </template>

        <div class="user-details__actions-wrp">

          <template v-if="requestToReview">
            <section class="user-details__section">
              <request-section :user="user"
                               :account="account"
                               :requestToReview="requestToReview"
                               @update-request="getUser"
                               update-request-event="update-request"
              />
            </section>
          </template>


          <template>
            <div class="user-details__block-section">
              <block-section :user="user"
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
import api from '@/api'
import {
  USER_TYPES_STR,
  USER_STATES_STR,
  REQUEST_STATES,
  REQUEST_STATES_STR,
  PENDING_TASKS_VOCABULARY
} from '@/constants'
import AccountSection from './UserDetails.Account'

import KycGeneralSection from './UserDetails.Kyc'
import KycSyndicateSection from '../../../Sales/components/SaleManager/SaleManager.SyndicateTab'

import RequestSection from './UserDetails.Request'
import BlockSection from './UserDetails.Block'
import { formatDate } from '../../../../../utils/formatters'
import { unCamelCase } from '../../../../../utils/un-camel-case'

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
      USER_TYPES_STR,
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
      if (this.latestRequest.requestState !== REQUEST_STATES_STR.pending) {
        return this.latestRequest.requestState
      }
      return PENDING_TASKS_VOCABULARY[this.latestRequest.pendingTasks] || REQUEST_STATES_STR.pending
    }
  },

  methods: {
    async getUser () {
      this.isLoaded = false
      this.isFailed = false
      try {
        const [user, account, request, requests] = await Promise.all([
          api.users.get(this.id),
          api.accounts.get(this.id),
          this.getRequest(),
          this.getAllUserRequests()
        ])
        this.user = user.data
        this.account = account.data
        this.requestToReview = request
        this.requests = requests
        this.isLoaded = true
      } catch (error) {
        console.error(error)
        error.showMessage()
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
      const operationsList = await api.accounts
        .operationsOf(this.id)
        .getAllByType(OPERATION_TYPE.createKycRequest)
      return operationsList.data
    },
    async getRequest () {
      const requests = await api.requests.getKycRequests({
        state: REQUEST_STATES.pending,
        requestor: this.id
      })
      console.log(JSON.parse(JSON.stringify(requests)))
      return requests.data[0] || null
    },
    async getAllUserRequests () {
      const requests = await api.requests.getKycRequests({
        requestor: this.id
      })
      return requests.data
    },
    formatDate
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../../assets/scss/colors';

.user-details__section:not(:first-of-type) {
  margin-top: 3rem;
}

.user-details__actions-wrp {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 4rem;
}

.user-details__block-section {
  width: 10rem;
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
    opacity: .85;
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
