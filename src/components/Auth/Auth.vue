<template>
  <div class="auth">
    <auth-header class="auth__header" />
    <router-view class="auth__body" />
  </div>
</template>

<script>
import AuthHeader from './components/AuthHeader'
export default {
  components: { AuthHeader }
}
</script>

<style scoped>
.auth {
  min-height: 100vh;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.auth__body {
  flex: 1;
  margin: 7rem 0 0;
}

</style>
