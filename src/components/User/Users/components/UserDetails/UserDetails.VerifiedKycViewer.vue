<template>
  <div class="user-details-verified-kyc-viewer">
    <kyc-general-section
      :kyc="kyc"
      :user="user"
    />
  </div>
</template>

<script>
import KycGeneralSection from './UserDetails.Kyc'
export default {
  components: {
    KycGeneralSection
  },
  props: ['kyc', 'user']
}
</script>

<style lang="scss" scoped>
</style>
