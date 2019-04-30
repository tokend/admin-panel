<template>
  <div class="external-details-viewer">
    <p
      v-for="(value, key) in actualExternalDetails"
      :key="key"
      :class="{
        'external-details-viewer__row': true,
        'external-details-viewer__row--error':
          key === POSSIBLE_KEYS.problem,
        'external-details-viewer__row--warning':
          key === POSSIBLE_KEYS.reputationProblem
      }"
    >
      <span class="external-details-viewer__label">
        {{ unCamelCase(key) }}:
      </span>
      <span class="external-details-viewer__value">
        {{ value }}
      </span>
    </p>
  </div>
</template>

<script>
import { unCamelCase } from '@/utils/un-camel-case'

const POSSIBLE_KEYS = {
  problem: 'problem', // tells us the reason of what why manual review was triggered
  reputationProblem: 'reputationProblem', // tells us the reputation problem that was defined when auto-verifying user
}

export default {
  name: 'external-details-viewer',
  props: {
    externalDetails: {
      type: Array,
      required: true,
    },
  },
  data: _ => ({
    POSSIBLE_KEYS,
  }),
  computed: {
    actualExternalDetails () {
      if (!this.externalDetails.length) {
        return {}
      }

      // so we're actually interested only in the latest ones
      return this.externalDetails[this.externalDetails.length - 1]
    },
  },
  methods: {
    unCamelCase,
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.external-details-viewer__row {
  &--warning {
    color: $color-warning;
  }

  &--error {
    color: $color-danger;
  }
}

.external-details-viewer__label {
  font-weight: 600;
}
</style>
