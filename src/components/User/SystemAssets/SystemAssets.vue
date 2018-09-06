<template>
  <div class="system-assets">
    <user-header>
      <router-link :to="{ name: 'systemAssets.index' }" slot="nav">
        Asset index
      </router-link>
      <router-link :to="{ name: 'systemAssets.change-asset-issuer' }" slot="nav">
        Change asset issuer
      </router-link>
      <router-link :to="{ name: 'systemAssets.issuance' }" slot="nav">
        Issuance
      </router-link>
      <router-link :to="{ name: 'systemAssets.preissuance' }" slot="nav">
        Preissuance
      </router-link>
      <router-link :to="{ name: 'systemAssets.assetPairs' }" slot="nav">
        Asset pair index
      </router-link>
      <router-link :to="{ name: 'systemAssets.withdrawals' }" slot="nav">
        Withdrawals
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
import UserHeader from '@/components/User/components/UserHeader'
export default {
  components: { UserHeader }
}
</script>

<style scoped>

</style>
