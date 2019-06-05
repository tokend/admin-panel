<template>
  <div
    class="input-field"
    :class="{'input-field--error': errorMessage}"
  >
    <div
      v-if="$slots.help"
      class="input-field__tip"
    >
      <i class="input-field__tip-icon mdi mdi-help-circle" />
      <div class="input-field__tip-content">
        <slot name="help" />
      </div>
    </div>

    <input
      v-bind="$attrs"
      v-on="listeners"
      class="input-field__input"
      :class="{ 'input-field__input--placeholder-auto-hidden': label }"
      :type="type"
      :placeholder="$attrs.placeholder || ' '"
      :value="value"
      @focus="isInputFocused = true"
      @blur="isInputFocused = false"
    >

    <input-field-autocomplete
      v-if="autocompleteType"
      :input-value="value"
      @option-selected="$emit('input', $event)"
      :autocomplete-type="autocompleteType"
      :is-input-focused="isInputFocused"
    />

    <span class="input-field__label">
      {{ label }}
    </span>

    <div class="input-field__hints">
      <slot name="hint" />
    </div>

    <transition name="input-field__err-transition">
      <p class="input-field__err-mes" v-if="errorMessage">
        {{ errorMessage }}
      </p>
    </transition>
  </div>
</template>

<script>
import InputFieldAutocomplete from './InputFieldAutocomplete'

const EVENTS = {
  input: 'input',
}

export default {
  components: { InputFieldAutocomplete },

  props: {
    label: { type: String, default: '' },
    value: { type: [String, Number], default: undefined },
    errorMessage: { type: String, default: undefined },
    autocompleteType: { type: String, default: '' },
    type: { type: String, default: 'text' },
  },

  data () {
    return {
      isInputFocused: false,
    }
  },

  computed: {
    listeners () {
      return {
        ...this.$listeners,
        input: event => {
          this.beforeEmit(event.target)
          this.$emit(EVENTS.input, event.target.value)
        },
      }
    },
  },

  methods: {
    onInput (event) {},

    beforeEmit (target) {
      if (this.type === 'number') {
        this.normalizeNumberFormat(target)
        this.normalizeMinMax(target)
        this.normalizeDecimalPrecision(target)
      }
    },

    normalizeNumberFormat (target) {
      const { value } = target

      // Remove leading zeros
      if ((/^0[^.,]/).test(value)) {
        target.value = value.replace(/^0/g, '')
      }
    },

    normalizeMinMax (target) {
      const { value } = target
      const max = '' + this.$attrs.max
      const min = '' + this.$attrs.min

      if (value === '') {

      } else if (value > +max) {
        target.value = max
      } else if (value < +min) {
        target.value = min
      }
    },

    normalizeDecimalPrecision (target) {
      const { value } = target

      let precision
      try {
        precision = this.$attrs.step.match(/(?:\.|,)\d+$/)[0].slice(1).length
      } catch (error) {
        precision = 0
      }

      if (!precision) {

      } else {
        const detectRe = new RegExp(`(?:\\.|,)\\d{${precision + 1},}$`)
        if (detectRe.test(value)) {
          const replaceRe = new RegExp(`((?:\\.|,)\\d{${precision}})\\d*`)
          target.value = value.replace(replaceRe, '$1')
        }
      }
    },
  },
}
</script>

<style lang="scss">
@import "./scss/input";
</style>
