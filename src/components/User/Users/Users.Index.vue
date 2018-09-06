<template>
  <div class="users-index">
    <div class="users-index__list-wrp">
      <user-list/>
    </div>
  </div>
</template>

<script>
import UserList from './components/UserList'

export default {
  components: {
    UserList
  }
}
</script>

<style scoped>

</style>
