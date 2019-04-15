<template>
  <table class="details-reader" v-if="isObject(details)">
    <template v-for="(value, key) in details">
      <template v-if="isPrintablePair(key, value)">
        <template v-if="isArray(value)">
          <tr class="details-reader__row" :key="`${_uid}-${key}`">
            <td class="details-reader__cell">
              <span class="details-reader__label">
                {{ key | humanize }}:
              </span>
            </td>
          </tr>

          <tr
            class="details-reader__row"
            v-for="(item, id) in value"
            :key="`${_uid}-${id}-${key}`"
          >
            <td class="details-reader__cell" colspan="2">
              <details-reader class="details-reader__nested" :details="item" />
            </td>
          </tr>
        </template>

        <template v-else-if="isObject(value)">
          <tr class="details-reader__row" :key="`${_uid}-${key}`">
            <td class="details-reader__cell">
              <span class="details-reader__label">
                {{ key | humanize }}:
              </span>
            </td>
          </tr>

          <tr class="details-reader__row" :key="`${_uid}-${key}-nested`">
            <td class="details-reader__cell" colspan="2">
              <details-reader class="details-reader__nested" :details="value" />
            </td>
          </tr>
        </template>

        <template v-else-if="value">
          <tr class="details-reader__row" :key="`${_uid}-${key}`">
            <td class="details-reader__cell">
              <span class="details-reader__label">
                {{ key | humanize }}
              </span>
            </td>

            <td class="details-reader__cell">
              <span class="details-reader__value" :title="value">
                {{ value }}
              </span>
            </td>
          </tr>
        </template>
      </template>
    </template>
  </table>
  <p :title="details" v-else>{{ details }}</p>
</template>

<script>
import { verbozify } from '@/utils/verbozify'

export default {
  name: 'details-reader',
  props: {
    details: {
      type: [Object, Number, Array, String],
      required: true,
      default: () => { }
    }
  },
  data () {
    return {
      dictionary: {}
    }
  },
  filters: {
    humanize (value) {
      return verbozify(value)
    }
  },
  methods: {
    isPrivate (value) {
      if (typeof value === 'string' || value instanceof String) {
        return value.charAt(0) === '_'
      }
      return false
    },

    isPrintablePair (key, value) {
      return !(this.isPrivate(key) || typeof value === 'function')
    },

    isArray (value) {
      return Array.isArray(value)
    },

    isObject (value) {
      return value && typeof value === 'object'
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/colors";

.details-reader__cell {
  vertical-align: top;
  padding: 0.1rem 0;

  & > .details-reader {
    padding-left: 2rem;
    position: relative;

    &:after {
      content: "";
      display: block;
      border-left: 1px solid rgba(0, 0, 0, 0.2);
      position: absolute;
      left: 0;
      top: 0.45rem;
      bottom: 0.35rem;
    }
  }
}

.details-reader__label {
  padding-right: 2.4rem;
  color: $color-text-secondary;
  white-space: nowrap;
}
</style>
