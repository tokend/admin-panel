<template>
  <div class="user-details-account">
    <h3 class="user-details-account__title">KYC information</h3>

    <template v-if="isLoaded">
      <div class="user-details-account__docs">
        <div class="user-details-account__doc-view-wrp">
          <user-doc-getter class="user-details-account__doc-view"
                           :user-id="user.id"
                           :file-key="kyc.documents.kycIdDocument"/>
          <h3>{{ ID_DOCUMENTS_VERBOSE[kyc.idDocumentType] }} (front page)</h3>
        </div>
        <div v-if="config.FEATURES.PHOTO_VERIFICATION" class="user-details-account__doc-view-wrp">
          <user-doc-getter class="user-details-account__doc-view"
                           :user-id="user.id"
                           :file-key="kyc.documents.bravo || kyc.documents.kycSelfie"/>
          <h3>Photo with code: {{ user.id.slice(1, 6) }}</h3>
        </div>
      </div>

      <ul class="key-value-list">
        <li>
          <span>First name</span>
          <span :title="kyc.firstName">{{kyc.firstName}}</span>
        </li>
        <li>
          <span>Last name</span>
          <span :title="kyc.lastName">{{kyc.lastName}}</span>
        </li>
        <li>
          <span>ID Document type</span>
          <span :title="ID_DOCUMENTS_VERBOSE[kyc.idDocumentType]">{{ID_DOCUMENTS_VERBOSE[kyc.idDocumentType]}}</span>
        </li>
        <li>
          <span>ID Document (front)</span>
          <span>
            <user-doc-link-getter :user-id="user.id"
              :file-key="kyc.documents.kycIdDocument"
            >Open file</user-doc-link-getter>
          </span>
        </li>
        <li v-if="kyc.documents.kycIdDocumentBack">
          <span>ID Document (back)</span>
          <span>
            <user-doc-link-getter :user-id="user.id"
              :file-key="kyc.documents.kycIdDocumentBack"
            >Open file</user-doc-link-getter>
          </span>
        </li>
        <li>
          <span>Proof of address</span>
          <span>
            <user-doc-link-getter :user-id="user.id"
              :file-key="kyc.documents.kycPoa"
            >Open file</user-doc-link-getter>
          </span>
        </li>
        <li v-if="kyc.documents.bravo">
          <span>Photo with verification code</span>
          <span>
            <user-doc-link-getter :user-id="user.id"
              :file-key="kyc.documents.bravo"
            >Open file</user-doc-link-getter>
          </span>
        </li>
        <li v-if="kyc.documents.kycSelfie">
          <span>Photo with verification code</span>
          <span>
            <user-doc-link-getter :user-id="user.id"
              :file-key="kyc.documents.kycSelfie"
            >Open file</user-doc-link-getter>
          </span>
        </li>
        <li class="code-details" v-if="kyc.documents.bravo || kyc.documents.kycSelfie">
          Code: {{ user.id.slice(1, 6) }}
        </li>

        <label class="data-caption">Address</label>
        <li>
          <span>Line 1</span>
          <span :title="kyc.address.line1">{{kyc.address.line1}}</span>
        </li>
        <li>
          <span>Line 2</span>
          <span :title="kyc.address.line2">{{kyc.address.line2}}</span>
        </li>
        <li>
          <span>City</span>
          <span :title="kyc.address.city">{{kyc.address.city}}</span>
        </li>
        <li>
          <span>State</span>
          <span :title="kyc.address.state">{{kyc.address.state}}</span>
        </li>
        <li>
          <span>Country</span>
          <span :title="kyc.address.country">{{kyc.address.country}}</span>
        </li>
        <li>
          <span>Postal code</span>
          <span :title="kyc.address.postalCode">{{kyc.address.postalCode}}</span>
        </li>
      </ul>
    </template>

    <template v-else-if="isFailed">
      <p class="danger">An error occurred. Please try again later.</p>
    </template>

    <template v-else>
      <p>Loading...</p>
    </template>
  </div>
</template>

<script>
import { UserDocGetter, UserDocLinkGetter, ImgGetter } from '@comcom/getters'
import { fromKycTemplate } from '../../../../../utils/kyc-tempater'
import deepCamelCase from 'camelcase-keys-deep'
import config from '@/config'
import api from '@/api'

const ID_DOCUMENTS_VERBOSE = {
  passport: 'Passport',
  identity_card: 'Identity card',
  driving_license: 'Driving license',
  residence_permit: 'Residence permit'
}

export default {
  components: {
    UserDocGetter,
    UserDocLinkGetter,
    ImgGetter
  },

  data () {
    return {
      kyc: {},
      isLoaded: false,
      isFailed: false,
      config,
      ID_DOCUMENTS_VERBOSE
    }
  },

  props: ['user', 'blobId'],

  created () {
    this.getKyc()
  },

  methods: {
    async getKyc () {
      this.isLoaded = false
      this.isFailed = false

      try {
        const kycFormResponse = (await api.users
          .blobsOf(this.user.id)
          .get(this.blobId, true)).data
        this.kyc = deepCamelCase(fromKycTemplate(JSON.parse(kycFormResponse.value)))
        this.isLoaded = true
      } catch (error) {
        console.error(error)
        this.isFailed = true
      }
    }
  },
  watch: {
    user () { this.getKyc() },
    blobId () { this.getKyc() }
  }
}
</script>

<style lang="scss" scoped>
  .code-details {
    font-size: 1.2rem;
    margin: 0 0 1rem 0;
    padding-left: 2rem;
  }

  .user-details-account__title {
    margin-bottom: 2rem;
  }

  .user-details-account__docs {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 4rem;
  }

  .user-details-account__doc-view-wrp {
    width: 100%;

    &:first-child {
      margin-right: 2rem;
    }
  }

</style>
