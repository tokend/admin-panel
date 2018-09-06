<template>
  <div class="issuance">
    <section class="issuance__form-section">
      <div class="app__block">
        <h2>Change asset issuer</h2>
        <div class="issuance__form-wrp">
          <change-asset-issuer-form/>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
  import ChangeAssetIssuerForm from './components/ChangeAssetIssuerForm'

  export default {
    components: {
      ChangeAssetIssuerForm
    }
  }
</script>

<style scoped>
  .issuance__form-section {
    max-width: 80rem;
  }

  .issuance__list-section {
    margin-top: 4.5rem;
  }
</style>
