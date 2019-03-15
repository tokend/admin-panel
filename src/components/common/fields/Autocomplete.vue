<template>
  <div 
    class="autocomplete"
    v-if="isEmailInputFocused === 'true'"
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
      emailAddress: [],
      activeEmail: '',
      activeAddress: '',
      isVisible: false
    }
  },

  created () {
    // this.getEmailsList()

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
          this.isVisible = true
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      } else {
        this.$emit('setAutocompleteData', [])
      }
    },

    onKey (event) {
      const currentElement = this.getActiveElement()

      if (this.autocompleteData.length) {
        if (currentElement) {
          if (event.key === 'ArrowUp' && currentElement.previousSibling) {
            const previousElement = this.$refs[currentElement.previousSibling.id][0]
            this.activeEmail = previousElement.dataset.email
            this.activeAddress = previousElement.id
            previousElement.focus()
            event.preventDefault()
          }
          if (event.key === 'ArrowDown' && currentElement.nextSibling) {
            const nextElement = this.$refs[currentElement.nextSibling.id][0]
            this.activeEmail = nextElement.dataset.email
            this.activeAddress = nextElement.id
            nextElement.focus()
            event.preventDefault()
          }
          if (currentElement && event.key === 'Enter') {
            this.setEmail()
          }
        } else {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const firstElement = this.$refs[this.autocompleteData[0].address][0]
            this.activeEmail = firstElement.dataset.email
            this.activeAddress = firstElement.id
            firstElement.focus()
            event.preventDefault()
          }
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
    },

    setActiveOption (data) {
      this.activeEmail = data.email
      this.activeAddress = data.address
    },

    onClick (event) {
      console.log('dropdown closed')
      window.removeEventListener('click', this.onClick)
    },

    addKeyHandler () {
      window.addEventListener('keydown', this.onKey)
    },

    addClickHandler () {
      window.addEventListener('click', this.onClick)
    }
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
