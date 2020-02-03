<template>
  <div class="limits">
    <user-header>
      <router-link :to="{ name: 'limits.index' }" slot="nav">
        {{ "limits.link-limits-management" | globalize }}
      </router-link>
      <router-link :to="{ name: 'limits.requests' }" slot="nav">
        {{ "limits.link-limits-changing-requests" | globalize }}
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
