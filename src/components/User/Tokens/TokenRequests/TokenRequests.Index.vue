<template>
  <div class="token-requests-index">
    <h2>Manage investment tokens</h2>

    <div class="token-requests-index__list-wrp">
      <token-request-list :state="state"/>
    </div>
  </div>
</template>

<script>
import TokenRequestList from './components/TokenRequestList'

export default {
  components: {
    TokenRequestList
  }
}
</script>

<style scoped>
.token-requests-index__list-wrp {
  max-width: 64rem;
}
</style>
