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
      @mousedown="setEmail(inputType)"
      @mouseover="setActiveOption(item)"
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
    filtersEmail: { type: String, default: '' },
    filtersAddress: { type: String, default: '' },
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
      activeInputEvent: {}
    }
  },

  created () {
    // created
  },

  methods: {

    async getEmailsList () {
      let response = []
      if (this.filtersEmail || this.filtersAddress) {
        try {
          response = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', {
              filter: clearObject({
                email: this.filtersEmail,
                address: this.filtersAddress
              })
            })
          this.$emit('setAutocompleteData', response.data)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      } else {
        this.$emit('setAutocompleteData', [])
      }
    },

    setSelectedOption (element) {
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
              this.setSelectedOption(previousElement)
            }
            if (!currentElement) {
              const firstElement = this.$refs[this.autocompleteData[0].address][0]
              this.setSelectedOption(firstElement)
            }
            break

          case 'ArrowDown':
            if (hasNextSibling) {
              const nextElement = this.$refs[currentElement.nextSibling.id][0]
              this.setSelectedOption(nextElement)
            }
            if (!currentElement) {
              const firstElement = this.$refs[this.autocompleteData[0].address][0]
              this.setSelectedOption(firstElement)
            }
            break

          case 'Enter':
            if (currentElement) {
              this.setEmail(this.inputType)
              window.removeEventListener('mouseup', this.onClick, false)
            }
            break

          case 'Escape':
            this.closeDropdown()
            window.removeEventListener('mouseup', this.onClick, false)
            break

          default:
            this.activeInputEvent.target.focus()
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

    setEmail (typeOfClickedInput) {
      switch (typeOfClickedInput) {
        case 'email':
          this.$emit('email', this.activeEmail)
          break
        case 'address':
          this.$emit('address', this.activeAddress)
      }
      this.closeDropdown()
    },

    setActiveOption (data) {
      this.activeEmail = data.email
      this.activeAddress = data.address
    },

    onClick (event) {
      const clickOnInputField = !(this.activeInputEvent && (event.target === this.activeInputEvent.target))
      if (clickOnInputField) {
        this.closeDropdown()
        window.removeEventListener('mouseup', this.onClick, false)
      }
    },

    addKeyHandler () {
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
      this.activeInputEvent = event
      this.isInputFocused = true
      this.addKeyHandler()
      this.addClickHandler()
    }
  },
  watch: {
    'filtersAddress': _.debounce(function () {
      this.getEmailsList()
    }, 400),

    'filtersEmail': _.debounce(function () {
      this.getEmailsList()
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
