<template>
  <div 
    class="autocomplete"
    v-if="isInputFocused"
  >
    <button
      class="autocomplete-option"
      :class="{'autocomplete-option--active': item.email === activeEmail}"
      v-for="item in autocompleteData" 
      v-bind:key="item.email"
      :id="item.address"
      :ref="item.address"
      :data-email="item.email"
      @mousedown="emitDataToSetInputValue(inputType)"
      @mouseover="setHoverOnMouseOver(item)"
    >
      {{ item[inputType] }}
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
    enteredEmail: { type: String, default: '' },
    enteredAddress: { type: String, default: '' },
    inputType: { type: String, default: '' },
    autocompleteData: { type: Array, default: [] },
    isEmailInputFocused: { type: String, default: 'false' }
  },

  components: {
    // components
  },

  data () {
    return {
      activeEmail: '',
      activeAddress: '',
      isInputFocused: false,
      inputEvent: {}
    }
  },

  created () {
    // created
  },

  methods: {

    async getList () {
      let response = []
      if (this.enteredEmail || this.enteredAddress) {
        try {
          response = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', {
              filter: clearObject({
                email: this.enteredEmail,
                address: this.enteredAddress
              })
            })
          this.$emit('setAutocompleteData', response.data)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      } else {
        this.$emit('setAutocompleteData', response)
      }
    },

    setHoverOnKeyPress (element) {
      this.activeEmail = element.dataset.email
      this.activeAddress = element.id
      element.focus()
      event.preventDefault()
    },

    onKey (event) {
      const currentElement = this.getActiveElement()
      const hasNextSibling = currentElement && currentElement.nextSibling
      const hasPreviousSibling = currentElement && currentElement.previousSibling

      if (this.autocompleteData.length) {
        switch (event.key) {
          case 'ArrowUp':
            if (hasPreviousSibling) {
              const previousElement = this.$refs[currentElement.previousSibling.id][0]
              this.setHoverOnKeyPress(previousElement)
            }
            if (!currentElement) {
              const firstElement = this.$refs[this.autocompleteData[0].address][0]
              this.setHoverOnKeyPress(firstElement)
            }
            break

          case 'ArrowDown':
            if (hasNextSibling) {
              const nextElement = this.$refs[currentElement.nextSibling.id][0]
              this.setHoverOnKeyPress(nextElement)
            }
            if (!currentElement) {
              const firstElement = this.$refs[this.autocompleteData[0].address][0]
              this.setHoverOnKeyPress(firstElement)
            }
            break

          case 'Enter':
            if (currentElement) {
              this.emitDataToSetInputValue(this.inputType)
              this.closeDropdown()
            }
            break

          case 'Escape':
            this.closeDropdown()
            break

          default:
            this.inputEvent.target.focus()
            break
        }
      }
    },

    getActiveElement () {
      let element
      if (this.activeAddress) {
        element = document.getElementById(this.activeAddress)
      }
      return element
    },

    emitDataToSetInputValue (typeOfClickedInput) {
      let value
      if (typeOfClickedInput === 'email') {
        value = this.activeEmail
      }
      if (typeOfClickedInput === 'address') {
        value = this.activeAddress
      }
      this.$emit('setInputValue', value)
      this.closeDropdown()
    },

    setHoverOnMouseOver (data) {
      this.activeEmail = data.email
      this.activeAddress = data.address
    },

    onClick (event) {
      const clickOnInputField = !(this.inputEvent && (event.target === this.inputEvent.target))
      if (clickOnInputField) {
        this.closeDropdown()
      }
    },

    addKeydownHandler () {
      window.addEventListener('keydown', this.onKey)
    },

    addClickHandler () {
      window.addEventListener('mouseup', this.onClick)
    },

    closeDropdown () {
      this.isInputFocused = false
      window.removeEventListener('mouseup', this.onClick, false)
      window.removeEventListener('keydown', this.onKey, false)
    },

    openDropdown (event) {
      this.inputEvent = event
      this.isInputFocused = true
      this.addKeydownHandler()
      this.addClickHandler()
    }
  },
  watch: {
    'enteredEmail': _.debounce(function () {
      this.getList()
    }, 400),

    'enteredAddress': _.debounce(function () {
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
