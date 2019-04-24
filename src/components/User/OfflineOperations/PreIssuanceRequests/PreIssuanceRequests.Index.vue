<template>
  <div class="preissuance-requests-index">
    <div class="app__block">
      <h2>Preissuance Requests</h2>

      <select-field class="preissuance-requests-index__asset-select"
        v-model="asset"
        label="Asset">
        <option v-for="a in assets" :value="a.code" :key="a.code">
          {{a.code}}
        </option>
      </select-field>

      <pre-issuance-request-list :asset="asset"
        :availableAmount="availableAmount"
        @need-to-update="getAssets"
        v-if="assetsLoaded"
      />
    </div>
  </div>
</template>

<script>
import PreIssuanceRequestList from './components/PreIssuanceRequestList.vue'
import SelectField from '@comcom/fields/SelectField'
import { Sdk } from '@/sdk'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    PreIssuanceRequestList,
    SelectField
  },

  data () {
    return {
      asset: [{ code: 'All' }],
      assets: undefined,
      assetsLoaded: false
    }
  },

  computed: {
    assetInfo () {
      const selectedAsset = this.assets.filter(asset => asset.code === this.asset)[0]
      return selectedAsset || {}
    },

    availableAmount () {
      if (this.asset === 'All') {
        return 0
      }
      return +this.assetInfo.available_for_issuance
    }
  },

  created () {
    this.getAssets()
  },

  methods: {
    async getAssets () {
      this.$store.commit('OPEN_LOADER')
      try {
        const response = await Sdk.horizon.assets.getAll()
        this.assets = [{
          code: 'All'
        }].concat(response.data)
        this.asset = this.assets[0].code
        this.assetsLoaded = true

        this.$store.commit('CLOSE_LOADER')
      } catch (err) {
        this.$store.commit('CLOSE_LOADER')
        ErrorHandler.processWithoutFeedback(err)
      }
    }
  }
}
</script>

<style scoped>
.preissuance-requests-index__asset-select {
  max-width: 8rem;
  margin-bottom: 4rem;
}
</style>
