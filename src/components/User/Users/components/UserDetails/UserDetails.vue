<template>
  <div class="user-details">
    <div class="app__block">
      <h2>{{ "user-details.header" | globalize }}</h2>

      <template v-if="isLoaded">
        <section
          class="user-details__section"
          v-if="requestToReview.state"
        >
          <ul class="key-value-list">
            <li>
              <h3>{{ "user-details.current-request-state" | globalize }}</h3>
              <p
                :class="`user-details__state-info
                         user-details__state-info--${requestToReview.state}`">
                {{ requestToReview.state }}
              </p>
            </li>
            <li>
              <h3>{{ "user-details.role-set" | globalize }}</h3>
              <p class="user-details__role-info">
                {{
                  (requestToReview.accountRoleToSet
                    || verifiedRequest.accountRoleToSet) | roleTypeVerboseFilter
                }}
              </p>
            </li>
          </ul>
          <p v-if="requestToReview.isRejected">
            {{ "user-details.reason" | globalize({
              rejectReason: requestToReview.rejectReason
            })
            }}
          </p>

          <template v-if="requestToReview.externalDetails">
            <div class="user-details__ext-details-wrp">
              <h3>{{ "user-details.external-details" | globalize }}</h3>
              <external-details-viewer
                :external-details="requestToReview.externalDetails"
              />
            </div>
          </template>
        </section>

        <section class="user-details__section">
          <account-section
            :user="user"
            :block-reason="latestBlockedRequest.blockReason"
          />
        </section>

        <template v-if="requestToReview.state">
          <section class="user-details__section">
            <template v-if="isKycLoaded">
              <general-kyc-viewer
                v-if="
                  requestToReview.accountRoleToSet === kvAccountRoles.general
                "
                :kyc="kycNonVerified"
                :user="user"
              />
              <verified-kyc-viewer
                v-if="
                  requestToReview.accountRoleToSet === kvAccountRoles.usVerified
                "
                :kyc="kycNonVerified"
                :user="user"
              />
              <accredited-kyc-viewer
                v-if="
                  requestToReview.accountRoleToSet ===
                    kvAccountRoles.usAccredited
                "
                :kyc="kycNonVerified"
                :user="user"
              />
            </template>
            <template v-else-if="isKycLoadFailed">
              <p class="danger">
                {{ "user-details.error" | globalize }}
              </p>
            </template>
            <template v-else>
              <p>{{ "user-details.loading" | globalize }}</p>
            </template>
            <kyc-syndicate-section
              v-if="
                requestToReview.accountRoleToSet === kvAccountRoles.corporate
              "
              :user="user"
              :blob-id="requestToReview.blobId"
            />
          </section>
          <!-- eslint-enable max-len -->
        </template>

        <template v-if="verifiedRequest.state">
          <!-- eslint-disable max-len -->
          <section
            v-if="verifiedRequest.accountRoleToSet !== kvAccountRoles.unverified && !isUserBlocked"
            class="user-details__section"
          >
            <template v-if="isKycLoaded">
              <h2>{{ "user-details.previous-approved-kys-request" | globalize }}</h2>
              <general-kyc-viewer
                v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.general"
                :kyc="kyc"
                :user="user"
              />
              <verified-kyc-viewer
                v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.usVerified"
                :kyc="kyc"
                :user="user"
              />
              <accredited-kyc-viewer
                v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.usAccredited"
                :kyc="kyc"
                :user="user"
              />
            </template>
            <template v-else-if="isKycLoadFailed">
              <p class="danger">
                {{ "user-details.error" | globalize }}
              </p>
            </template>
            <template v-else>
              <p>{{ "user-details.loading" | globalize }}</p>
            </template>
            <kyc-syndicate-section
              v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.corporate"
              :user="user"
              :blob-id="verifiedRequest.blobId"
            />
          </section>
          <!-- eslint-enable max-len -->

          <div
            v-if="requestToReview.state"
            class="user-details__latest-request"
          >
            <h3>{{ "user-details.latest-request" | globalize }}</h3>
            <!-- eslint-disable max-len -->
            <p class="text">
              {{ "user-details.create" | globalize({
                accountRoleToSet: requestToReview.accountRoleToSet | roleIdToString,
                state: requestToReview.state
              })
              }}
            </p>
            <!-- eslint-enable max-len -->
          </div>
        </template>

        <template v-if="!isAdmin">
          <div class="user-details__actions-wrp">
            <template v-if="requestToReview.state">
              <request-actions
                class="user-details__actions"
                :user="user"
                :is-kyc-loaded="isKycLoaded"
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
      </template>

      <template v-else-if="!isFailed">
        <p>{{ "user-details.loading" | globalize }}</p>
      </template>

      <template v-else>
        <p class="danger">
          {{ "user-details.error" | globalize }}
        </p>
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

import ExternalDetailsViewer from './UserDetails.ExternalDetailsViewer'
import deepCamelCase from 'camelcase-keys-deep'
import apiHelper from '@/apiHelper'

import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { ChangeRoleRequest } from '@/apiHelper/responseHandlers/requests/ChangeRoleRequest'
import { fromKycTemplate } from '../../../../../utils/kyc-tempater'

import { mapGetters } from 'vuex'

const OPERATION_TYPE = {
  createKycRequest: '22',
}
const EVENTS = {
  reviewed: 'reviewed',
}

export default {
  components: {
    AccountSection,
    ExternalDetailsViewer,
    KycSyndicateSection,
    RequestActions,
    ResetActions,
    BlockActions,
    AccreditedKycViewer,
    VerifiedKycViewer,
    GeneralKycViewer,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      OPERATION_TYPE,
      isLoaded: false,
      isFailed: false,
      isPending: false,
      isKycLoaded: false,
      isKycLoadFailed: false,
      user: {},
      requests: [],
      verifiedRequest: {},
      emptyKyc: {},
      emptyKycNonVerified: {},
      kyc: {},
      kycNonVerified: {},
    }
  },

  computed: {
    ...mapGetters([
      'kvAccountRoles',
      'accountId',
    ]),

    isUserBlocked () {
      return this.user.role === this.kvAccountRoles.blocked
    },

    latestApprovedRequest () {
      return (
        this.requests.find(item => item.isApproved)
      ) || new ChangeRoleRequest({})
    },

    requestToReview () {
      return (
        this.requests.find(item => item.isPending || item.isRejected)
      ) || new ChangeRoleRequest({})
    },

    latestBlockedRequest () {
      return this.requests.find(item => {
        return item.accountRoleToSet === this.kvAccountRoles.blocked
      }) || new ChangeRoleRequest({})
    },

    latestNonBlockedRequest () {
      return this.requests.find(item => {
        return item.isApproved &&
          item.accountRoleToSet !== this.kvAccountRoles.blocked
      }) || new ChangeRoleRequest({})
    },

    isAdmin () {
      return this.user.address === this.accountId
    },
  },

  async created () {
    await this.getUser()
    if (this.requestToReview.state) {
      this.kycNonVerified =
        await this.fillEmptyKyc(this.requestToReview, this.emptyKycNonVerified)
    }
    if (this.verifiedRequest.state && this.kycNonVerified) {
      this.kyc = await this.fillEmptyKyc(this.verifiedRequest, this.emptyKyc)
    }
  },

  methods: {
    async fillEmptyKyc (request, kyc) {
      kyc = await this.getKyc(request.blobId, kyc)
      if (!kyc) {
        this.isKycLoaded = false
        this.isKycLoadFailed = true
      }
      return kyc
    },

    async getUser () {
      this.isLoaded = false
      this.isFailed = false
      try {
        const [user, requests] = await Promise.all([
          apiHelper.users.getUserByAccountId(this.id),
          api.getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: { requestor: this.id },
            include: ['request_details'],
          }),
        ])
        this.user = user
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
          const endpoint = `/v3/change_role_requests/${requestId}`
          const { data } = await api.getWithSignature(endpoint, {
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

    async getEndpoint (blobId, kyc) {
      const endpoint = `/accounts/${this.user.address}/blobs/${blobId}`
      const { data } = await api.getWithSignature(endpoint)
      return deepCamelCase(
        fromKycTemplate(JSON.parse(data.value))
      )
    },
    async getKyc (blobId, kyc) {
      if (!blobId) return

      this.isKycLoaded = false
      this.isKycLoadFailed = false

      try {
        let a = this.getEndpoint(blobId, kyc)
        this.isKycLoaded = true
        return a
      } catch (error) {
        ErrorHandler.process(error)
        this.isKycLoadFailed = true
      }
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

.user-details__ext-details-wrp {
  margin: 2rem 0;
}
</style>
