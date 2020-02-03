<template>
  <div class="users">
    <user-header>
      <router-link :to="{ name: 'fees.index' }" slot="nav">
        {{ "fees.link-settings" | globalize }}
      </router-link>
      <router-link :to="{ name: 'fees-balances.index' }" slot="nav">
        {{ "fees.link-collected-fees" | globalize }}
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
