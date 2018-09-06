<template>
  <span class="request-state-formatter capitalized" :is-colored="isColored" :data-code="state">
    {{format(state)}}
  </span>
</template>

<script>
export default {
  props: ['state', 'isColored'],

  methods: {
    format (str) {
      return str.split('_').join(' ')
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/_colors.scss";

.request-state-formatter {
  &[is-colored] {
    &[data-code="rejected"],
    &[data-code="permanently_rejected"],
    &[data-code="cancelled"] {
      color: $color-danger;
    }

    &[data-code="approved"] {
      color: $color-success;
    }
  }
}
</style>
