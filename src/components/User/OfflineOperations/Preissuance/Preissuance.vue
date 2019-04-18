<template>
  <div class="preissuance">
    <div class="preissuance__block app__block">
      <h2>
        Upload preissuance
      </h2>

      <div class="preissuance__form-wrp">
        <preissuance-form/>
      </div>
    </div>
  </div>
</template>

<script>
import PreissuanceForm from './components/PreissuanceForm.vue'

export default {
  components: {
    PreissuanceForm
  }
}
</script>

<style scoped>

.preissuance__block.app__block {
  max-width: 70rem;
}
</style>
