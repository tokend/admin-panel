<template>
  <div class="token-request-list">
    <div class="token-request-list__filters-wrp">
      <select-field
        class="arc-list__filter"
        v-model="filters.state"
        label="State"
      >
        <option
          v-for="stateObj in Object.values(CREATE_TOKEN_REQUEST_STATES)"
          :value="stateObj.codeVerbose"
          :key="stateObj.codeVerbose"
        >
          {{ stateObj.text }}
        </option>
      </select-field>

      <input-field
        class="arc-list__filter"
        v-model="filters.requestor"
        label="Requestor"
      />

      <input-field
        class="arc-list__filter"
        v-model="filters.asset"
        label="Token code"
      />
    </div>

    <div class="token-request-list__table-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty -->
            </span>

            <span class="app-list__cell">
              State
            </span>

            <span class="app-list__cell">
              Requestor
            </span>
          </div>

          <router-link
            class="app-list__li"
            v-for="(asset, i) in list"
            :key="i"
            :to="{ name: 'tokens.requests.show', params: { id: asset.id }}"
          >
            <span
              class="app-list__cell app-list__cell--important"
              :title="asset | deriveCode "
            >
              {{ asset | deriveCode  }}
            </span>

            <span
              class="app-list__cell"
              :title="CREATE_TOKEN_REQUEST_STATES[snakeToCamelCase(asset.requestState)].text"
            >
              {{ CREATE_TOKEN_REQUEST_STATES[snakeToCamelCase(asset.requestState)].text }}
            </span>

            <span class="app-list__cell" :title="asset.requestor">
              {{asset.requestor}}
            </span>
          </router-link>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            {{ isPending ? 'Loading...' : 'Nothing here yet' }}
          </li>
        </ul>
      </template>

      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="getList"
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
import { Sdk } from '@/sdk'
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'
import {
  CREATE_TOKEN_REQUEST_STATES,
  REQUEST_STATES_STR
} from '@/constants'
import _ from 'lodash'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { snakeToCamelCase } from '@/utils/un-camel-case'
import { CollectionLoader } from '@/components/common'

export default {
  components: {
    InputField,
    SelectField,
    CollectionLoader
  },

  data () {
    return {
      list: [],
      isPending: false,
      filters: {
        state: REQUEST_STATES_STR.pending,
        requestor: null,
        asset: null
      },
      CREATE_TOKEN_REQUEST_STATES,
      REQUEST_STATES_STR
    }
  },

  filters: {
    deriveCode (record) {
      const valuableRequestDetailsKey = Object.keys(record.details)
        .find(item => !/request_type|requestType/gi.test(item))
      return (record.details[valuableRequestDetailsKey] || {}).code
    }
  },

  methods: {
    snakeToCamelCase,

    async getList () {
      this.isPending = true
      let response = {}
      try {
        const requestor = await this.getRequestorAccountId(this.filters.requestor)
        response = await api.requests.getAssetRequests({
          state: CREATE_TOKEN_REQUEST_STATES[this.filters.state].code,
          requestor: requestor,
          code: this.filters.asset
        })
        this.isListEnded = !(this.list || []).length
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isPending = false
      return response
    },

    setList (data) {
      this.list = data
    },

    async extendList (data) {
      this.list = this.list.concat(data)
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

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    }
  },
  watch: {
    'filters.state' () { this.reloadCollectionLoader() },
    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
    'filters.asset': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.token-request-list__filters-wrp {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  padding: 2rem 2.5rem 2.5rem;
  margin-bottom: 4rem;
  display: flex;
  justify-content: space-between;
}

.arc-list__filter {
  flex: 1;
  & + & {
    margin-left: 2rem;
  }
}

.token-request-list__name-cell {
  flex: 1.5;
}
</style>
