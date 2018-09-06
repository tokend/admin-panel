<template>
  <div class="sales-requests-index">
    <div class="sales-requests-index__list-wrp">
      <sale-request-list/>
    </div>
  </div>
</template>

<script>
import SaleRequestList from './components/SaleRequestList'
export default {
  components: {
    SaleRequestList
  }
}
</script>

<style scoped>

</style>
