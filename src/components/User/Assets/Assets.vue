<template>
  <div class="assets">
    <user-header>
      <router-link :to="{ name: 'assets.masterAssets' }" slot="nav">
        Master assets
      </router-link>
      <router-link :to="{ name: 'assets.assetRequests' }" slot="nav">
        Asset requests
      </router-link>
      <router-link :to="{ name: 'assets.issuance' }" slot="nav">
        Issuance
      </router-link>
      <router-link :to="{ name: 'assets.assetPairs' }" slot="nav">
        Asset pairs
      </router-link>
      <router-link :to="{ name: 'assets.withdrawals' }" slot="nav">
        Withdrawals
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
