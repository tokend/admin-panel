<template>
  <div class="asset-pairs-show">
    <div class="asset-pairs-show__mgr-wrp">
      <asset-pair-creator/>
    </div>
  </div>
</template>

<script>
  import AssetPairCreator from './components/AssetPairCreator'

  export default {
    components: {
      AssetPairCreator
    }
  }
</script>

<style scoped>
  .asset-pairs-show__mgr-wrp {
    max-width: 60rem;
  }
</style>
