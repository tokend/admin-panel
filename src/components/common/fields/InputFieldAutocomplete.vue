<template>
  <div 
    class="autocomplete"
    v-if="isDropdownShown"
  >
    <button
      class="autocomplete__option"
      :class="{ 
        'autocomplete__option--active':
        getOptionValue(item) === hoveredElementId
      }"
      v-for="item in list"
      :key="getOptionValue(item)"
      :id="getOptionValue(item)"
      @click="emitOptionSelected"
      @mouseover="hoveredElementId = getOptionValue(item)"
    >
      {{ getOptionValue(item) }}
    </button>
  </div>
</template>

<script>
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { debounce } from 'lodash'

const EMIT_EVENTS = {
  tab: 'tab',
  optionSelected: 'option-selected'
}

export default {
  props: {
    inputValue: { type: String, default: '' },
    autocompleteType: { type: String, default: '' },
    isInputFocused: { type: Boolean, default: false }
  },

  data () {
    return {
      hoveredElementId: '',
      list: [],
      isDropdownShown: false
    }
  },

  methods: {

    async getList () {
      let response = []
      if (this.inputValue) {
        try {
          response = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', {
              filter: {
                [this.autocompleteType]: this.inputValue
              }
            })
          this.list = response.data
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      } else {
        this.list = response
      }
    },

    setHover (element) {
      this.hoveredElementId = element.id
      element.focus()
    },

    onKeyDown (event) {
      const currentHoveredOption = this.hoveredElementId
        ? document.getElementById(this.hoveredElementId)
        : undefined
      const hasNextSibling = currentHoveredOption &&
        currentHoveredOption.nextSibling
      const hasPreviousSibling = currentHoveredOption &&
        currentHoveredOption.previousSibling
      const firstOption = this.$el.firstChild

      if (this.list.length) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault()
            if (hasPreviousSibling) {
              this.setHover(currentHoveredOption.previousSibling)
            }
            if (!currentHoveredOption) {
              this.setHover(firstOption)
            }
            break

          case 'ArrowDown':
            event.preventDefault()
            if (hasNextSibling) {
              this.setHover(currentHoveredOption.nextSibling)
            }
            if (!currentHoveredOption) {
              this.setHover(firstOption)
            }
            break

          case 'Enter':
            if (currentHoveredOption) {
              this.emitOptionSelected()
              this.closeDropdown()
            }
            break

          case 'Escape':
            this.closeDropdown()
            break

          case 'Tab':
            this.$emit(EMIT_EVENTS.tab)
            this.closeDropdown()
            break
        }
      }
    },

    emitOptionSelected () {
      this.$emit(EMIT_EVENTS.optionSelected, this.hoveredElementId)
    },

    onClick (event) {
      if (!this.isInputFocused) {
        this.closeDropdown()
      }
    },

    getOptionValue (item) {
      return item[this.autocompleteType]
    },

    closeDropdown () {
      this.isDropdownShown = false
      window.removeEventListener('click', this.onClick, false)
      window.removeEventListener('keydown', this.onKeyDown, false)
    },

    openDropdown () {
      if (this.isInputFocused) {
        window.addEventListener('keydown', this.onKeyDown)
        window.addEventListener('click', this.onClick)
        this.isDropdownShown = true
      }
    }
  },
  watch: {
    'inputValue': debounce(function () {
      this.getList()
    }, 400),

    'isInputFocused' () {
      this.openDropdown()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/_colors.scss";
@import "./scss/fields-variables";

.autocomplete {
  @include text-font-sizes;
  position: absolute;
  width: 100%;
  background-color: $color-content-bg;
  left: 0;
  min-width: 16rem;
  top: calc(100% + 0.1rem);
  border-radius: 0.3rem;
  z-index: 5;
  max-height: 24.4rem;
  overflow-y: auto;
  box-shadow: 0 0.4rem 1rem 0 rgba(0, 0, 0, 0.15);

  .autocomplete__option {
    display: block;
    min-width: 100%;
    padding: 1rem;

    &--active {
      background-color: $color-unfocused;
    }
  }
}


</style>
