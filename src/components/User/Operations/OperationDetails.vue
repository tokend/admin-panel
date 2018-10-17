<template>
  <div class="operation-details">
    <div class="app__block">
      <h2>Operation details</h2>
      <div class="operation-details__op-details-wrp">
        <detail-reader :details="operation" />
      </div>
    </div>
  </div>
</template>

<script>
  import DetailReader from '../../common/details/DetailReader'

  export default {
    components: {
      DetailReader
    },
    props: ['operation', 'user-id']
  }
</script>

<style scoped>

</style>
