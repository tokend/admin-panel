<template>
  <div class="operation-details">
    <div class="app__block">
      <h2>Operation details</h2>
      <div class="operation-details__op-details-wrp">
        <details-reader :details="operation" />
      </div>
    </div>
  </div>
</template>

<script>
import DetailsReader from '../../common/details/DetailsReader'

export default {
  components: {
    DetailsReader,
  },
  props: {
    operation: { type: Object, required: true },
  },
}
</script>
