<template>
  <div class="kyc-recovery-request">
    <div class="app__block">
      <h2>Kyc recovery request</h2>

      <template v-if="isLoaded">
        <section class="kyc-recovery-request__section">
          <account-section
            :user="user"
            :original-role="userRole"
            :block-reason="latestBlockedRequest.blockReason"
          />
        </section>

        <template v-if="verifiedRequest.state">
          <!-- eslint-disable max-len -->
          <section
            v-if="verifiedRequest.accountRoleToSet !== kvAccountRoles.unverified && !isUserBlocked"
            class="kyc-recovery-request__section"
          >
            <template v-if="isKycLoaded">
              <h2>Previous approved KYC Request</h2>
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
                An error occurred. Please try again later.
              </p>
            </template>
            <template v-else>
              <p>Loading...</p>
            </template>
            <kyc-syndicate-section
              v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.corporate"
              :user="user"
              :blob-id="verifiedRequest.blobId"
            />
          </section>
        </template>

        <div class="kyc-recovery-request__data-from-request">
          <template
            v-if="verifiedRequest.accountRoleToSet &&
              kycRecoveryRequestBlobId">
            <h2>
              Data from KYC recovery request
            </h2>
            <general-kyc-viewer
              v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.general"
              :kyc="generalRecoveryKycData"
              :user="user"
            />
            <kyc-syndicate-section
              v-if="verifiedRequest.accountRoleToSet === kvAccountRoles.corporate"
              :user="user"
              :blob-id="kycRecoveryRequestBlobId"
            />
          </template>
          <template v-if="!verifiedRequest.accountRoleToSet">
            <p>This user has not yet been verified.</p>
          </template>
          <request-actions
            v-if="kycRecoveryRequestBlobId"
            class="kyc-recovery-request__actions"
            :request-to-review="kycRecoveryRequest"
            :latest-approved-request="verifiedRequest"
            :user="user"
            @reviewed="loadKycAndUserData"
          />
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
import AccountSection from '../Users/components/UserDetails/UserDetails.Account'

import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import GeneralKycViewer from '../Users/components/UserDetails/UserDetails.GeneralKycViewer'
import VerifiedKycViewer from '../Users/components/UserDetails/UserDetails.VerifiedKycViewer'
import AccreditedKycViewer from '../Users/components/UserDetails/UserDetails.AccreditedKycViewer'

import RequestActions from './KycRecoveryRequest.Action'

import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { ChangeRoleRequest } from '@/apiHelper/responseHandlers/requests/ChangeRoleRequest'
import { KycRecoveryRequest } from '@/apiHelper/responseHandlers/requests/KycRecoveryRequest'
import { fromKycTemplate } from '../../../utils/kyc-tempater'
import deepCamelCase from 'camelcase-keys-deep'

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
    KycSyndicateSection,
    AccreditedKycViewer,
    VerifiedKycViewer,
    GeneralKycViewer,
    RequestActions,
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
      kycRecoveryRequests: [],
      kyc: {},
      generalRecoveryKycData: {},
    }
  },

  computed: {
    ...mapGetters([
      'kvAccountRoles',
    ]),

    isUserBlocked () {
      return this.user.role === this.kvAccountRoles.blocked
    },

    latestApprovedRequest () {
      return (
        this.requests.find(item => item.isApproved)
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

    userRole () {
      return String(
        this.latestNonBlockedRequest.accountRoleToSet ||
          this.kvAccountRoles.unverified
      )
    },

    kycRecoveryRequestBlobId () {
      return this.kycRecoveryRequest
        ? this.kycRecoveryRequest.creatorDetails.blobId
        : null
    },

    kycRecoveryRequest () {
      return this.kycRecoveryRequests
        .find(item => item.isPending || item.isRejected)
    },
  },

  async created () {
    await this.loadKycAndUserData()
  },

  methods: {
    async loadKycAndUserData () {
      await this.getUser()

      if (this.verifiedRequest.state) {
        this.isKycLoaded = false
        this.kyc = await this.getKyc(this.verifiedRequest.blobId)
        this.isKycLoaded = true
      }
      if (
        this.verifiedRequest.accountRoleToSet ===
        this.kvAccountRoles.general &&
        this.kycRecoveryRequestBlobId
      ) {
        this.generalRecoveryKycData =
          await this.getKyc(this.kycRecoveryRequestBlobId)
      }
    },
    async getUser () {
      this.isLoaded = false
      this.isFailed = false
      try {
        const [user, requests, kycRecoveryRequest] = await Promise.all([
          api.getWithSignature('/identities', {
            filter: { address: this.id },
          }),
          api.getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: { requestor: this.id },
            include: ['request_details'],
          }),
          api.getWithSignature('/v3/kyc_recovery_requests', {
            page: { order: 'desc' },
            filter: { requestor: this.id },
            include: ['request_details'],
          }),
        ])
        this.user = user.data[0]
        this.requests = requests.data
          ? requests.data.map(item => new ChangeRoleRequest(item))
          : []
        this.kycRecoveryRequests = kycRecoveryRequest.data
          ? kycRecoveryRequest.data.map(item => new KycRecoveryRequest(item))
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

    async getKyc (blobId) {
      this.isKycLoadFailed = false

      try {
        const endpoint = `/accounts/${this.user.address}/blobs/${blobId}`
        const { data } = await api.getWithSignature(endpoint)
        return deepCamelCase(
          fromKycTemplate(JSON.parse(data.value))
        )
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

  .kyc-recovery-request__section {
    flex: 1;

    & > h1, & > h2, & > h3 {
      margin-bottom: 1.2rem;
    }
  }

  .kyc-recovery-request__section:not(:first-of-type) {
    margin-top: 3rem;
  }

  .kyc-recovery-request__data-from-request {
    margin-top: 5rem;

    & > h1, & > h2, & > h3 {
      margin-bottom: 1.2rem;
    }
  }

  .kyc-recovery-request__actions {
    display: flex;
    align-items: flex-end;
    margin-top: 4rem;
  }
</style>
