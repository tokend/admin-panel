<template>
  <div class="operations-show">
    <div class="app__block">
      <h2>Operation details</h2>

      <div class="operations-show__op-details-wrp">
        <operation-details :id="id" :user-id="userId"/>
      </div>
    </div>
  </div>
</template>

<script>
import OperationDetails from './components/OperationDetails'

export default {
  components: {
    OperationDetails
  },

  props: ['id', 'userId'],

  created () {
    // ...
  }
}
</script>

<style scoped>

</style>
