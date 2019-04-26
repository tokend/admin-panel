<template>
  <div class="sales-index">
    <div class="sales-show__manager-wrp">
      <sale-manager :id="id" />
    </div>
  </div>
</template>

<script>
import SaleManager from './components/SaleManager'

export default {
  components: {
    SaleManager,
  },

  props: {
    id: { type: String, required: true },
  },
}
</script>
