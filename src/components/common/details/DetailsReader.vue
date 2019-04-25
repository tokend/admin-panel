<template>
  <div class="details-reader" v-if="isObject(normalizedDetails)">
    <template v-for="(value, key) in normalizedDetails">
      <template v-if="isPrintablePair(key, value)">
        <template v-if="isArray(value)">
          <div class="details-reader__row" :key="`${_uid}-${key}`">
            <div class="details-reader__cell">
              <span class="details-reader__label">
                {{ key | humanize }}:
              </span>
            </div>
          </div>

          <div
            class="details-reader__row"
            v-for="(item, id) in value"
            :key="`${_uid}-${id}-${key}`"
          >
            <div class="details-reader__cell">
              <template v-if="isArray(item) || isObject(item)">
                <div class="details-reader__row">
                  <div class="details-reader__cell">
                    <details-reader class="details-reader__nested" :details="item" />
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="details-reader__nested">
                  <div class="details-reader__cell">
                    <span>{{ item }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <template v-else-if="isObject(value)">
          <div class="details-reader__row" :key="`${_uid}-${key}`">
            <div class="details-reader__cell">
              <span class="details-reader__label">
                {{ key | humanize }}:
              </span>
            </div>
          </div>

          <div class="details-reader__row" :key="`${_uid}-${key}-nested`">
            <div class="details-reader__cell">
              <details-reader class="details-reader__nested" :details="value" />
            </div>
          </div>
        </template>

        <template v-else-if="value">
          <div class="details-reader__row" :key="`${_uid}-${key}`">
            <div class="details-reader__cell">
              <span class="details-reader__label">
                {{ key | humanize }}:
              </span>
            </div>

            <div class="details-reader__cell">
              <span class="details-reader__value" :title="value">
                {{ value }}
              </span>
            </div>
          </div>
        </template>
      </template>
    </template>
  </div>
  <p :title="normalizedDetails" v-else>{{ normalizedDetails }}</p>
</template>

<script>
import { verbozify } from '@/utils/verbozify'
import _omit from 'lodash/omit'

export default {
  name: 'details-reader',
  props: {
    details: {
      type: [Object, Number, Array, String],
      required: true,
      default: () => ({})
    }
  },
  data () {
    return {
      dictionary: {}
    }
  },
  computed: {
    normalizedDetails () {
      const omittedFields = [
        'relationshipNames',
        'type',
        'tx',
        'source',
        'effect',
        'operation.id',
        'operation.appliedAt',
        'details.id'
      ]

      return _omit(this.details, omittedFields)
    }
  },
  filters: {
    humanize (value) {
      // convert 'camelCaseValue' to 'camel case value'
      const spacedValue = value.replace(/([A-Z])/g, ' $1').toLowerCase()

      return verbozify(spacedValue)
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

.details-reader__row {
  display: flex;
  line-height: 1.5;
}

.details-reader__cell {
  vertical-align: top;
  padding: 0.1rem 0;
  color: $color-text;

  & > .details-reader__value {
    word-break: break-word;
  }

  & > .details-reader__nested {
    padding-left: 2rem;
    position: relative;

    &:after {
      content: "";
      display: block;
      border-left: 0.1rem dashed rgba($color-text, 0.5);
      position: absolute;
      left: 0;
      top: 0.45rem;
      bottom: 0.35rem;
    }
  }
}

.details-reader__label {
  padding-right: 1.6rem;
  color: $color-text;
  font-weight: bold;
  white-space: nowrap;
}
</style>
