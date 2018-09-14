<template>
  <div class="limits">
    <user-header>
      <router-link :to="{ name: 'limits.index' }" slot="nav">
        Limits management
      </router-link>
      <router-link :to="{ name: 'limits.requests' }" slot="nav">
        Limits changing requests
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
