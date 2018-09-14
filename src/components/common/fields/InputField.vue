<template>
  <div class="input-field"
    :class="{'input-field--error': errorMessage}">
    <input class="input-field__input"
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
      :class="'text-align-' + align"
      :title="title"
      :form="form"
      @input="onInput"
    >

    <span class="input-field__label">
      {{label}}
    </span>

    <transition name="input-field__err-transition">
      <p class="input-field__err-mes" v-if="errorMessage">
        {{errorMessage}}
      </p>
    </transition>
  </div>
</template>

<script>
export default {
  components: {
    // components
  },

  props: {
    label: { type: String, default: 'Label' },
    value: { type: [String, Number], default: undefined },
    errorMessage: { type: String, default: undefined },
    align: { type: String, default: 'left' },
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
    step: { type: [String, Number], default: undefined }
  },

  data () {
    return {
      // data
    }
  },

  created () {
    // created
  },

  computed: {
    // computed
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
        return
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
        return
      } else {
        const detectRe = new RegExp(`(?:\\.|,)\\d{${precision + 1},}$`)
        if (detectRe.test(value)) {
          const replaceRe = new RegExp(`((?:\\.|,)\\d{${precision}})\\d*`)
          target.value = value.replace(replaceRe, '$1')
        }
      }
    }
  }
}
</script>

<style lang="scss">
  @import "./scss/input";
</style>
