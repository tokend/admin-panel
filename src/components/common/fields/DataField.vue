<template>
  <div class="data-field">
    <p class="data-field__label small secondary">
      {{ label }}
    </p>
    <p class="data-field__value">
      {{ value }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, default: '' },
    // eslint-disable-next-line vue/require-prop-types
    value: { default: false },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
</style>
