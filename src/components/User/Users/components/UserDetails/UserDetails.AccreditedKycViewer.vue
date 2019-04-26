<template>
  <div class="user-details-accredited-kyc-viewer">
    <div class="user-details-accredited-kyc-viewer__header">
      <span class="user-details-accredited-kyc-viewer__header-title">
        Current user is applied for Accredited KYC
      </span>
      <span class="user-details-accredited-kyc-viewer__header-subtitle">
        Please ensure user has a valid proof document
      </span>
    </div>
    <h3 class="user-details-accredited__doc-title">Proof of invest</h3>
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
import { UserDocGetter } from '@comcom/getters'
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
  margin-bottom: 0;
}

.user-details-accredited-kyc-viewer__header-subtitle {
  color: $color-text-inverse;
}

.user-details-accredited-kyc-viewer__header {
  display: flex;
  flex-direction: column;
  background-color: $color-banner-bg;
  padding: 1rem;
}

.user-details-accredited__doc-title {
  margin-top: 1rem;
}
</style>
