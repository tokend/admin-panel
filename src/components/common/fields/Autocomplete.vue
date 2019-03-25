<template>
  <div 
    class="autocomplete"
    v-if="isDropdownShown"
  >
    <button
      class="autocomplete-option"
      :class="{ 'autocomplete-option--active': getOptionValue(item) === hoveredOptionId }"
      v-for="item in list"
      :key="getOptionValue(item)"
      :id="getOptionValue(item)"
      @click="emitSetInputValue"
      @mouseover="hoveredOptionId = getOptionValue(item)"
    >
      {{ getOptionValue(item) }}
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
    isInputFocused: { type: Boolean, default: false }
  },

  data () {
    return {
      hoveredOptionId: '',
      list: [],
      isDropdownFocused: false
    }
  },

  computed: {
    isDropdownShown () {
      if (this.isInputFocused) {
        this.getList()
        window.addEventListener('keydown', this.onKeyDown)
        window.addEventListener('click', this.onClick)
        this.isDropdownFocused = true
      }
      if (!this.isDropdownFocused) {
        window.removeEventListener('click', this.onClick, false)
        window.removeEventListener('keydown', this.onKeyDown, false)
      }
      return this.isInputFocused | this.isDropdownFocused
    }
  },

  methods: {

    async getList () {
      let response = []
      if (this.inputValue) {
        try {
          response = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', this.generateRequestObject())
          this.list = response.data
        } catch (error) {
          ErrorHandler.process(error)
        }
      } else {
        this.list = response
      }
    },

    setHover (element) {
      this.hoveredOptionId = element.id
      element.focus()
      event.preventDefault()
    },

    generateRequestObject () {
      return {
        filter: clearObject({
          [this.autocompleteType]: this.inputValue
        })
      }
    },

    onKeyDown (event) {
      const currentHoveredOption = this.hoveredOptionId
        ? document.getElementById(this.hoveredOptionId)
        : undefined
      const hasNextSibling = currentHoveredOption && currentHoveredOption.nextSibling
      const hasPreviousSibling = currentHoveredOption && currentHoveredOption.previousSibling
      const firstOption = this.$el.firstChild
      const input = this.$parent.$el.querySelector('input')

      if (this.list.length) {
        switch (event.key) {
          case 'ArrowUp':
            if (hasPreviousSibling) {
              this.setHover(currentHoveredOption.previousSibling)
            }
            if (!currentHoveredOption) {
              this.setHover(firstOption)
            }
            break

          case 'ArrowDown':
            if (hasNextSibling) {
              this.setHover(currentHoveredOption.nextSibling)
            }
            if (!currentHoveredOption) {
              this.setHover(firstOption)
            }
            break

          case 'Enter':
            currentHoveredOption ? this.emitSetInputValue() : null
            break

          case 'Escape':
            input.blur()
            this.isDropdownFocused = false
            break

          case 'Tab':
            this.$emit('tab')
            this.isDropdownFocused = false
            break

          default:
            input.focus()
            break
        }
      }
    },

    emitSetInputValue () {
      this.$emit('set-input-value', this.hoveredOptionId)
      this.isDropdownFocused = false
    },

    onClick (event) {
      this.isDropdownFocused = false
    },

    getOptionValue (item) {
      return item[this.autocompleteType]
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
