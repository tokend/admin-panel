<template>
  <div class="assets-new">
    <div class="app__block assets-new__block">
      <h2>Create asset</h2>

      <div class="assets-new__manager-wrp">
        <asset-manager/>
      </div>
    </div>
  </div>
</template>

<script>
import AssetManager from './components/AssetManager'

export default {
  components: {
    AssetManager
  }
}
</script>

<style scoped>
.assets-new__block.app__block {
  max-width: 64rem;
}
</style>
