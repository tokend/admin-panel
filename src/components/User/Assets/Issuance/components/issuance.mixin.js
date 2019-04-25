import { Sdk } from '@/sdk'
import localize from '@/utils/localize'
import SelectField from '@comcom/fields/SelectField'

import { REQUEST_STATES, ASSET_POLICIES } from '@/constants'
import { CollectionLoader } from '@/components/common'
import { ErrorHandler } from '@/utils/ErrorHandler'
import config from '@/config'

export default {
  components: {
    SelectField,
    CollectionLoader,
  },
  data () {
    return {
      REQUEST_STATES,
      list: [],
      listCounter: {
        pending: null,
        approved: null,
      },
      assets: [''],
      isNoMoreEntries: false,
      isLoaded: false,
      isRejectionModalShown: false,
      itemToReject: null,
      rejectForm: {
        reason: '',
      },
      filters: {
        state: REQUEST_STATES.approved,
        asset: '',
      },
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
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getList () {
      this.isLoaded = false
      let response = {}
      try {
        response = await Sdk.horizon.request.getAllForIssuances({
          order: 'asc',
          reviewer: config.MASTER_ACCOUNT,
          limit: 1000,
          ...this.filters,
        })
        this.getListCounter(response)
        this.isNoMoreEntries = false
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoaded = true
      return response
    },

    getListCounter (response) {
      if (response) {
        this.listCounter.pending = response._rawResponse.data._embedded.meta.count.pending
        this.listCounter.approved = response._rawResponse.data._embedded.meta.count.approved
      }
    },

    setList (data) {
      this.list = data
    },

    async extendList (data) {
      this.list = this.list.concat(data)
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
  },

  watch: {
    'filters.state' () { this.reloadCollectionLoader() },
    'filters.asset' () { this.reloadCollectionLoader() },
  },
}
