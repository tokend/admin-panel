<template>
  <div class="user-details-accredited-kyc-viewer">
    <h2>Current user is applyied for Accredited KYC</h2>
    <user-doc-getter 
      class="user-details-accredited__doc-view"
      :file-key="kyc.documents.kycProofInvestor"
    />
    <kyc-general-section
      :kyc="kyc"
      :user="user"
      :isKycLoaded="isKycLoaded"
      :isKycLoadFailed ="isKycLoadFailed" />
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
  props: ['kyc', 'user', 'isKycLoaded', 'isKycLoadFailed']
}
</script>

<style lang="scss" scoped>
</style>
