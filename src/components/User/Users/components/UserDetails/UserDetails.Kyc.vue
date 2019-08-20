<template>
  <div class="user-details-account">
    <h3 class="user-details-account__title">
      KYC information
    </h3>
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
    </ul>
  </div>
</template>

<script>
import { byAlpha2 } from 'iso-country-codes'

const ID_DOCUMENTS_VERBOSE = {
  passport: 'Passport',
  identity_card: 'Identity card',
  driving_license: 'Driving license',
  residence_permit: 'Residence permit',
}

export default {

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
