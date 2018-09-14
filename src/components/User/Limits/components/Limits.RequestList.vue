<template>
  <div class="request-rl">
    <template v-if="list">
      <ul class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">Date</span>
          <span class="app-list__cell">Account type</span>
          <span class="app-list__cell">Request type</span>
          <span class="app-list__cell">Accound Id</span>
          <span class="app-list__cell">Accound email</span>
        </div>
        <router-link class="app-list__li" v-for="item in list" :key="item.id"
          :to="{ name: 'limits.reviewer', params: { id: item.id}}">
          <span class="app-list__cell" :title="item.updatedAt">
            {{ formatDate(item.updatedAt) }}
          </span>
          <span class="app-list__cell app-list__cell" :title="item.requestor">
            <account-type-getter :accountId="item.requestor"/>
          </span>
          <span class="app-list__cell" :title="item.details.requestType">
            {{LIMITS_REQUEST_STATES[item.details.requestType]}}
          </span>
          <span class="app-list__cell">
            {{ item.requestor }}
          </span>
          <span class="app-list__cell">
            <email-getter :address="item.requestor" is-titled />
          </span>
        </router-link>
      </ul>
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
</template>

<script>
  import { EmailGetter, AccountTypeGetter, LIMITS_REQUEST_STATES_STR } from '@comcom/getters'
  import { formatDate } from '@/utils/formatters'
  import api from '@/api'
  import _get from 'lodash/get'

  import {
    ACCOUNT_TYPES,
    REQUEST_STATES,
    LIMITS_REQUEST_STATES

  } from '@/constants'

  export default {
    props: ['list'],
    components: { EmailGetter, AccountTypeGetter },
    data () {
      return {
        isLoading: false,
        isNoMoreEntries: false,
        REQUEST_STATES,
        ACCOUNT_TYPES,
        LIMITS_REQUEST_STATES,
        LIMITS_REQUEST_STATES_STR,
        formatDate
      }
    },

    computed: {
      requestType () {
        return this.details.map(item => LIMITS_REQUEST_STATES[item.stage])
      }
    },

    methods: {
      async getAccountType (id) {
        const account = await api.accounts.get(id)
        return _get(account, 'data.accountType').replace('AccountType', '')
      }
    }
  }
</script>

<style scoped>
  .request-list__filters-wrp {
    margin-bottom: 4rem;
  }
</style>
