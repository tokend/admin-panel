<template>
  <input-field
    class="app-list-filters__field"
    v-model.trim="filters.email"
    label="Email"
    email-autocomplete
  >
    <button href="#"
      class="autocomplete-option"
      :class="{'autocomplete-option--active': item.address === activeOption}"
      v-for="item in emailAddress" 
      v-bind:key="item.email"
      :id="item.address"
      :ref="item.address"
      @mousedown="filters.email = item.email"
      @mouseover="activeOption = item.address"
    >
      {{ item.email }}
    </button>
  </input-field>
</template>

<script>
import Vue from 'vue'
// import api from '@/api'
// import { Sdk } from '@/sdk'
import { clearObject } from '@/utils/clearObject'
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { AccountStateGetter } from '@comcom/getters'
import UserView from '../Users.Show'
import _ from 'lodash'
import 'mdi-vue/DownloadIcon'
import { ApiCallerFactory } from '@/api-caller-factory'
import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'

const VIEW_MODES_VERBOSE = Object.freeze({
  index: 'index',
  user: 'user'
})

export default {
  components: {
    SelectField,
    InputField,
    UserView,
    AccountStateGetter
  },

  data () {
    return {
      VIEW_MODES_VERBOSE,
      filters: {
        email: '',
        address: '',
        role: ''
      },
      view: {
        mode: VIEW_MODES_VERBOSE.index,
        userId: null,
        scrollPosition: 0
      },
      list: {},
      isListEnded: false,
      isLoading: false,
      emailAddress: [],
      activeOption: '',

      ACCOUNT_ROLES: config.ACCOUNT_ROLES
    }
  },

  created () {
    this.getList()
    window.addEventListener('keydown', this.onKey)
  },

  methods: {
    async getList () {
      this.isLoading = true
      try {
        this.list = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/identities', {
            filter: clearObject({
              email: this.filters.email,
              role: this.filters.role,
              address: this.filters.address
            })
          })
        this.isListEnded = !(this.list.data || []).length
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isLoading = false
    },

    async onMoreClick () {
      try {
        const oldLength = this.list.data.length
        const chunk = await this.list.fetchNext()
        this.list._data = this.list.data.concat(chunk.data)
        this.list.fetchNext = chunk.fetchNext
        this.isListEnded = oldLength === this.list.data.length
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    toggleViewMode (id) {
      if (id) {
        this.view.mode = VIEW_MODES_VERBOSE.user
        this.view.userId = id
        this.view.scrollPosition = window.scrollY
        return
      }
      this.view.mode = VIEW_MODES_VERBOSE.index
      this.view.userId = null
      Vue.nextTick(() => {
        window.scroll(0, this.view.scrollPosition)
        this.view.scrollPosition = 0
      })
    },

    async getEmailsList () {
      if (this.filters.email || this.filters.address) {
        try {
          const response = await ApiCallerFactory
            .createCallerInstance()
            .getWithSignature('/identities', {
              filter: clearObject({
                email: this.filters.email,
                address: this.filters.address
              })
            })
          this.emailAddress = response.data
          console.log(this.emailAddress)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      } else {
        this.emailAddress = []
      }
    },

    onKey (event) {
      const currentElement = this.getActiveElement()
      if (currentElement && event.key === 'ArrowUp' && this.emailAddress.length && currentElement.previousSibling) {
        this.activeOption = this.$refs[currentElement.previousSibling.id][0].id
        this.$refs[currentElement.previousSibling.id][0].focus()
        console.log(this.$refs[currentElement.previousSibling.id])
        event.preventDefault()
      }
      if (currentElement && event.key === 'ArrowDown' && this.emailAddress.length && currentElement.nextSibling) {
        this.activeOption = this.$refs[currentElement.nextSibling.id][0].id
        this.$refs[currentElement.nextSibling.id][0].focus()
        console.log(this.$refs[currentElement.nextSibling.id])
        event.preventDefault()
      }

      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && this.emailAddress.length && !currentElement) {
        this.activeOption = this.$refs[this.emailAddress[0].address][0].id
        this.$refs[this.emailAddress[0].address][0].focus()
        event.preventDefault()
      }

      if (currentElement && event.key === 'Enter' && this.emailAddress.length) {
        this.filters.email = this.activeOption
      }
    },

    getActiveElement () {
      let element
      if (this.activeOption) {
        element = document.getElementById(this.activeOption)
      }
      return element
    },

    clickOnInput (event) {
      // if (event.key === 'ArrowUp' && this.emailAddress.length) {
      console.log(event)
      const clickOnInputEventListaner = window.addEventListener('mousedown', function () {
        console.log(2222)
        window.removeEventListener('mousedown', clickOnInputEventListaner)
      })
      // }
    }
  },

  watch: {
    'filters.state' () {
      this.getList()
    },
    'filters.role' () {
      this.getList()
    },
    'filters.email': _.debounce(function () {
      this.getList()
      this.getEmailsList()
    }, 400),
    'filters.address': _.debounce(function () {
      this.getList()
      this.getEmailsList()
    }, 400)
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/_colors.scss";

.user-list__filters-wrp {
  margin-bottom: 4rem;
}

.user-list__download-btn,
.user-list__download-link {
  background: $color-content-bg;
  box-shadow: 0px 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  display: inline-block;
  font-size: 1.6rem;
  padding: 5px 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  color: $color-text;

  svg {
    height: 16px;
    margin-left: 5px;
    transform: translateY(4px);
    width: 16px;
  }
}

.autocomplete-option {
  display: block;
  width: 100%;
  padding: 1rem;

  &--active {
    background-color: $color-unfocused;
  }
}
</style>
