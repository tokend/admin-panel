<template>
  <div class="limits">
    <limits-manager/>
  </div>
</template>

<script>
  import LimitsManager from './components/Limits.Manager'

  export default {
    components: { LimitsManager }
  }
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  .limits {
    padding: 1rem 3rem 3rem;
    border-radius: 2px;
    background: $color-content-bg;
    max-width: 120rem;
    margin: auto;
  }
</style>
