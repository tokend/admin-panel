<template>
  <div class="assets">
    <user-header>
      <router-link :to="{ name: 'assets.systemAssets' }" slot="nav">
        {{ "assets.nav-system-assets" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.assetRequests' }" slot="nav">
        {{ "assets.nav-asset-requests" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.issuance' }" slot="nav">
        {{ "assets.nav-issuance" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.assetPairs' }" slot="nav">
        {{ "assets.nav-asset-pairs" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.withdrawals' }" slot="nav">
        {{ "assets.nav-withdrawals" | globalize }}
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
