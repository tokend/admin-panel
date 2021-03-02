<template>
  <div class="preissuance-requests-index">
    <div class="app__block">
      <h2>{{ "pre-issuance-requests-index.header" | globalize }}</h2>

      <select-field
        class="preissuance-requests-index__asset-select"
        v-model="asset"
        :label="'pre-issuance-requests-index.lbl-asset' | globalize">
        <option
          v-for="a in assets"
          :value="a.id"
          :key="a.id"
        >
          <template v-if="a.id === ALL_ASSETS_ID">
            {{ 'pre-issuance-requests-index.all' | globalize }}
          </template>
          <template v-else>
            {{ a.id }}
          </template>
        </option>
      </select-field>

      <pre-issuance-request-list
        :asset="asset"
        :available-amount="availableAmount"
        @need-to-update="getAssets"
        v-if="assetsLoaded"
      />
    </div>
  </div>
</template>

<script>
import PreIssuanceRequestList from './components/PreIssuanceRequestList.vue'
import SelectField from '@comcom/fields/SelectField'
import { api, loadingDataViaLoop } from '@/api'
import { ALL_ASSETS_ID } from '@/constants'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    PreIssuanceRequestList,
    SelectField,
  },

  data () {
    return {
      ALL_ASSETS_ID,
      asset: [{ id: ALL_ASSETS_ID }],
      assets: undefined,
      assetsLoaded: false,
    }
  },

  computed: {
    assetInfo () {
      const selectedAsset = this.assets
        .filter(asset => asset.id === this.asset)[0]
      return selectedAsset || {}
    },

    availableAmount () {
      if (this.asset === ALL_ASSETS_ID) {
        return 0
      }
      return +this.assetInfo.available_for_issuance
    },
  },

  created () {
    this.getAssets()
  },

  methods: {
    async getAssets () {
      this.$store.commit('OPEN_LOADER')
      try {
        let response = await api.getWithSignature('/v3/assets')
        let assets = await loadingDataViaLoop(response)
        this.assets = [{
          id: ALL_ASSETS_ID,
        }].concat(assets)
        this.asset = this.assets[0].id
        this.assetsLoaded = true

        this.$store.commit('CLOSE_LOADER')
      } catch (err) {
        this.$store.commit('CLOSE_LOADER')
        ErrorHandler.processWithoutFeedback(err)
      }
    },
  },
}
</script>

<style scoped>
.preissuance-requests-index__asset-select {
  max-width: 8rem;
  margin-bottom: 4rem;
}
</style>
