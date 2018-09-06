<template>
  <div class="user">
    <aside class="user__aside">
      <user-sidebar/>
    </aside>
    <div class="user__content">
      <router-view/>
    </div>
  </div>
</template>

<script>
import UserSidebar from './components/UserSidebar'
export default {
  components: { UserSidebar }
}
</script>

<style scoped>
.user {
  flex: 1;
}

.user__aside {
  position: fixed;
  top: 0;
  left: 0;
  width: 20rem;
  height: 100vh;
  z-index: 1;
}

.user__content {
  padding-left: 20rem;
}
</style>
