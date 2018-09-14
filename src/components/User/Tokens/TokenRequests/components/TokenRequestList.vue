<template>
  <div class="token-request-list">
    <div class="token-request-list__filters-wrp">
      <select-field class="arc-list__filter" v-model="filters.state" label="State">
        <option v-for="state in Object.keys(REQUEST_STATES)" :value="state" :key="state">
          {{ state }}
        </option>
      </select-field>

      <input-field class="arc-list__filter" v-model="filters.requestor" label="Requestor"/>

      <input-field class="arc-list__filter" v-model="filters.asset" label="Token code"/>
    </div>

    <div class="token-request-list__table-wrp">
      <template v-if="records && records.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty -->
            </span>

            <span class="app-list__cell">
              Type
            </span>

            <span class="app-list__cell">
              Requestor
            </span>
          </div>

          <router-link class="app-list__li" v-for="(asset, i) in records" :key="i"
            :to="{ name: 'tokens.requests.show', params: { id: asset.id }}">
            <span class="app-list__cell app-list__cell--important" :title="asset.code">
              {{asset.code}}
            </span>

            <span class="app-list__cell" :title="normalizeType(asset)">
              {{normalizeType(asset)}}
            </span>

            <span class="app-list__cell" :title="asset.requestor">
              {{asset.requestor}}
            </span>
          </router-link>
        </ul>

        <div class="app__more-btn-wrp">
          <button class="app__btn-secondary"
            v-if="!isListEnded"
            @click="nextPage" >
            More
          </button>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            {{ isPending ? 'Loading...' : 'Nothing here yet' }}
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'
import { CREATE_TOKEN_REQUEST_STATES, REQUEST_STATES_STR, REQUEST_STATES } from '@/constants'
import _ from 'lodash'

export default {
  components: {
    InputField,
    SelectField
  },

  props: [/* ... */],

  data () {
    return {
      list: null,
      isListEnded: false,
      isPending: false,
      filters: {
        state: REQUEST_STATES_STR.pending,
        requestor: null,
        asset: null
      },
      REQUEST_STATES: CREATE_TOKEN_REQUEST_STATES
    }
  },

  created () {
    this.getList()
  },

  computed: {
    records () {
      return (this.list || {}).data
    }
  },

  methods: {
    async getList () {
      this.isPending = true
      try {
        this.list = await api.requests.getAssetRequests({
          state: REQUEST_STATES[this.filters.state], code: this.filters.asset
        })
        this.isListEnded = !(this.list.data || []).length
      } catch (error) {
        console.error(error)
        error.showMessage('Cannot load request list')
      }
      this.isPending = false
    },

    normalizeType (obj) {
      return obj.type === 'asset_create' ? 'Create' : 'Update'
    },

    async nextPage () {
      const oldLength = this.list.data.length
      try {
        this.list = await this.list.concatNext()
        this.isListEnded = oldLength === this.list.data.length
      } catch (error) {
        console.error(error)
        error.showMessage('Cannot load next page')
      }
    }
  },
  watch: {
    'filters.state' () { this.getList() },
    'filters.requestor': _.throttle(function () { this.getList() }, 1000),
    'filters.asset': _.throttle(function () { this.getList() }, 1000)
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
