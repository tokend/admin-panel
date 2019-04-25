<template>
  <div class="offline-operations">
    <user-header>
      <router-link :to="{ name: 'offlineOperations.preIssuance' }" slot="nav">
        Pre-issuance
      </router-link>
      <router-link :to="{ name: 'offlineOperations.changeAssetIssuer' }" slot="nav">
        Change asset issuer
      </router-link>
      <router-link :to="{ name: 'offlineOperations.preIssuanceRequests' }" slot="nav">
        Pre-issuance requests
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import UserHeader from '@/components/User/components/UserHeader'

export default {
  components: { UserHeader },
}
</script>
