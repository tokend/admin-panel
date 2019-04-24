<template>
  <div class="user-details-account">
    <h3 class="user-details-account__title">KYC information</h3>
    <div class="user-details-account__info">
      <p>Can be uploaded one of the documents:</p>
      <p> - Valid Passport;</p>
      <p> - Valid Identity card;</p>
      <p> - Valid Residence permit;</p>
      <p> - Driving license - full, not provisional, with a color photograph;</p>
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
        <span>Date of birth</span>
        <span :title="kyc.dateOfBirth">{{kyc.dateOfBirth}}</span>
      </li>
      <li>
        <span>Address Line 1</span>
        <span :title="kyc.address.line1">{{kyc.address.line1}}</span>
      </li>
      <li>
        <span>Address Line 2</span>
        <span :title="kyc.address.line2">{{kyc.address.line2}}</span>
      </li>
      <li>
        <span>City</span>
        <span :title="kyc.address.city">{{kyc.address.city}}</span>
      </li>
      <li>
        <span>Country</span>
        <span :title="kyc.address.country">{{kyc.address.country}}</span>
      </li>
      <li>
        <span>State</span>
        <span :title="kyc.address.state">{{kyc.address.state}}</span>
      </li>
      <li>
        <span>ID Document type</span>
        <span :title="ID_DOCUMENTS_VERBOSE[kyc.idDocumentType]">{{ID_DOCUMENTS_VERBOSE[kyc.idDocumentType]}}</span>
      </li>
      <li>
        <span>ID Document</span>
        <span>
          <span v-if="kyc.documents.kycIdDocument.back">Front:</span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycIdDocument.face"
          >
            Open file
          </user-doc-link-getter>
        </span>
        <template v-if="kyc.documents.kycIdDocument.back">
          <span>
            <span>Back:</span>
            <user-doc-link-getter
              :file-key="kyc.documents.kycIdDocument.back"
            >
              Open file
            </user-doc-link-getter>
          </span>
        </template>
      </li>
      <li v-if="kyc.documents.kycAvatar">
        <span>Avatar</span>
        <span>
          <user-doc-link-getter :file-key="kyc.documents.kycAvatar">
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
        v-if="kyc.documents.kycSelfie"
      >
        Code: {{ user.address.slice(1, 6) }}
      </li>
    </ul>
  </div>
</template>

<script>
import { UserDocLinkGetter, ImgGetter } from '@comcom/getters'

const ID_DOCUMENTS_VERBOSE = {
  passport: 'Passport',
  identity_card: 'Identity card',
  driving_license: 'Driving license',
  residence_permit: 'Residence permit'
}

export default {
  components: {
    UserDocLinkGetter,
    ImgGetter
  },

  props: ['kyc', 'user'],

  data () {
    return {
      ID_DOCUMENTS_VERBOSE
    }
  },

  created () {
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
