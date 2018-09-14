<template>
  <label class="switch-field">
    <input class="switch-field__input"
            type="checkbox"
            :checked="checked"
            :disabled="disabled"
            :name="name"
            :id="id"
            :value="cbValue"
            :required="required"
            :autofocus="autofocus"
            @change="onChange">
    <span class="switch-field__slider"></span>
  </label>
</template>


<script>
  export default {
    name: 'Switch-field',
    props: {
      label: { type: String, default: 'Label' },
      value: { default: false },

      // proxies
      name: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      cbValue: { default: undefined },
      title: { type: [String, Number], default: undefined },
      required: { type: Boolean, default: false },
      autofocus: { type: Boolean, default: false }
    },
    components: {
    },
    data: _ => ({
    }),
    created () {
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
      }
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
      }
    },
    watch: {
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  .switch-field {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 16px;
    .switch-field__input {
      display: none;
    }
  }

  .switch-field__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: $color-bg;
    transition: .4s;
    -webkit-transition: .4s;
    &:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 0px;
      bottom: -3px;
      background-color: $color-content-bg;
      transition: .4s;
      -webkit-transition: .4s;
    }
  }

.switch-field__input:checked + .switch-field__slider {
  background-color: $color-active;
}

.switch-field__input:focus + .switch-field__slider {
  box-shadow: 0 0 1px $color-sub-nav-bg;
}

.switch-field__input:checked + .switch-field__slider:before {
  -webkit-transform: translateX(18px);
  -ms-transform: translateX(18px);
  transform: translateX(18px);
}

.switch-field__slider {
  border-radius: 34px;
  &:before {
    box-shadow: 0 0 2px $color-active;
    border-radius: 50%;
  }
}
</style>
