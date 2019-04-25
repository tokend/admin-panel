<template>
  <div class="request-list">
    <template v-if="view.mode === VIEW_MODES_VERBOSE.index">
      <div class="request-list__filters-wrp">
        <div class="app-list-filters">
          <select-field
            class="issuance-rl__filter app-list-filters__field"
            label="Role to set"
            v-model="filters.roleToSet"
          >
            <option :value="''" />
            <option :value="ACCOUNT_ROLES.general">
              General
            </option>
            <option :value="ACCOUNT_ROLES.corporate">
              Сorporate
            </option>
          </select-field>
          <select-field
            class="app-list-filters__field"
            v-model="filters.state"
            label="State"
          >
            <option
              v-for="(state, s) in Object.keys(KYC_REQUEST_STATES)"
              :key="`kyc-request-${s}`"
              :value="state"
            >
              {{ KYC_REQUEST_STATES[state].label }}
            </option>
          </select-field>

          <input-field
            class="app-list-filters__field"
            v-model.trim="filters.email"
            label="Email"
          />

          <input-field
            class="app-list-filters__field"
            v-model.trim="filters.address"
            label="Account ID"
          />
        </div>
      </div>

      <div class="request-list__list-wrp">
        <template v-if="list && list.length">
          <div class="app-list">
            <div class="app-list__header">
              <span class="app-list__cell">
                Email
              </span>
              <span class="app-list__cell app-list__cell--right">
                State
              </span>
              <span class="app-list__cell app-list__cell--right">
                Last updated
              </span>
              <span class="app-list__cell app-list__cell--right">
                Role to set
              </span>
            </div>
            <button
              class="app-list__li"
              v-for="item in list"
              :key="item.id"
              @click="toggleViewMode(item.requestor.id)"
            >
              <email-getter
                class="app-list__cell app-list__cell--important"
                :account-id="item.requestor.id"
                is-titled
              />
              <span class="app-list__cell app-list__cell--right">
                {{ item.state }}
              </span>
              <span class="app-list__cell app-list__cell--right">
                {{ formatDate(item.updatedAt) }}
              </span>
              <span class="app-list__cell app-list__cell--right">
                {{ item | deriveRoleToSet }}
              </span>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="app-list">
            <template v-if="isLoading">
              <p class="app-list__li">
                <span class="app-list__cell app-list__cell--center">
                  Loading...
                </span>
              </p>
            </template>

            <template v-else>
              <p class="app-list__li">
                <span class="app-list__cell app-list__cell--center">
                  Nothing here yet
                </span>
              </p>
            </template>
          </div>
        </template>

        <div class="app__more-btn-wrp">
          <collection-loader
            :first-page-loader="loadList"
            @first-page-load="setList"
            @next-page-load="extendList"
            ref="collectionLoaderBtn"
          />
        </div>
      </div>
    </template>

    <user-view
      v-if="view.mode === VIEW_MODES_VERBOSE.user"
      :id="view.userId"
      @back="toggleViewMode(null)"
      @reviewed="loadList"
    />
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import { formatDate } from '@/utils/formatters'
import Vue from 'vue'
import UserView from '../Users/Users.Show'

import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { snakeToCamelCase } from '@/utils/un-camel-case'

import { REQUEST_STATES, KYC_REQUEST_STATES } from '@/constants'

import config from '@/config'
import { ApiCallerFactory } from '@/api-caller-factory'
import { clearObject } from '@/utils/clearObject'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'

const VIEW_MODES_VERBOSE = Object.freeze({
  index: 'index',
  user: 'user',
})

export default {
  name: 'kyc-request-list',
  components: { UserView, EmailGetter, SelectField, InputField, CollectionLoader },
  provide () {
    const kycRequestsList = {}
    Object.defineProperty(kycRequestsList, 'updateAsk', {
      enumerable: true,
      get: () => false,
      set: () => this.loadList(),
    })
    return { kycRequestsList }
  },

  filters: {
    deriveRoleToSet (item) {
      return {
        [config.ACCOUNT_ROLES.notVerified]: 'Unverified',
        [config.ACCOUNT_ROLES.general]: 'General',
        [config.ACCOUNT_ROLES.corporate]: 'Corporate',
      }[item.requestDetails.accountRoleToSet]
    },
  },
  data () {
    return {
      isLoading: false,
      list: [],
      view: {
        mode: VIEW_MODES_VERBOSE.index,
        userId: null,
        scrollPosition: 0,
      },
      filters: {
        state: 'pending',
        email: '',
        address: '',
        type: '',
      },
      VIEW_MODES_VERBOSE,
      REQUEST_STATES,
      KYC_REQUEST_STATES,
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
    }
  },

  methods: {
    snakeToCamelCase,
    async loadList () {
      this.isLoading = true
      let response = {}
      try {
        let address = ''
        if (this.filters.address) {
          address = this.filters.address
        } else if (this.filters.email) {
          address = await this.getAccountIdByEmail()
        }
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: clearObject({
              state: KYC_REQUEST_STATES[this.filters.state].state,
              requestor: address,
              'request_details.account_role_to_set': this.filters.roleToSet,
            }),
            include: ['request_details.account'],
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
      return response
    },

    setList (data) {
      this.list = data
    },

    async extendList (data) {
      this.list = this.list.concat(data)
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

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
    formatDate,
  },
  watch: {
    'filters.state' () { this.reloadCollectionLoader() },
    'filters.roleToSet' () { this.reloadCollectionLoader() },
    'filters.address': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },
}
</script>

<style scoped>
.request-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
