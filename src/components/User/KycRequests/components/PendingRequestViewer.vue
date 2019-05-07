<template>
  <div class="user-details">
    <div>
      <template v-if="isLoaded">
        <section class="user-details__section">
          <ul class="key-value-list">
            <li>
              <h3>Role to set</h3>
              <p class="user-details__role-info">
                {{ request.accountRoleToSet | roleIdToString }}
              </p>
            </li>
          </ul>

          <template v-if="request.externalDetails.length">
            <div class="user-details__ext-details-wrp">
              <h3>External details (provided by external services)</h3>
              <external-details-viewer
                :external-details="request.externalDetails"
              />
            </div>
          </template>
        </section>

        <section class="user-details__section">
          <account-section
            :user="user"
            :original-role="String(user.role)"
          />
        </section>

        <section class="user-details__section">
          <template v-if="isKycLoaded">
            <kyc-documents-viewer
              v-if="request.accountRoleToSet !== ACCOUNT_ROLES.corporate"
              class="user-details__documents"
              :documents="kyc.documents"
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

import GeneralKycViewer from '../../Users/components/UserDetails/UserDetails.GeneralKycViewer'
import VerifiedKycViewer from '../../Users/components/UserDetails/UserDetails.VerifiedKycViewer'
import AccreditedKycViewer from '../../Users/components/UserDetails/UserDetails.AccreditedKycViewer'

import KycDocumentsViewer from './KycDocumentsViewer'
import ExternalDetailsViewer from '../../Users/components/UserDetails/UserDetails.ExternalDetailsViewer'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'
import { fromKycTemplate } from '@/utils/kyc-tempater'
import deepCamelCase from 'camelcase-keys-deep'
import { Sdk } from '@/sdk'

import config from '@/config'

export default {
  components: {
    AccountSection,
    KycSyndicateSection,
    AccreditedKycViewer,
    VerifiedKycViewer,
    GeneralKycViewer,
    ExternalDetailsViewer,
    KycDocumentsViewer,
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

    async getKyc (blodId) {
      this.isKycLoaded = false
      this.isKycLoadFailed = false

      try {
        const { data } = await Sdk.api.blobs.get(blodId, this.user.address)
        this.kyc = deepCamelCase(fromKycTemplate(JSON.parse(data.value)))
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

.user-details__section {
  flex: 1;

  & > h1, & > h2, & > h3 {
    margin-bottom: 1.2rem;
  }
}

.user-details__section:not(:first-of-type) {
  margin-top: 3rem;
}

.user-details__ext-details-wrp {
  margin: 2rem 0;
}

.user-details__documents {
  margin-bottom: 2rem;
}
</style>
