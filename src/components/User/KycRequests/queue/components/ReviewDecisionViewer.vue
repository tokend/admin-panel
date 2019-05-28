<template>
  <div class="review-decision-viewer">
    <p
      v-if="decision.state === DECISION_STATES.error"
      class="review-decision-viewer__error"
    >
      <strong>Error:</strong>
      {{ decision.errorMessage }}
    </p>

    <p class="review-decision-viewer__item">
      <strong>Action:</strong>
      <span :title="decision.action">
        {{ decision.action }}
      </span>
    </p>

    <p
      v-if="decision.reason"
      class="review-decision-viewer__item"
    >
      <strong>Reason:</strong>
      <span :title="decision.reason">
        {{ decision.reason }}
      </span>
    </p>
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

.review-decision-viewer__item {
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-word;
}
</style>
