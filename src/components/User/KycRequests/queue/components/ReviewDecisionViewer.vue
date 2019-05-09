<template>
  <div class="review-decision-viewer">
    <p
      v-if="decision.state === DECISION_STATES.error"
      class="review-decision-viewer__error"
    >
      <strong>Error:</strong>
      {{ decision.errorMessage }}
    </p>

    <ul class="key-value-list">
      <li>
        <span>Action</span>
        <span>{{ decision.action }}</span>
      </li>
      <li v-if="decision.reason">
        <span>Reason</span>
        <span>{{ decision.reason }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { ReviewDecision } from '../wrappers/ReviewDecision'
import { DECISION_STATES } from '../constants/decision-states'

export default {
  name: 'review-decision-viewer',

  props: {
    decision: { type: ReviewDecision, required: true },
  },

  data () {
    return {
      DECISION_STATES,
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.review-decision-viewer__error {
  color: $color-danger;
}
</style>
