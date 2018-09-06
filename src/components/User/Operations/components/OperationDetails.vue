<template>
  <div class="operation-details">
    <transaction-view :id="id" :user-account-id="userId"/>
  </div>
</template>

<script>
import TransactionView from './TransactionView'
export default {
  props: ['id', 'userId'],

  components: {
    TransactionView
  }
}
</script>

<style scoped>

</style>
