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
      <div class="app__block">
        <tabs>
          <tab name="History">
            <issuance-history/>
          </tab>

          <tab name="Requests">
            <issuance-request-list/>
          </tab>
        </tabs>
      </div>
    </section>
  </div>
</template>

<script>
import IssuanceForm from './components/IssuanceForm.vue'
import IssuanceRequestList from './components/IssuanceRequestList.vue'
import IssuanceHistory from './components/IssuanceHistory.vue'
import { Tabs, Tab } from '@comcom/Tabs'

export default {
  components: {
    IssuanceForm,
    IssuanceRequestList,
    IssuanceHistory,
    Tabs,
    Tab
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
