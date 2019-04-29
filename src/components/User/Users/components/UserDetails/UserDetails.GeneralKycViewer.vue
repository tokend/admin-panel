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

export default {
  components: {
    KycGeneralSection,
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
}
</script>

<style lang="scss" scoped>
</style>
