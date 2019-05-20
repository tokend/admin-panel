<template>
  <div
    class="input-field"
    :class="{'input-field--error': errorMessage}"
  >
    <input
      class="input-field__input"
      :class="{ 'input-field__input--placeholder-auto-hidden': label }"
      :type="type"
      :placeholder="placeholder || ' '"
      :value="value"
      :disabled="disabled"
      :name="name"
      :autocomplete="autocomplete"
      :autofocus="autofocus"
      :min="min"
      :max="max"
      :step="step"
      :required="required"
      :readonly="readonly"
      :title="title"
      :form="form"
      @input="onInput"
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

    <div
      v-if="showHelp"
      class="input-field__tip"
    >
      <mdi-help-circle-icon class="input-field__tip-icon" />
      <div class="input-field__tip-content">
        <slot />
      </div>
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

import 'mdi-vue/HelpCircleIcon'

export default {
  components: {
    InputFieldAutocomplete,
  },

  props: {
    label: { type: String, default: '' },
    showHelp: { type: Boolean, default: false },
    value: { type: [String, Number], default: undefined },
    errorMessage: { type: String, default: undefined },
    autocompleteType: { type: String, default: '' },
    // proxies
    autocomplete: { type: String, default: 'off' },
    autofocus: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    title: { type: [String, Number], default: undefined },
    form: { type: [String, Number], default: null },

    // [type="number"] proxies
    min: { type: [String, Number], default: undefined },
    max: { type: [String, Number], default: undefined },
    step: { type: [String, Number], default: undefined },
  },

  data () {
    return {
      isInputFocused: false,
    }
  },

  methods: {
    onInput (event) {
      this.beforeEmit(event.target)
      this.$emit('input', event.target.value)
    },

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
      const max = '' + this.max
      const min = '' + this.min

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
        precision = this.step.match(/(?:\.|,)\d+$/)[0].slice(1).length
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
