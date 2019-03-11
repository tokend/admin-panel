import api from '@/api'
import { Sdk } from '@/sdk'
import localize from '@/utils/localize'
import SelectField from '@comcom/fields/SelectField'

import { REQUEST_STATES, ASSET_POLICIES } from '@/constants'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'

export default {
  components: {
    SelectField,
    CollectionLoader
  },
  data () {
    return {
      REQUEST_STATES,
      list: {
        data: []
      },
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
  },

  methods: {
    localize,
    async getAssets () {
      try {
        const response = await Sdk.horizon.assets.getAll()
        this.assets = this.assets.concat(
          response.data
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
      let response = {}
      try {
        const filters = { ...this.filters }
        response = await api.requests.getIssuanceRequests(filters)
        this.listCounter.pending = response._rawResponse.data._embedded.meta.count.pending
        this.listCounter.approved = response._rawResponse.data._embedded.meta.count.approved
        this.isNoMoreEntries = false
      } catch (error) {
        console.error(error)
        this.$store.dispatch('SET_ERROR', 'Cannot load issuance request list.')
      }
      this.isLoaded = true
      return response
    },

    setList (data) {
      this.list.data = data
    },

    async onMoreButtonClick (data) {
      try {
        this.list.data = this.list.data.concat(data)
      } catch (error) {
        ErrorHandler.process(error)
      }
    }
  },

  watch: {
    'filters.state' () { this.$refs.collectionLoaderBtn.loadFirstPage() },
    'filters.asset' () { this.$refs.collectionLoaderBtn.loadFirstPage() }
  }
}
