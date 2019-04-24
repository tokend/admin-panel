<template>
  <div class="user-details-accredited-kyc-viewer">
    <div class="user-details-accredited-kyc-viewer__header">
      <h2 class="user-details-accredited-kyc-viewer__header-title">
        Current user is applied for Accredited KYC, please ensure user has a valid proof document
      </h2>
    </div>
    <user-doc-getter
      class="user-details-accredited__doc-view"
      name="user-details-accredited__doc-view"
      :file-key="kyc.documents.kycProofInvestor"
    />
    <kyc-general-section
      :kyc="kyc"
      :user="user"
    />
  </div>
</template>

<script>
import KycGeneralSection from './UserDetails.Kyc'
import UserDocGetter from '@comcom/getters'
export default {
  components: {
    KycGeneralSection,
    UserDocGetter
  },
  props: ['kyc', 'user']
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/_colors.scss";

.user-details-accredited-kyc-viewer__header-title {
  color: $color-text-inverse;
  font-weight: bold;
  padding: 1rem;
}

.user-details-accredited-kyc-viewer__header {
  background-color: $color-banner-bg;
}
</style>
