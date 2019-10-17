<template>
  <footer class="auth-footer">
    <span class="small">
      INCLUSIVITY © {{ currentYear }}
    </span>
  </footer>
</template>

<script>
export default {
  computed: {
    currentYear () {
      return new Date().getFullYear()
    },
  },
}
</script>

<style scoped>
.auth-footer {
  padding: 2rem 0;
  text-align: center;
}
</style>
