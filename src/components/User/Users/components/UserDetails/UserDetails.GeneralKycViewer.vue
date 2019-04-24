<template>
  <div class="user-details-general-kyc-viewer">
    <kyc-general-section
      :kyc="kyc"
      :user="user"
      :isKycLoaded="isKycLoaded"
      :isKycLoadFailed ="isKycLoadFailed"
    />
  </div>
</template>

<script>
import KycGeneralSection from './UserDetails.Kyc'
export default {
  components: {
    KycGeneralSection
  },
  props: ['kyc', 'user', 'isKycLoaded', 'isKycLoadFailed']
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/_colors.scss";
 .user-details-general-kyc-viewer__header {
   color: $color-info;
 }
</style>
