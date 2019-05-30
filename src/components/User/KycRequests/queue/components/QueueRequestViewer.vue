<template>
  <div class="queue-request-viewer">
    <div>
      <template v-if="isLoaded">
        <section class="queue-request-viewer__section">
          <div class="queue-request-viewer__account-role">
            <span>
              <strong>Role to set:</strong>
              <span>
                {{ request.accountRoleToSet | roleIdToString }}
              </span>
            </span>
          </div>

          <template v-if="request.externalDetails.length">
            <div class="queue-request-viewer__ext-details-wrp">
              <h3>External details (provided by external services)</h3>
              <external-details-viewer
                :external-details="request.externalDetails"
              />
            </div>
          </template>
        </section>

        <section class="queue-request-viewer__section">
          <account-section
            :user="user"
            :original-role="String(user.role)"
          />
        </section>

        <section class="queue-request-viewer__section">
          <template v-if="isKycLoaded">
            <queue-request-documents
              v-if="request.accountRoleToSet !== ACCOUNT_ROLES.corporate"
              class="queue-request-viewer__documents"
              :documents="kycDocuments"
              :user-account-id="user.address"
            />

            <general-kyc-viewer
              v-if=" request.accountRoleToSet === ACCOUNT_ROLES.general"
              :kyc="kyc"
              :user="user"
            />
            <verified-kyc-viewer
              v-else-if="request.accountRoleToSet === ACCOUNT_ROLES.usVerified"
              :kyc="kyc"
              :user="user"
            />
            <!-- eslint-disable max-len -->
            <accredited-kyc-viewer
              v-else-if="request.accountRoleToSet === ACCOUNT_ROLES.usAccredited"
              :kyc="kyc"
              :user="user"
            />
            <!-- eslint-enable max-len -->
            <kyc-syndicate-section
              v-else-if="request.accountRoleToSet === ACCOUNT_ROLES.corporate"
              :user="user"
              :blob-id="request.blobId"
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
        </section>
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
import AccountSection from '@/components/User/Users/components/UserDetails/UserDetails.Account'

import KycSyndicateSection from '@/components/User/Sales/components/SaleManager/SaleManager.SyndicateTab'

import GeneralKycViewer from '@/components/User/Users/components/UserDetails/UserDetails.GeneralKycViewer'
import VerifiedKycViewer from '@/components/User/Users/components/UserDetails/UserDetails.VerifiedKycViewer'
import AccreditedKycViewer from '@/components/User/Users/components/UserDetails/UserDetails.AccreditedKycViewer'

import QueueRequestDocuments from './QueueRequestDocuments'
import ExternalDetailsViewer from '@/components/User/Users/components/UserDetails/UserDetails.ExternalDetailsViewer'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'
import { fromKycTemplate } from '@/utils/kyc-tempater'
import deepCamelCase from 'camelcase-keys-deep'

import config from '@/config'

export default {
  components: {
    AccountSection,
    KycSyndicateSection,
    AccreditedKycViewer,
    VerifiedKycViewer,
    GeneralKycViewer,
    ExternalDetailsViewer,
    QueueRequestDocuments,
  },

  props: {
    request: { type: ChangeRoleRequest, required: true },
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      isLoaded: false,
      isFailed: false,
      isPending: false,
      isKycLoaded: false,
      isKycLoadFailed: false,
      user: {},
      kyc: {},
      kycDocuments: {},
    }
  },

  watch: {
    request: async function (value) {
      await this.getUser()
      await this.getKyc(value.blobId)
    },
  },

  async created () {
    await this.getUser()
    await this.getKyc(this.request.blobId)
  },

  methods: {
    async getUser () {
      this.isLoaded = false
      this.isFailed = false

      try {
        const { data: users } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/identities', {
            filter: { address: this.request.requestor },
          })
        this.user = users[0]
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isFailed = true
      }
    },

    async getKyc (blobId) {
      this.isKycLoaded = false
      this.isKycLoadFailed = false

      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/accounts/${this.user.address}/blobs/${blobId}`)
        this.kyc = deepCamelCase(fromKycTemplate(JSON.parse(data.value)))
        this.kycDocuments = deepCamelCase(JSON.parse(data.value)).documents
        this.isKycLoaded = true
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

.queue-request-viewer__section {
  flex: 1;

  & > h1, & > h2, & > h3 {
    margin-bottom: 1.2rem;
  }
}

.queue-request-viewer__account-role {
  border: solid 0.1rem;
  padding: 1rem;
  text-align: center;

  & span {
    font-size: 1.8rem;
  }
}

.queue-request-viewer__section:not(:first-of-type) {
  margin-top: 3rem;
}

.queue-request-viewer__ext-details-wrp {
  margin: 2rem 0;
}

.queue-request-viewer__documents {
  margin-bottom: 2rem;
}
</style>
