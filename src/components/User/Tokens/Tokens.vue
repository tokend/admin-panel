<template>
  <div class="users">
    <user-header>
      <router-link :to="{ name: 'tokens.requests' }" slot="nav">Requests</router-link>
      <router-link :to="{ name: 'tokens.preissuanceRequests' }" slot="nav">Preissuances</router-link>
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
