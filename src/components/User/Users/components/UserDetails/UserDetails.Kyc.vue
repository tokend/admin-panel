<template>
  <div class="user-details-account">
    <h3 class="user-details-account__title">
      {{ "user-details-kyc.header" | globalize }}
    </h3>
    <div class="user-details-account__info">
      {{ "user-details-kyc.uploaded-document" | globalize }}
    </div>
    <ul class="user-details-account__key-value-list key-value-list">
      <li>
        <span>{{ "user-details-kyc.first-name" | globalize }}</span>
        <span :title="kyc.firstName">
          {{ kyc.firstName }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.last-name" | globalize }}e</span>
        <span :title="kyc.lastName">
          {{ kyc.lastName }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.date-birth" | globalize }}</span>
        <span :title="kyc.dateOfBirth">
          {{ kyc.dateOfBirth | dateTime }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.address-line1" | globalize }}</span>
        <span :title="kyc.address.line1">
          {{ kyc.address.line1 }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.address-line2" | globalize }}</span>
        <span :title="kyc.address.line2">
          <template v-if="kyc.address.line2">
            {{ kyc.address.line2 }}
          </template>
          <template v-else>
            -
          </template>
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.postal-code" | globalize }}</span>
        <span :title="kyc.address.postalCode">
          {{ kyc.address.postalCode }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.city" | globalize }}</span>
        <span :title="kyc.address.city">
          {{ kyc.address.city }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.country" | globalize }}</span>
        <span :title="country">
          {{ country }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.state" | globalize }}</span>
        <span :title="kyc.address.state">
          {{ kyc.address.state }}
        </span>
      </li>
      <li>
        <span>{{ "user-details-kyc.id-document-type" | globalize }}</span>
        <span :title="ID_DOCUMENTS_VERBOSE[kyc.idDocumentType]">
          {{ ID_DOCUMENTS_VERBOSE[kyc.idDocumentType] }}
        </span>
      </li>
      <li>
        <span v-if="kyc.documents.kycIdDocument.back">
          {{ "user-details-kyc.id-document-front-size" | globalize }}
        </span>
        <span v-else>
          {{ "user-details-kyc.id-document" | globalize }}
        </span>
        <span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycIdDocument.face"
          >
            {{ "user-details-kyc.open-file" | globalize }}
          </user-doc-link-getter>
        </span>
      </li>
      <li v-if="kyc.documents.kycIdDocument.back">
        <span>{{ "user-details-kyc.id-document-back-size" | globalize }} </span>
        <span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycIdDocument.back"
          >
            {{ "user-details-kyc.open-file" | globalize }}
          </user-doc-link-getter>
        </span>
      </li>
      <li v-if="kyc.documents.kycAvatar">
        <span>{{ "user-details-kyc.avatar" | globalize }}</span>
        <span>
          <user-doc-link-getter :file-key="kyc.documents.kycAvatar">
            {{ "user-details-kyc.open-file" | globalize }}
          </user-doc-link-getter>
        </span>
      </li>
      <li v-if="kyc.documents.kycSelfie">
        <span>
          {{ "user-details-kyc.photo-with-verification-code" | globalize }}
        </span>
        <span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycSelfie"
          >
            {{ "user-details-kyc.open-file" | globalize }}
          </user-doc-link-getter>
        </span>
      </li>
      <li
        class="code-details"
        v-if="kyc.documents.kycSelfie"
      >
        {{ "user-details-kyc.code" | globalize }}
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
