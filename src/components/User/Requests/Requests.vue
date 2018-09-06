<template>
  <div class="user-requests">
    <user-header>
      <router-link :to="{ name: 'user.requests' }" slot="nav">
        Token creation requests
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import UserHeader from '@/components/User/components/UserHeader'
  import config from '../../../config'

  export default {
    components: { UserHeader },
    data: _ => ({
      config
    })
  }
</script>

<style scoped>

</style>
