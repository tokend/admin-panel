<template>
  <div class="issuance">
    <section class="issuance__form-section">
      <div class="app__block">
        <h2>Issuance</h2>
        <div class="issuance__form-wrp">
          <issuance-form/>
        </div>
      </div>
    </section>

    <section class="issuance__list-section">
      <h2>Issuance request list</h2>
      <div class="issuance__list-wrp">
        <issuance-request-list/>
      </div>
    </section>
  </div>
</template>

<script>
import IssuanceForm from './components/IssuanceForm.vue'
import IssuanceRequestList from './components/IssuanceRequestList.vue'

export default {
  components: {
    IssuanceForm,
    IssuanceRequestList
  }
}
</script>

<style scoped>
.issuance__form-section {
  max-width: 44rem;
}

.issuance__list-section {
  margin-top: 4.5rem;
}
</style>
