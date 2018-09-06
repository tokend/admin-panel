<template>
  <div class="trades">
    <user-header>
      <router-link :to="{ name: 'trades.index' }" slot="nav">Trades</router-link>
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
