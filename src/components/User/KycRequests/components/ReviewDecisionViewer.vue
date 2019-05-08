<template>
  <div class="review-decision-viewer">
    <ul
      v-if="decision.state !== 'error'"
      class="key-value-list"
    >
      <li>
        <span>Action</span>
        <span>{{ decision.state }}</span>
      </li>
      <li v-if="decision.reason">
        <span>Reason</span>
        <span>{{ decision.reason }}</span>
      </li>
    </ul>

    <p v-else class="review-decision-viewer__error">
      <strong>Error:</strong>
      {{ decision.errorMessage }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'review-decision-viewer',

  props: {
    decision: { type: Object, required: true },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.review-decision-viewer__error {
  color: $color-danger;
}
</style>
