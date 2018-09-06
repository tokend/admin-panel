<template>
  <div class="users">
    <user-header>
      <router-link :to="{ name: 'fees.index' }" slot="nav">Fee settings</router-link>
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
