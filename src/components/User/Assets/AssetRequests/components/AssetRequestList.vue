<template>
  <div class="asset-request-list">
    <div class="asset-request-list__filters-wrp">
      <select-field
        class="arc-list__filter"
        v-model="filters.requestType"
        :label="'asset-request-list.lbl-request-type' | globalize"
      >
        <option
          v-for="requestType in ASSET_REQUEST_TYPES"
          :value="requestType"
          :key="requestType"
        >
          {{ requestType | assetRequestTypesFilter }}
        </option>
      </select-field>
      <select-field
        class="arc-list__filter"
        v-model="filters.state"
        :label="'asset-request-list.lbl-state' | globalize"
      >
        <option
          v-for="item in REQUEST_STATES"
          :value="item.stateI"
          :key="item.stateI"
        >
          {{ item.stateI | globalizeRequestStateI }}
        </option>
      </select-field>

      <input-field
        class="arc-list__filter"
        v-model="filters.requestor"
        :label="'asset-request-list.lbl-requestor' | globalize"
        autocomplete-type="email"
      />

      <input-field
        class="arc-list__filter"
        v-model="filters.asset"
        :label="'asset-request-list.lbl-asset-code' | globalize"
      />
    </div>

    <div class="asset-request-list__table-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty -->
            </span>

            <span class="app-list__cell">
              {{ "asset-request-list.state" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "asset-request-list.requestor" | globalize }}
            </span>
          </div>

          <router-link
            class="app-list__li"
            v-for="(asset, i) in list"
            :key="i"
            :to="{ name: 'assets.requests.show', params: { id: asset.id } }"
          >
            <span
              class="app-list__cell app-list__cell--important"
              :title="asset.reference"
            >
              {{ asset.reference }}
            </span>

            <!-- eslint-disable max-len -->
            <span
              class="app-list__cell"
              :title="asset.stateI | globalizeRequestStateI"
            >
              {{ asset.stateI | globalizeRequestStateI }}
            </span>
            <!-- eslint-enable max-len -->

            <span class="app-list__cell" :title="asset.requestor.id">
              {{ asset.requestor.id }}
            </span>
          </router-link>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li
            class="app-list__li-like"
            v-if="isPending"
          >
            {{ "asset-request-list.loadind" | globalize }}
          </li>
          <li
            class="app-list__li-like"
            v-else
          >
            {{ "asset-request-list.fail-load" | globalize }}
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
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'

import { CollectionLoader } from '@/components/common'

import { snakeToCamelCase } from '@/utils/un-camel-case'

import { api } from '@/api'
import apiHelper from '@/apiHelper'
import { base } from '@tokend/js-sdk'

import { REQUEST_STATES, ASSET_REQUEST_TYPES } from '@/constants'

import _ from 'lodash'
import { clearObject } from '@/utils/clearObject'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    InputField,
    SelectField,
    CollectionLoader,
  },

  data () {
    return {
      list: [],
      isPending: false,
      filters: {
        requestType: ASSET_REQUEST_TYPES.createAsset,
        state: REQUEST_STATES.pending.stateI,
        requestor: null,
        asset: null,
      },
      REQUEST_STATES,
      ASSET_REQUEST_TYPES,
    }
  },

  watch: {
    'filters.requestType' () { this.reloadCollectionLoader() },

    'filters.state' () { this.reloadCollectionLoader() },

    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),

    'filters.asset': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },

  methods: {
    snakeToCamelCase,

    async getList () {
      this.isPending = true
      let response = {}
      try {
        const requestor = await this.getRequestorAccountId(
          this.filters.requestor
        )
        const endpoint = `/v3/${this.filters.requestType}_requests`
        response = await api.getWithSignature(endpoint, {
          page: { order: 'desc' },
          filter: clearObject({
            state: this.filters.state,
            requestor: requestor,
            'request_details.asset': this.filters.asset,
          }),
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
      if (base.Keypair.isValidPublicKey(requestor)) {
        return requestor
      } else {
        try {
          const address = await apiHelper.users.getAccountIdByEmail(requestor)
          return address || requestor
        } catch (error) {
          return requestor
        }
      }
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.asset-request-list__filters-wrp {
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

.asset-request-list__name-cell {
  flex: 1.5;
}
</style>
