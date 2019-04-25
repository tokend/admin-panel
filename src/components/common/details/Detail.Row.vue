<template>
  <p class="detail-row">
    <span class="detail-row__key">
      {{ label }}
    </span>
    <span class="detail-row__value">
      <template>
        <slot v-if="$slots.default" />
        <!-- eslint-disable vue/no-v-html -->
        <span
          v-else
          v-html="value || '—'"
          class="detail-row__value-text"
        />
        <!-- eslint-enable vue/no-v-html -->
      </template>
    </span>
  </p>
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

<style lang="scss" scoped>
  @import '../../../assets/scss/colors';

  .detail-row {
    display: flex;
    line-height: 3rem;
    width: 100%;
  }

  .detail-row__key {
    $width: 20rem;
    color: $color-unfocused;
    width: $width;
    min-width: $width;
    max-width: $width;
    margin-right: 5rem;
  }

  .detail-row__value {
    position: relative;
  }

  .detail-row__value-text {
    display: block;
    // max-width: 30rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
