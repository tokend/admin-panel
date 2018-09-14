import api from '@/api'
import localize from '@/utils/localize'
import SelectField from '@comcom/fields/SelectField'
import Bus from '@/utils/EventBus'

import { REQUEST_STATES, ASSET_POLICIES } from '@/constants'

export default {
  components: {
    SelectField
  },
  data () {
    return {
      REQUEST_STATES,
      list: {},
      listCounter: {
        pending: null,
        approved: null
      },
      assets: [''],
      isNoMoreEntries: false,
      isLoaded: false,
      isRejectionModalShown: false,
      itemToReject: null,
      rejectForm: {
        reason: ''
      },
      filters: {
        state: REQUEST_STATES.approved,
        asset: ''
      }
    }
  },

  async created () {
    await this.getAssets()
    Bus.$on('issuance:updateRequestList', _ => this.getList())
    this.getList()
  },

  methods: {
    localize,
    async getAssets () {
      try {
        this.assets = this.assets.concat(
          (await api.assets.getAssets())
            .filter(item => (item.policy & ASSET_POLICIES.baseAsset))
            .sort((assetA, assetB) => assetA.code > assetB.code ? 1 : -1)
            .map(asset => asset.code)
        )
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot get asset list. Please try again later')
      }
    },

    async getList () {
      this.isLoaded = false
      try {
        const filters = { ...this.filters }
        this.list = await api.requests.getIssuanceRequests(filters)
        this.getListCounter()
        this.isNoMoreEntries = false
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot load issuance request list.')
      }
      this.isLoaded = true
    },

    getListCounter () {
      if (this.list) {
        this.listCounter.pending = this.list.body._embedded.meta.count.pending
        this.listCounter.approved = this.list.body._embedded.meta.count.approved
      }
    },
    async onMoreButtonClick () {
      try {
        const oldLength = this.list.data.length
        this.list = await this.list.concatNext()
        this.isNoMoreEntries = oldLength === this.list.data.length
      } catch (error) {
        error.showMessage('Cannot fetch new entries. Please try again later')
      }
    }
  },

  watch: {
    'filters.state' () { this.getList() },
    'filters.asset' () { this.getList() }
  }
}
