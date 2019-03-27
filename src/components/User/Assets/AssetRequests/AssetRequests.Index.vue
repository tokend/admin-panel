<template>
  <div class="asset-requests-index">
    <h2>Manage assets</h2>

    <div class="asset-requests-index__list-wrp">
      <asset-request-list :state="state"/>
    </div>
  </div>
</template>

<script>
import AssetRequestList from './components/AssetRequestList'

export default {
  components: {
    AssetRequestList
  }
}
</script>

<style scoped>
.asset-requests-index__list-wrp {
  max-width: 64rem;
}
</style>
