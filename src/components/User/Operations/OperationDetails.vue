<template>
  <div class="operation-details">
    <div class="app__block">
      <h2>Operation details</h2>
      <div class="operation-details__op-details-wrp">
        <operation-show :operation="operation" :user-id="user-id"/>
      </div>
    </div>
  </div>
</template>

<script>
  import OperationShow from './Operation.Show'

  export default {
    components: {
      OperationShow
    },
    props: ['operation', 'user-id']
  }
</script>

<style scoped>

</style>
