import SelectField from '@comcom/fields/SelectField'
import { CollectionLoader } from '@/components/common'

import { REQUEST_STATES, ASSET_POLICIES } from '@/constants'

import localize from '@/utils/localize'
import { globalize } from '@/components/App/filters/filters'
import config from '@/config'
import { api, loadingDataViaLoop } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    SelectField,
    CollectionLoader,
  },

  data () {
    return {
      REQUEST_STATES,
      list: [],
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

  watch: {
    'filters.state' () { this.reloadCollectionLoader() },

    'filters.asset' () { this.reloadCollectionLoader() },
  },

  async created () {
    await this.getAssets()
  },

  methods: {
    localize,

    async getAssets () {
      try {
        let response = await api.getWithSignature('/v3/assets')
        let data = await loadingDataViaLoop(response)
        this.assets = this.assets.concat(
          data
            .filter(item => (item.policies.value & ASSET_POLICIES.baseAsset))
            .sort((assetA, assetB) => assetA.id > assetB.id ? 1 : -1)
            .map(asset => asset.id)
        )
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getList () {
      this.isLoaded = false
      let response = {}
      try {
        response = await api.getWithSignature('/v3/create_issuance_requests', {
          filter: {
            reviewer: config.MASTER_ACCOUNT,
            state: this.filters.state,
            'request_details.asset': this.filters.asset,
          },
          page: {
            order: globalize('issuance-mixin.asc'),
          },
          include: ['request_details'],
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoaded = true
      return response
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
}
