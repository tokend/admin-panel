<template>
  <div class="sales-index">
    <div class="sales-show__manager-wrp">
      <sale-manager :id="id"/>
    </div>
  </div>
</template>

<script>
import SaleManager from './components/SaleManager'
export default {
  props: ['id'],

  components: {
    SaleManager
  }
}
</script>

<style scoped>

</style>
