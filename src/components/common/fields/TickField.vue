<template>
  <div class="tick-field">
    <div class="tick-field__input-wrp">
      <input
        class="tick-field__input"
        type="checkbox"
        :checked="checked"
        :disabled="disabled"
        :name="name"
        :id="id"
        :value="cbValue"
        :required="required"
        :autofocus="autofocus"
        @change="onChange">

      <label
        class="tick-field__label"
        :for="id"
        :title="title">
        {{ label }}
      </label>

      <span
        class="tick-field__tick"
        :for="id"
        :title="title">
        <!-- css art -->
      </span>
    </div>

    <div
      v-if="showHelp"
      class="tick-field__tip"
    >
      <mdi-help-circle-icon class="tick-field__tip-icon" />
      <div class="tick-field__tip-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, default: 'Label' },
    showHelp: { type: Boolean, default: false },
    value: { type: [String, Number, Array, Boolean], default: false },

    // proxies
    name: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    // eslint-disable-next-line vue/require-prop-types
    cbValue: { default: undefined },
    title: { type: [String, Number], default: undefined },
    required: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
  },

  computed: {
    id () {
      return `tick-field-${this._uid}`
    },

    checked () {
      const model = this.value
      const value = this.cbValue
      if (typeof value === 'undefined') {
        return model
      }

      let result
      switch (this.typeof(model)) {
        case 'number':
          result = model & +value
          break

        case 'array':
          result = ~model.findIndex((item) => item === value)
          break

        default:
          result = model
          break
      }
      return result
    },
  },

  methods: {
    onChange (event) {
      const isChecked = event.target.checked
      const model = this.value
      const value = this.cbValue || isChecked

      if (typeof value === 'undefined') {
        return this.$emit('input', isChecked)
      }

      switch (this.typeof(model)) {
        case 'number':
          this.$emit('input', isChecked ? model + +value : model - value)
          break

        case 'array':
          this.$emit('input', isChecked
            ? model.concat(value)
            : model.filter((item) => item !== value)
          )
          break

        default:
          this.$emit('input', isChecked)
          break
      }
    },

    typeof (value) {
      const type = typeof value

      let result
      switch (type) {
        case 'object':
          if (Array.isArray(value)) result = 'array'
          if (value === null) result = 'null'
          break

        default:
          result = type
          break
      }
      return result
    },
  },
}
</script>

<style lang="scss" scoped>
@import "./scss/fields-variables";

.tick-field {
  position: relative;
  display: flex;
}

.tick-field__input-wrp {
  position: relative;
  display: flex;
  z-index: 0; // HACK: fix cut of transforms on some browsers (chrome)
}

.tick-field__label {
  @include text-font-sizes;
  padding-left: 2.5rem;
}

.tick-field__tick,
.tick-field__label {
  cursor: pointer;
}

.tick-field__tick {
  width: 1.6rem;
  min-width: 1.6rem;
  height: 1.6rem;
  margin: 0.2rem 1.3rem 0 0;
  // z-index: 0;
  border: solid 0.2rem;
  border-radius: 0.3rem;
  border-color: $field-color-unfocused;
  position: absolute;
  left: 0;
  display: block;
  pointer-events: none;

  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-0.1rem) rotate(45deg);
    display: block;
    height: 1rem;
    width: 0.6rem;
    border: solid white;
    border-width: 0 0.2rem 0.2rem 0;

    opacity: 0;
  }
}

.tick-field__input:checked ~ .tick-field__tick {
  border: none;
  background-color: $field-color-focused;

  &:after {
    opacity: 1;
  }
}

.tick-field__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;

  &:checked ~ .tick-field__tick {
    border: none;
    background-color: $field-color-focused;

    &:after {
      opacity: 1;
    }
  }

  &:disabled ~ .tick-field__tick,
  &:disabled ~ .tick-field__label {
    filter: grayscale(100%);
    cursor: default;
    color: $field-color-unfocused;
  }
}

.tick-field__tip {
  position: relative;
  margin-left: 0.4rem;

  &:hover {
    .tick-field__tip-content {
      display: flex;
    }
  }
}

.tick-field__tip-content {
  z-index: 1;
  background-color: rgba($color-text, 0.95);
  border-radius: 0.3rem;
  top: 2rem;
  color: $color-text-inverse;
  display: none;
  right: 0;
  position: absolute;
  padding: 1rem;
}

.tick-field__tip-icon {
  cursor: help;
  display: flex;
  width: 1.8rem;
  fill: $field-color-unfocused;
}
</style>
