<template>
  <div class="request-list">

    <template v-if="view.mode === VIEW_MODES_VERBOSE.index">

      <div class="request-list__filters-wrp">
        <div class="app-list-filters">
          <input-field class="app-list-filters__field" v-model.trim="filters.email" label="Email" />

          <select-field class="app-list-filters__field" v-model="filters.state" label="State">
            <option v-for="state in Object.keys(KYC_REQUEST_STATES)" :value="state">{{ KYC_REQUEST_STATES[state].label }}</option>
          </select-field>

          <input-field class="app-list-filters__field" v-model.trim="filters.address" label="Account ID" />
        </div>
      </div>


      <div class="request-list__list-wrp">

        <template v-if="list.data && list.data.length">
          <div class="app-list">
            <div class="app-list__header">
              <span class="app-list__cell">Email</span>
              <span class="app-list__cell app-list__cell--right">State</span>
              <span class="app-list__cell app-list__cell--right">Account type</span>
              <span class="app-list__cell app-list__cell--right">Last updated</span>
            </div>

            <button class="app-list__li" v-for="item in list.data" :key="item.id" @click="toggleViewMode(item.accountToUpdateKyc)">
              <email-getter class="app-list__cell app-list__cell--important"
                           :address="item.accountToUpdateKyc"
                            is-titled/>
              <span class="app-list__cell app-list__cell--right">{{item.requestState}}</span>
              <span class="app-list__cell app-list__cell--right">{{item.accountTypeToSet.string}}</span>
              <span class="app-list__cell app-list__cell--right">{{formatDate(item.updatedAt)}}</span>
            </button>


          </div>

          <div class="app__more-btn-wrp">
            <button class="app__btn-secondary"
                    v-if="!isListEnded && list.data"
                    @click="onMoreClick" >
              More
            </button>
          </div>

        </template>

        <template v-else>
          <div class="app-list__li-like">
            <template v-if="isLoading">
              <p>
                Loading...
              </p>
            </template>

            <template v-else>
              <p>
                Nothing here yet
              </p>
            </template>
          </div>
        </template>

      </div>
    </template>

    <user-view
      v-if="view.mode === VIEW_MODES_VERBOSE.user"
      :id="view.userId"
      @back="toggleViewMode(null)"
    />

  </div>
</template>

<script>
  import { EmailGetter } from '@comcom/getters'
  import { formatDate } from '@/utils/formatters'
  import Vue from 'vue'
  import api from '@/api'
  import UserView from '../Users/Users.Show'

  import SelectField from '@comcom/fields/SelectField'
  import InputField from '@comcom/fields/InputField'

  import {
    REQUEST_STATES,
    KYC_REQUEST_STATES
  } from '@/constants'

  const VIEW_MODES_VERBOSE = Object.freeze({
    index: 'index',
    user: 'user'
  })

  export default {
    components: { UserView, EmailGetter, SelectField, InputField },
    data () {
      return {
        isLoading: false,
        isListEnded: false,
        list: {},
        view: {
          mode: VIEW_MODES_VERBOSE.index,
          userId: null,
          scrollPosition: 0
        },
        filters: {
          state: 'pending',
          email: '',
          address: ''
        },
        VIEW_MODES_VERBOSE,
        REQUEST_STATES,
        KYC_REQUEST_STATES
      }
    },

    created () {
      this.getList()
    },

    methods: {
      async getList () {
        this.isLoading = true
        try {
          let address = ''
          if (this.filters.address) {
            address = this.filters.address
          } else if (this.filters.email) {
            address = await this.getAccountIdByEmail()
          }
          this.list = await api.requests.getKycRequests(
            { state: KYC_REQUEST_STATES[this.filters.state], requestor: address }
          )
          this.isListEnded = !(this.list.data || []).length
        } catch (error) {
          console.error(error)
          error.showMessage('Cannot load request list')
        }
        this.isLoading = false
      },

      async getAccountIdByEmail () {
        let address
        try {
          address = (await api.users.getUserIdByEmail(this.filters.email))
        } catch (e) {
          address = ''
        }
        return address
      },

      async onMoreClick () {
        const oldLength = this.list.data.length
        try {
          this.list = await this.list.concatNext()
          this.isListEnded = oldLength === this.list.data.length
        } catch (error) {
          error.showMessage('Cannot load next page')
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
      formatDate
    },
    watch: {
      'filters.state' () { this.getList() },
      'filters.address': _.throttle(function () { this.getList() }, 1000),
      'filters.email': _.throttle(function () { this.getList() }, 1000)
    }
  }
</script>

<style scoped>
  .request-list__filters-wrp {
    margin-bottom: 4rem;
  }
</style>
