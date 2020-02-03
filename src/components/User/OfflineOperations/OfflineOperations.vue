<template>
  <div class="offline-operations">
    <user-header>
      <router-link :to="{ name: 'offlineOperations.preIssuance' }" slot="nav">
        {{ "offline-operations.link-pre-issuance" | globalize }}
      </router-link>
      <router-link
        :to="{ name: 'offlineOperations.changeAssetIssuer' }"
        slot="nav"
      >
        {{ "offline-operations.link-change-asset-issuer" | globalize }}
      </router-link>
      <router-link
        :to="{ name: 'offlineOperations.preIssuanceRequests' }"
        slot="nav"
      >
        {{ "offline-operations.link-pre-issuance-requests" | globalize }}
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
