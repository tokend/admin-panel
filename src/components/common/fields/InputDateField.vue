<template>
  <div class="input-field"
       :class="{'input-field--error': error}">
    <flat-pickr id="date"
                class="input-field__input"
                :config="config"
                :value="value"
                @input.native="onInput"
                placeholder=" ">
    </flat-pickr>

    <span class="input-field__label">
      {{label}}
    </span>

    <transition name="input-field__err-transition">
      <p class="input-field__err-mes">
        {{ error }}
      </p>
    </transition>
  </div>

</template>

<script>
  import FlatPickr from 'vue-flatpickr-component'
  import moment from 'moment'

  export default {

    components: {
      FlatPickr
    },

    props: {
      error: { type: [String, Boolean], default: '' },
      placeholder: { type: String, default: '' },
      label: { type: String, default: 'Label' },
      type: { type: String, default: 'text' },
      value: { type: String, default: '' },
      enableTime: {
        type: Boolean,
        default: true
      },
      disableBefore: {
        type: String,
        default: ''
      },
      disableAfter: {
        type: String,
        default: ''
      }
    },

    data () {
      return {
        date: '',
        config: {
          altInput: true,
          altFormat: this.enableTime ? 'F j, Y at H:i' : 'F j, Y',
          disableMobile: true,
          disable: [
            (date) => {
              if (!this.disableBefore) return false
              const stamp = moment(this.disableBefore)
              return moment(date).isBefore(stamp)
            },
            (date) => {
              if (!this.disableAfter) return false
              const stamp = moment(this.disableAfter)
              return moment(date).isAfter(stamp)
            }
          ],
          enableTime: this.enableTime,
          time_24hr: true
        }
      }
    },
    methods: {
      onInput (event) {
        this.$emit('input', event.target.value)
      },
      onKeypress (event) {
        if (this.type !== 'number') return
        this.$number.testNumber(event)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "./scss/input";

  .date-field__calendar-input {
    position: absolute;
    right: 5px;
    pointer-events: none;
  }

  input {
    @extend .input-field__input
  }
</style>
