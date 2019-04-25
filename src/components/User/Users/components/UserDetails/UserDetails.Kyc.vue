<template>
  <div class="user-details-account">
    <h3 class="user-details-account__title">KYC information</h3>
    <div class="user-details-account__info">
      <p>Can be uploaded one of the documents:</p>
      <p> - Valid passport;</p>
      <p>- Driving license - full, not provisional, with a color photograph;</p>
      <p> - Valid National ID card;
        <p />
        <p>- In all cases handwritten documents or those in a foreign script that cannot be read, i.e Arabic or Cyrillic
          will not be accepted unless translated and notarized.</p>
    </div>

    <template v-if="isLoaded">
      <div class="user-details-account__docs">
        <div class="user-details-account__doc-view-wrp">
          <h3>{{ ID_DOCUMENTS_VERBOSE[kyc.idDocumentType] }}</h3>
          <user-doc-getter
            class="user-details-account__doc-view"
            :user-id="user.id"
            :file-key="kyc.documents.kycIdDocument"
          />
        </div>
        <div
          v-if="config.FEATURES.PHOTO_VERIFICATION"
          class="user-details-account__doc-view-wrp"
        >
          <h3>Photo with code: {{ user.address.slice(1, 6) }}</h3>
          <user-doc-getter
            class="user-details-account__doc-view"
            :user-id="user.address"
            :file-key="kyc.documents.bravo || kyc.documents.kycSelfie"
          />
        </div>
        <div
          v-if="kyc.documents.kycAvatar"
          class="user-details-account__doc-view-wrp"
        >
          <h3>Avatar</h3>
          <user-doc-getter
            class="user-details-account__doc-view"
            :file-key="kyc.documents.kycAvatar"
          />
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
          <span>ID Document</span>
          <span>
            <user-doc-link-getter
              :file-key="kyc.documents.kycIdDocument"
            >
              Open file
            </user-doc-link-getter>
          </span>
        </li>
        <li v-if="kyc.documents.kycAvatar">
          <span>Avatar</span>
          <span>
            <user-doc-link-getter :file-key="kyc.documents.kycAvatar">
              Open file
            </user-doc-link-getter>
          </span>
        </li>
        <li v-if="kyc.documents.bravo">
          <span>Photo with verification code</span>
          <span>
            <user-doc-link-getter
              :file-key="kyc.documents.bravo"
            >
              Open file
            </user-doc-link-getter>
          </span>
        </li>
        <li v-if="kyc.documents.kycSelfie">
          <span>Photo with verification code</span>
          <span>
            <user-doc-link-getter
              :file-key="kyc.documents.kycSelfie"
            >
              Open file
            </user-doc-link-getter>
          </span>
        </li>
        <li
          class="code-details"
          v-if="kyc.documents.bravo || kyc.documents.kycSelfie"
        >
          Code: {{ user.address.slice(1, 6) }}
        </li>
      </ul>
      <div class="user-details-account__info">
        <p>Can be uploaded one of the documents:</p>
        <p> - Driving license if not already uploaded on the previous step;</p>
        <p>- Recent utility bill (not older than 6 months old);</p>
        <p> - Bank statement or credit card statement (not older than 6 months);
          <p />
          <p> - Bank reference letter (not older than 6 months);
            <p />
            <p>- Signed Tenancy/Rental Agreement.</p>
      </div>
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
import { Sdk } from '@/sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'

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
        const response = await Sdk.api.blobs.get(this.blobId, this.user.address)
        const kycFormResponse = response.data
        this.kyc = deepCamelCase(fromKycTemplate(JSON.parse(kycFormResponse.value)))
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
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
  flex-direction: column;
  margin-bottom: 4rem;
}

.user-details-account__doc-view-wrp {
  width: 100%;

  &:not(:first-child) {
    margin-top: 3rem;
  }
}

.user-details-account__info {
  margin-bottom: 3rem;
}
</style>
