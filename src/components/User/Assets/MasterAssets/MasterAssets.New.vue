<template>
  <div class="master-assets-new">
    <div class="app__block master-assets-new__block">
      <h2>Create asset</h2>

      <div class="master-assets-new__manager-wrp">
        <asset-manager />
      </div>
    </div>
  </div>
</template>

<script>
import AssetManager from './components/AssetManager'

export default {
  components: {
    AssetManager,
  },
}
</script>

<style scoped>
.master-assets-new__block.app__block {
  max-width: 64rem;
}
</style>
