<template>
  <div class="select-field"
    :class="{'select-field--error': errorMessage}">
    <select class="select-field__select"
      :class="{'select-field__select--empty': !(value || emptyText)}"
      :disabled="disabled"
      :name="name"
      :value="value"
      :required="required"
      :autofocus="autofocus"
      @change="onChange">
      <option class="select-field__default-option"
        :selected="!value"
        v-if="emptyText"
        disabled>
        {{emptyText}}
      </option>
      <slot/>
    </select>

    <div class="select-field__arrow">
      <!-- css art -->
    </div>

    <span class="select-field__label">
      {{label}}
    </span>

    <transition name="select-field__err-transition">
      <p class="select-field__err-mes" v-if="errorMessage">
        {{errorMessage}}
      </p>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, default: 'Label' },
    value: { default: false },
    errorMessage: { type: String, default: undefined },
    emptyText: { type: [String, Number], default: undefined },

    // proxies
    name: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    title: { type: [String, Number], default: undefined },
    required: { type: Boolean, default: true }
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
    onChange (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./scss/fields-variables";

.select-field {
  position: relative;
  z-index: 0;
}

.select-field__arrow {
  position: absolute;
  bottom: calc(50% - #{$field-input-padding-top} + #{$field-input-padding-bottom});
  right: $field-input-padding-bottom / 2;
  width: .6rem;
  height: .6rem;
  z-index: 0;
  pointer-events: none;

  &:after {
    content: "";
    display: block;
    border: solid $field-color-text;
    width: 1.5rem;
    height: 1.5rem;
    border-width: 0 .2rem .2rem 0;
    transform: scale(.5) translate(-100%, -100%) rotate(45deg);
  }
}

.select-field__select {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  border: 0;
  background: 0;
  padding: $field-input-padding;
  padding-right: 2rem; // space for the arrow
  color: $field-color-text;
  cursor: pointer;
  @include material-border($field-color-focused);
  @include text-font-sizes;
}

.select-field__label {
  position: absolute;
  left: 0;
  top: 0;
  transition: all $field-transition-duration;
  pointer-events: none;
  color: $field-color-unfocused;
  @include label-font-sizes;
}

.select-field__select:focus ~ .select-field__label {
  color: $field-color-focused;
}

.select-field__select:not(:focus).select-field__select--empty
  ~ .select-field__label {
  top: $field-input-padding-top;
  @include text-font-sizes;
}

.select-field__select:disabled {
  cursor: default;
  filter: grayscale(100%);
  color: $field-color-unfocused;

  & ~ .input-field__label {
    filter: grayscale(100%);
  }
}

.select-field__err-mes {
  color: $field-color-error;
  margin-top: $field-error-margin-top;
  font-size: $field-error-font-size;
  line-height: $field-error-line-height;
}

.select-field {
  &--error {
    & > .select-field__label,
    & > .select-field__select:focus ~ .select-field__label {
      color: $field-color-error;
    }

    & > .select-field__value {
      @include material-border($field-color-error);
    }
  }
}

.select-field__err-transition-enter-active {
  animation: select-field__err-transition-keyframes $field-transition-duration
    ease-in-out;
}

.select-field__err-transition-leave-active {
  animation: select-field__err-transition-keyframes $field-transition-duration
    ease-in-out reverse;
}

@keyframes select-field__err-transition-keyframes {
  from {
    max-height: 0;
    margin-top: 0;
    overflow: hidden;
  }
  to {
    max-height: $field-error-font-size * $field-error-line-height;
    margin-top: $field-error-margin-top;
    overflow: hidden;
  }
}
</style>
