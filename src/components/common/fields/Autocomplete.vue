<template>
  <div 
    class="autocomplete"
    v-if="dropdownShown"
  >
    <button
      class="autocomplete-option"
      :class="{ 'autocomplete-option--active': item[autocompleteType] === hoveredValue }"
      v-for="item in list"
      :key="item[autocompleteType]"
      :id="item[autocompleteType]"
      :ref="item[autocompleteType]"
      @mousedown="emitDataToSetInputValue"
      @mouseover="hoveredValue = item[autocompleteType]"
    >
      {{ item[autocompleteType] }}
    </button>
  </div>
</template>

<script>
import { clearObject } from '@/utils/clearObject'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'
import _ from 'lodash'

export default {
  props: {
    inputValue: { type: String, default: '' },
    autocompleteType: { type: String, default: '' },
    shouldShowDropdown: { type: Boolean, default: false }
  },

  components: {
    // components
  },

  data () {
    return {
      hoveredValue: '',
      list: [],
      closeDropdown: false
    }
  },

  computed: {
    dropdownShown () {
      if (this.shouldShowDropdown) {
        window.addEventListener('keydown', this.onKey)
        window.addEventListener('mouseup', this.onClick)
        this.closeDropdown = false
      }
      if (this.closeDropdown) {
        window.removeEventListener('mouseup', this.onClick, false)
        window.removeEventListener('keydown', this.onKey, false)
      }
      return this.shouldShowDropdown | !this.closeDropdown
    }
  },

  created () {
    // created
  },

  methods: {

    async getList () {
      let response = []
      if (this.inputValue || this.enteredAddress) {
        try {
          response = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', {
              filter: clearObject({
                [this.autocompleteType]: this.inputValue
              })
            })
          this.list = response.data
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      } else {
        this.list = response
      }
    },

    setHoverOnKeyPress (element) {
      this.hoveredValue = element.id
      element.focus()
      event.preventDefault()
    },

    onKey (event) {
      const currentElement = this.hoveredValue ? document.getElementById(this.hoveredValue) : undefined
      const hasNextSibling = currentElement && currentElement.nextSibling
      const hasPreviousSibling = currentElement && currentElement.previousSibling
      const firstElement = this.$el.firstChild
      const input = this.$parent.$el.querySelector('input')

      if (this.list.length) {
        switch (event.key) {
          case 'ArrowUp':
            hasPreviousSibling ? this.setHoverOnKeyPress(currentElement.previousSibling) : null
            !currentElement ? this.setHoverOnKeyPress(firstElement) : null
            break

          case 'ArrowDown':
            hasNextSibling ? this.setHoverOnKeyPress(currentElement.nextSibling) : null
            !currentElement ? this.setHoverOnKeyPress(firstElement) : null
            break

          case 'Enter':
            currentElement ? this.emitDataToSetInputValue() : null
            break

          case 'Escape':
            input.blur()
            this.closeDropdown = true
            break

          case 'Tab':
            this.$emit('tab')
            this.closeDropdown = true
            break

          default:
            input.focus()
            break
        }
      }
    },

    emitDataToSetInputValue () {
      this.$emit('set-input-value', this.hoveredValue)
      this.closeDropdown = true
    },

    onClick (event) {
      this.closeDropdown = true
    }
  },
  watch: {
    'inputValue': _.debounce(function () {
      this.getList()
    }, 400)
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/_colors.scss";

.autocomplete-option {
  display: block;
  width: 100%;
  padding: 1rem;

  &--active {
    background-color: $color-unfocused;
  }
}
</style>
