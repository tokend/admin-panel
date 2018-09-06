<template>
  <div class="kyc-requests">
    <user-header>
      <router-link :to="{ name: 'kycRequests.index' }" slot="nav">
        Index
      </router-link>
      <router-link
        v-if="config.FEATURES.KYC_REVIEW_MANAGER"
        :to="{ name: 'kycRequests.manager' }" slot="nav">
        Review Manager
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import UserHeader from '@/components/User/components/UserHeader'
  import config from '../../../config'

  export default {
    components: { UserHeader },
    data: _ => ({
      config
    })
  }
</script>

<style scoped>

</style>
