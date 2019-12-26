<template>
  <div class="asset-requests-index">
    <h2>{{ "asset-requests-index.manage-assets" | globalize }}</h2>

    <div class="asset-requests-index__list-wrp">
      <asset-request-list />
    </div>
  </div>
</template>

<script>
import AssetRequestList from './components/AssetRequestList'

export default {
  components: { AssetRequestList },
}
</script>

<style>
.asset-requests-index__list-wrp {
  max-width: 64rem;
}
</style>
