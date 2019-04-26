<template>
  <div class="external-details-viewer">
    <p v-for="item in formattedExternalDetails"
       :class="{
        'external-details-viewer__row': true,
        'external-details-viewer__row--error': item.key === POSSIBLE_KEYS.problem,
        'external-details-viewer__row--warning': item.key === POSSIBLE_KEYS.reputationProblem
       }"
    >
      <span class="external-details-viewer__label">{{ unCamelCase(item.key) }}:  </span>
      <span class="external-details-viewer__value">{{ item.value }}</span>
    </p>
  </div>
</template>

<script>
import { unCamelCase } from '@/utils/un-camel-case'

const POSSIBLE_KEYS = {
  problem: 'problem', // tells us the reason of what why manual review was triggered
  reputationProblem: 'reputationProblem' // tells us the reputation problem that was defined when auto-verifying user
}

export default {
  name: 'external-details-viewer',
  props: {
    externalDetails: {
      type: Array,
      required: true
    }
  },
  data: _ => ({
    POSSIBLE_KEYS
  }),
  computed: {
    formattedExternalDetails () {
      /*
        Here are how external details come to us:
        [
          {
            a: 'b'
          },
          {
            c: 'd'
          },
          {},
          {},
          {
            e: 'f'
          }
        ]
        that we need to render in human-readable way.
        That's why we're doing this awkward stuff to make it possible
       */
      return this.externalDetails
      // extracting keys and values from { a: 'b' } objects and
      // making the entries consistent, to easily iterate through them in template:
        .map(detail =>
          Object
            .entries(detail)
            .map(([key, value]) => ({ key, value }))
        )
        .reduce((res, v) => {
          return res.concat(v)
        }, []) // flattening the array
        .filter(({ key, value }) => key && value) // filtering out empty objects {}
    }
  },
  methods: {
    unCamelCase
  }
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

