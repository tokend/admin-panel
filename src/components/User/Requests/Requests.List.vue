<template>
    <div class="request-rl">
    <h2>
      Token creation requests list
    </h2>
    
    <div class="request-rl__filters-wrp">
      <div class="app-list-filters">
          <select-field class="app-list-filters__field" v-model="filters.state" label="State">
            <option v-for="state in Object.keys(REQUEST_STATES)" :key="state" :value="state">{{ state }}</option>
          </select-field>

        <input-field class="app-list-filters__field request-rl__requestor-filter"
          label="Asset code"
          placeholder="Asset code (full match)"
          v-model.trim="filters.reference"
        />
      </div>
    </div>

    <div class="request-rl__list-wrp">
      <template v-if="list">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">Token code</span>
            <span class="app-list__cell">Request state</span>
            <span class="app-list__cell">Last updated</span>
            <span class="app-list__cell">Requestor</span>
          </div>

          <router-link class="app-list__li" v-for="item in list.data" :key="item.id"
            :to="{ name: 'user.requests.manager', params: { id: item.id }}">
            <span class="app-list__cell app-list__cell--important" :title="item.code">
              {{item.code}}
            </span>
            <span class="app-list__cell" :title="item.code">
              {{item.requestState}}
            </span>
            <span class="app-list__cell" :title="item.updatedAt">
              {{ formatDate(item.updatedAt) }}
            </span>
            <span class="app-list__cell">
              <email-getter :address="item.requestor" is-titled />
            </span>
          </router-link>
        </ul>

        <div class="app__more-btn-wrp" v-if="!isNoMoreEntries">
          <button class="app__btn-secondary" @click="onMoreClick">
            More
          </button>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoading">Nothing here yet</template>
            <template v-else>Loading...</template>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
  import { EmailGetter } from '@comcom/getters'
  import { formatDate } from '@/utils/formatters'
  import api from '@/api'
  import UserView from '../Users/Users.Show'

  import SelectField from '@comcom/fields/SelectField'
  import InputField from '@comcom/fields/InputField'

  import {
    REQUEST_STATES
  } from '@/constants'

  export default {
    components: { UserView, EmailGetter, SelectField, InputField },
    data () {
      return {
        isLoading: false,
        isNoMoreEntries: false,
        list: {},
        filters: {
          state: 'pending',
          reference: ''
        },
        REQUEST_STATES,
        formatDate
      }
    },

    created () {
      this.getList()
    },

    methods: {
      async getList () {
        this.isLoading = true
        try {
          this.list = await api.requests.getAssetRequests(
            { state: REQUEST_STATES[this.filters.state], code: this.filters.reference }
          )
          this.isNoMoreEntries = !(this.list.data || []).length
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
          this.isNoMoreEntries = oldLength === this.list.data.length
        } catch (error) {
          console.error(error)
          error.showMessage('Cannot load next page')
        }
      }
    },
    watch: {
      'filters.state' () { this.getList() },
      'filters.reference': _.throttle(function () { this.getList() }, 1000)
    }
  }
</script>

<style scoped>
  .request-list__filters-wrp {
    margin-bottom: 4rem;
  }
</style>
