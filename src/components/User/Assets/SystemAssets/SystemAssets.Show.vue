<template>
  <div class="system-assets-show">
    <div class="system-assets-show__block app__block">
      <div class="system-assets-show__manager-wrp">
        <asset-manager :asset-code="asset" />
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
  props: {
    asset: { type: String, required: true },
  },
}
</script>

<style scoped>
.system-assets-show__block.app__block {
  max-width: 64rem;
}
</style>
