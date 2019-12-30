<template>
  <div class="kyc-requests">
    <user-header>
      <router-link :to="{ name: 'kycRecoveryRequests.index' }" slot="nav">
        {{ "kyc-recovery-requests.index" | globalize }}
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import UserHeader from '@/components/User/components/UserHeader'
import config from '../../../config'

export default {
  components: { UserHeader },
  data: _ => ({
    config,
  }),
}
</script>
