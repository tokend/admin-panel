<template>
  <div class="data-field">
    <p class="data-field__label small secondary">
      {{label}}
    </p>
    <p class="data-field__value">
      {{value}}
    </p>
  </div>
</template>

<script>
export default {
  props: ['label', 'value']
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
</style>
