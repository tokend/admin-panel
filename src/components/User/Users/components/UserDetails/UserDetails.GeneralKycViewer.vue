<template>
  <div class="user-details-general-kyc-viewer">
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
</style>
