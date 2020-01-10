<template>
  <div class="assets">
    <user-header>
      <router-link :to="{ name: 'assets.systemAssets' }" slot="nav">
        {{ "assets.link-system-assets" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.assetRequests' }" slot="nav">
        {{ "assets.link-asset-requests" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.issuance' }" slot="nav">
        {{ "assets.link-issuance" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.assetPairs' }" slot="nav">
        {{ "assets.link-asset-pairs" | globalize }}
      </router-link>
      <router-link :to="{ name: 'assets.withdrawals' }" slot="nav">
        {{ "assets.link-withdrawals" | globalize }}
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
