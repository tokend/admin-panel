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
          <p :class="`user-details__state-info
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
          <p
            v-if="isShownExternal"
            v-html="externalDetails"
          />
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
            <general-kyc-viewer
              v-if="requestToReview.accountRoleToSet === ACCOUNT_ROLES.general"
              :kyc="kyc"
              :user="user"
              :isKycLoaded="isKycLoaded"
              :isKycLoadFailed ="isKycLoadFailed" />
            <verified-kyc-viewer
              v-if="requestToReview.accountRoleToSet === ACCOUNT_ROLES.us_verified"
              :kyc="kyc"
              :user="user"
              :isKycLoaded="isKycLoaded"
              :isKycLoadFailed ="isKycLoadFailed" />
            <accredited-kyc-viewer
              v-if="requestToReview.accountRoleToSet === ACCOUNT_ROLES.us_accredited"
              :kyc="kyc"
              :user="user"
              :isKycLoaded="isKycLoaded"
              :isKycLoadFailed ="isKycLoadFailed" />
            <kyc-syndicate-section
              v-if="requestToReview.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blobId="requestToReview.blobId"
            />
          </section>
        </template>

        <template v-if="verifiedRequest.state">
          <section
            v-if="verifiedRequest.accountRoleToSet !== ACCOUNT_ROLES.notVerified && !isUserBlocked"
            class="user-details__section"
          >
            <h2>Previous approved KYC Request</h2>
            <general-kyc-viewer
              v-if="verifiedRequest.accountRoleToSet === ACCOUNT_ROLES.general"
              :kyc="kyc"
              :user="user"
              :isKycLoaded="isKycLoaded"
              :isKycLoadFailed ="isKycLoadFailed" />
            <verified-kyc-viewer
              v-if="verifiedRequest.accountRoleToSet === ACCOUNT_ROLES.us_verified"
              :kyc="kyc"
              :user="user"
              :isKycLoaded="isKycLoaded"
              :isKycLoadFailed ="isKycLoadFailed" />
            <accredited-kyc-viewer
              v-if="verifiedRequest.accountRoleToSet === ACCOUNT_ROLES.us_accredited"
              :kyc="kyc"
              :user="user"
              :isKycLoaded="isKycLoaded"
              :isKycLoadFailed ="isKycLoadFailed" />
            <kyc-syndicate-section
              v-else-if="verifiedRequest.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blobId="verifiedRequest.blobId"
            />
          </section>

          <div
            v-if="requestToReview.state"
            class="user-details__latest-request"
          >
            <h3>Latest request</h3>
            <p class="text">
              Create a {{ requestToReview.accountRoleToSet | roleIdToString | lowerCase }} account:
              {{ requestToReview.state }}
            </p>
          </div>
        </template>

        <div class="user-details__actions-wrp">
          <template v-if="requestToReview.state">
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
import AccountSection from './UserDetails.Account'

import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import GeneralKycViewer from './UserDetails.GeneralKycViewer'
import VerifiedKycViewer from './UserDetails.VerifiedKycViewer'
import AccreditedKycViewer from './UserDetails.AccreditedKycViewer'

import RequestActions from './UserDetails.Request'
import ResetActions from './UserDetails.Reset'
import BlockActions from './UserDetails.Block'

import { UserDocLinkGetter } from '@comcom/getters'
import { unCamelCase } from '@/utils/un-camel-case'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'
import { fromKycTemplate } from '../../../../../utils/kyc-tempater'
import deepCamelCase from 'camelcase-keys-deep'
import { Sdk } from '@/sdk'

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
    KycSyndicateSection,
    RequestActions,
    ResetActions,
    BlockActions,
    AccreditedKycViewer,
    VerifiedKycViewer,
    GeneralKycViewer,
    UserDocLinkGetter
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      OPERATION_TYPE,
      isLoaded: false,
      isFailed: false,
      isPending: false,
      isShownExternal: false,
      isKycLoaded: false,
      isKycLoadFailed: false,
      user: {},
      requests: [],
      verifiedRequest: {},
      kyc: {}
    }
  },

  props: ['id'],

  async created () {
    await this.getUser()
    if (this.requestToReview.state) {
      await this.getKyc(this.requestToReview.blobId)
    } else if (this.verifiedRequest.state) {
      await this.getKyc(this.verifiedRequest.blobId)
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
        this.requests = requests.data
          ? requests.data.map(item => new ChangeRoleRequest(item))
          : []
        await this.loadVerifiedRequest()
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.process(error)
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
              include: ['request_details']
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
      }, 1500)
    },

    async getKyc (blodId) {
      this.isKycLoaded = false
      this.isKycLoadFailed = false

      try {
        const response = await Sdk.api.blobs.get(blodId, this.user.address)
        const kycFormResponse = response.data
        this.kyc = deepCamelCase(fromKycTemplate(JSON.parse(kycFormResponse.value)))
        this.isKycLoaded = true
      } catch (error) {
        ErrorHandler.process(error)
        this.isKycLoadFailed = true
      }
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

  &--approved { color: $color-success; }
  &--pending { color: $color-active; }
  &--rejected { color: $color-danger; }
}
</style>
