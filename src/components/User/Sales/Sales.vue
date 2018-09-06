<template>
  <div class="sales">
    <user-header>
      <router-link :to="{ name: 'sales.index' }" slot="nav">Funds</router-link>
      <router-link :to="{ name: 'sales.requests' }" slot="nav">Fund requests</router-link>
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
