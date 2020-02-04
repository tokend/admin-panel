<template>
  <div class="auth">
    <auth-header class="auth__header" />
    <router-view class="auth__body" />
    <app-footer class="auth__footer" />
  </div>
</template>

<script>
import AuthHeader from './components/AuthHeader'
import AppFooter from '@/components/App/components/AppFooter'

export default {
  components: {
    AuthHeader,
    AppFooter,
  },
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

.auth__footer {
  padding: 2rem 0;
}

</style>
