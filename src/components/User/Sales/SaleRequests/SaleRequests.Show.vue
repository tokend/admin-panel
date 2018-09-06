<template>
  <div class="sales-requests-show">
    <div class="sales-requests-show__manager-wrp">
      <sale-request-manager :id="id"/>
    </div>
  </div>
</template>

<script>
import SaleRequestManager from './components/SaleRequestManager'
export default {
  components: {
    SaleRequestManager
  },

  props: ['id']
}
</script>

<style scoped>

</style>
