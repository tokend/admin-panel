<template>
  <div class="user-details-account">
    <h3 class="user-details-account__title">
      KYC information
    </h3>
    <div class="user-details-account__info">
      <p>Can be uploaded one of the documents:</p>
      <p> - Valid Passport;</p>
      <p> - Valid Identity card;</p>
      <p> - Valid Residence permit;</p>
      <p>
        - Driving license - full, not provisional, with a color photograph;
      </p>
    </div>
    <ul class="user-details-account__key-value-list key-value-list">
      <li>
        <span>First name</span>
        <span :title="kyc.firstName">
          {{ kyc.firstName }}
        </span>
      </li>
      <li>
        <span>Last name</span>
        <span :title="kyc.lastName">
          {{ kyc.lastName }}
        </span>
      </li>
      <li>
        <span>Date of birth</span>
        <span :title="kyc.dateOfBirth">
          {{ kyc.dateOfBirth }}
        </span>
      </li>
      <li>
        <span>Address Line 1</span>
        <span :title="kyc.address.line1">
          {{ kyc.address.line1 }}
        </span>
      </li>
      <li>
        <span>Address Line 2</span>
        <span :title="kyc.address.line2">
          {{ kyc.address.line2 }}
        </span>
      </li>
      <li>
        <span>City</span>
        <span :title="kyc.address.city">
          {{ kyc.address.city }}
        </span>
      </li>
      <li>
        <span>Country</span>
        <span :title="country">
          {{ country }}
        </span>
      </li>
      <li>
        <span>State</span>
        <span :title="kyc.address.state">
          {{ kyc.address.state }}
        </span>
      </li>
      <li>
        <span>ID Document type</span>
        <span :title="ID_DOCUMENTS_VERBOSE[kyc.idDocumentType]">
          {{ ID_DOCUMENTS_VERBOSE[kyc.idDocumentType] }}
        </span>
      </li>
      <li>
        <span v-if="kyc.documents.kycIdDocument.back">
          ID Document front side:
        </span>
        <span v-else>
          ID Document
        </span>
        <span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycIdDocument.face"
          >
            Open file
          </user-doc-link-getter>
        </span>
      </li>
      <li v-if="kyc.documents.kycIdDocument.back">
        <span>ID Document back side: </span>
        <span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycIdDocument.back"
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
import { UserDocLinkGetter } from '@comcom/getters'
import { byAlpha2 } from 'iso-country-codes'

const ID_DOCUMENTS_VERBOSE = {
  passport: 'Passport',
  identity_card: 'Identity card',
  driving_license: 'Driving license',
  residence_permit: 'Residence permit',
}

export default {
  components: {
    UserDocLinkGetter,
  },

  props: {
    kyc: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      ID_DOCUMENTS_VERBOSE,
    }
  },

  computed: {
    country () {
      const country = Object
        .keys(byAlpha2)
        .find(country => country === this.kyc.address.country)
      return country ? byAlpha2[country].name : ''
    },
  },
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

.user-details-account__key-value-list-id-document {
  display: flex;
  flex-direction: column;
}

</style>
