<template>
  <div class="details-reader">
    <template v-if="isObject(details)">
      <div
        class="details-reader__row"
        v-for="(detail, key) in details"
        :key="`${_uid}-${key}`"
      >
        <template v-if="isPrintablePair(key, detail)">
          <template v-if="isArray(detail)">
            <p class="details-reader__label">{{ verbozify(key) }}:</p>
            <details-reader
              v-for="(item, id) in detail"
              :key="`${_uid}-${id}-${key}`"
              :details="item"
            />
          </template>

          <template v-else-if="isObject(detail)">
            <p class="details-reader__label">{{ verbozify(key) }}:</p>
            <details-reader :details="detail" />
          </template>

          <template v-else>
            <p class="details-reader__label">{{ verbozify(key) }}</p>
            <p class="details-reader__value" :title="detail">{{ detail }}</p>
          </template>
        </template>
      </div>
    </template>
    <template v-else>
      <p class="details-reader__value" :title="details">{{ details }}</p>
    </template>
  </div>
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
  methods: {
    verbozify,

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

.details-reader {
  width: 100%;
}

.details-reader .details-reader {
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

.details-reader__row {
  display: flex;
  flex-wrap: wrap;

  & + & {
    margin-top: 0.25rem;
  }
}

.details-reader__label {
  padding-right: 2rem;
  width: 20rem;
  min-width: 20rem;
  color: $color-text-secondary;
}

.details-reader__value {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
