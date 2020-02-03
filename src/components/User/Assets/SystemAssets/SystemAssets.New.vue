<template>
  <div class="system-assets-new">
    <div class="app__block system-assets-new__block">
      <h2>{{ "system-assets-new.create-asset" | globalize }}</h2>

      <div class="system-assets-new__manager-wrp">
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
.system-assets-new__block.app__block {
  max-width: 64rem;
}
</style>
