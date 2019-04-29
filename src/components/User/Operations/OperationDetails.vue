<template>
  <div>
    <div class="operation-details">
      <div class="app__block">
        <h2>Operation details</h2>
        <div class="operation-details__op-details-wrp">
          <details-reader :details="operation" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DetailsReader from '../../common/details/DetailsReader'

export default {
  components: {
    DetailsReader
  },
  data: _ => ({
    userId: null,
    operation: {},
    operationId: null
  }),
  created () {
    window.scroll(0, 0)
    this.userId = this.$route.params.id
    this.operation = this.$route.params.operation
  }
}
</script>

<style lang="scss">
</style>
