<template>
  <div class="withdrawal-list">
    <div class="withdrawal-list__filters-wrp">
      <div class="app-list-filters">
        <select-field class="app-list-filters__field" label="State" v-model="filters.state">
          <option :value="REQUEST_STATES.pending">Pending</option>
          <option :value="REQUEST_STATES.approved">Approved</option>
          <option :value="REQUEST_STATES.permanentlyRejected">Permanently rejected</option>
        </select-field>

        <select-field class="app-list-filters__field" label="Asset" v-model="filters.asset">
          <option :value="item.code"
                  v-for="item in assets"
                  :key="item.code"
          >
            {{item.code}}
          </option>
        </select-field>

        <input-field class="app-list-filters__field"
          label="Requestor"
          placeholder="Address (full match)"
          v-model="filters.requestor"
        />
      </div>
    </div>

    <div class="withdrawal-list__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">Source amount</span>
            <span class="app-list__cell">Destination amount</span>
            <span class="app-list__cell">Status</span>
            <span class="app-list__cell">Requestor</span>
          </div>

          <button class="app-list__li" v-for="item in list.data" :key="item.id"
            @click="requestToShow = item">
            <span class="app-list__cell" :title="`${localize(item.amount)} ${item.destAssetCode}`">
              {{localize(item.amount)}}&nbsp;{{ item.destAssetCode }}
            </span>
            <span class="app-list__cell" :title="`${localize(item.destAssetAmount)} ${item.destAssetCode}`">
              {{localize(item.destAssetAmount)}}&nbsp;{{item.destAssetCode}}
            </span>
            <span class="app-list__cell" :title="verbozify(item.requestState)">
              {{verbozify(item.requestState)}}
            </span>
            <span class="app-list__cell" :title="item.requestor">
              {{item.requestor}}
            </span>
          </button>
        </ul>

        <div class="app__more-btn-wrp" v-if="!isNoMoreEntries">
          <button class="app__btn-secondary" @click="getMoreEntries">
            More
          </button>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">Nothing here yet</template>
            <template v-else>Loading...</template>
          </li>
        </ul>
      </template>
    </div>

    <modal v-if="requestToShow && requestToShow.id"
      @close-request="requestToShow = null"
      max-width="60rem">
      <withdrawal-details :request="requestToShow"
            :assets="assets"
            @close-request="refreshList"/>
    </modal>
  </div>
</template>

<script>
import api from '@/api'
import {
  DEFAULT_BASE_ASSET,
  DEFAULT_QUOTE_ASSET,
  REQUEST_STATES,
  ASSET_POLICIES
} from '@/constants'
import { verbozify } from '@/utils/verbozify'
import localize from '@/utils/localize'
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import Modal from '@comcom/modals/Modal'
import WithdrawalDetails from './WithdrawalDetails'
import _ from 'lodash'

export default {
  components: {
    SelectField,
    InputField,
    Modal,
    WithdrawalDetails
  },

  data () {
    return {
      DEFAULT_BASE_ASSET,
      REQUEST_STATES,

      assets: [{ code: DEFAULT_QUOTE_ASSET }],
      list: {},
      requestToShow: {},
      filters: {
        state: REQUEST_STATES.pending,
        asset: DEFAULT_QUOTE_ASSET,
        requestor: ''
      },
      isLoaded: false,
      isNoMoreEntries: false
    }
  },

  created () {
    this.getAssets()
    this.getList()
  },

  methods: {
    verbozify,
    localize,

    async getAssets () {
      try {
        this.assets = (await api.assets.getAssets())
          .filter(item => (item.policy & ASSET_POLICIES.baseAsset))
          .sort((assetA, assetB) => assetA.code > assetB.code ? 1 : -1)
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot get asset list. Please try again later')
      }
    },

    async getList () {
      this.isLoaded = false
      this.isNoMoreEntries = false

      try {
        const filters = { ...this.filters }
        this.list = await api.requests.getWithdrawalRequests(filters)
      } catch (error) {
        error.showMessage('Cannot get withdrawal request list. Please try again later')
      }

      this.isLoaded = true
    },

    async getMoreEntries () {
      const oldLength = (this.list.data || []).length
      this.list = await this.list.concatNext()
      this.isNoMoreEntries = oldLength === this.list.data.length
    },

    refreshList () {
      this.getList()
      this.requestToShow = null
    }
  },

  watch: {
    'filters.state' () { this.getList() },
    'filters.asset' () { this.getList() },
    'filters.requestor': _.throttle(function () { this.getList() }, 1000)
  }
}
</script>

<style scoped>
.withdrawal-list__filters-wrp {
  margin-bottom: 4rem;
}

</style>
