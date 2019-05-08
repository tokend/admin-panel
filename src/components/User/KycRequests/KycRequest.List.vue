<template>
  <div class="request-list">
    <div class="request-list__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
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

        <select-field
          class="app-list-filters__field"
          v-model="filters.pendingTasks"
          label="Pending tasks"
        >
          <option :value="CHANGE_ROLE_TASKS.submitAutoVerification">
            Submit auto verification
          </option>
          <option :value="CHANGE_ROLE_TASKS.completeAutoVerification">
            Complete auto verification
          </option>
          <option :value="CHANGE_ROLE_TASKS.manualReviewRequired">
            Manual review requried
          </option>
          <option value="">
            Any
          </option>
        </select-field>

        <input-field
          class="app-list-filters__field"
          v-model.trim="filters.requestor"
          label="Requestor"
          autocomplete-type="email"
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
            @click="showUserDetails(item.requestor.id)"
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
  </div>
</template>

<script>
import api from '@/api'
import _ from 'lodash'

import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'

import { EmailGetter } from '@comcom/getters'

import { formatDate } from '@/utils/formatters'
import { snakeToCamelCase } from '@/utils/un-camel-case'
import { clearObject } from '@/utils/clearObject'

import { KYC_REQUEST_STATES } from '@/constants'

import config from '@/config'
import { ApiCallerFactory } from '@/api-caller-factory'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'
import { Sdk } from '@/sdk'

export default {
  name: 'kyc-request-list',
  components: {
    EmailGetter,
    SelectField,
    InputField,
    CollectionLoader,
  },

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
      filters: {
        state: 'pending',
        requestor: '',
        type: '',
        pendingTasks: '',
      },
      KYC_REQUEST_STATES,
      CHANGE_ROLE_TASKS: config.CHANGE_ROLE_TASKS,
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
    }
  },

  watch: {
    'filters.state' () { this.reloadCollectionLoader() },
    'filters.roleToSet' () { this.reloadCollectionLoader() },
    'filters.pendingTasks' () { this.reloadCollectionLoader() },
    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },

  methods: {
    snakeToCamelCase,
    async loadList () {
      this.isLoading = true
      let response = {}
      try {
        const requestor =
          await this.getRequestorAccountId(this.filters.requestor)
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: clearObject({
              pending_tasks: this.filters.pendingTasks,
              state: KYC_REQUEST_STATES[this.filters.state].state,
              requestor: requestor,
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

    async getRequestorAccountId (requestor) {
      if (Sdk.base.Keypair.isValidPublicKey(requestor)) {
        return requestor
      } else {
        try {
          const address = await api.users.getAccountIdByEmail(requestor)
          return address || requestor
        } catch (error) {
          return requestor
        }
      }
    },

    setList (data) {
      this.list = data
    },
    async extendList (data) {
      this.list = this.list.concat(data)
    },

    showUserDetails (id) {
      if (id) {
        this.$router.push({
          name: 'users.show',
          params: {
            id: id,
          },
        })
      }
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
    formatDate,
  },
}
</script>

<style scoped>
.request-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
