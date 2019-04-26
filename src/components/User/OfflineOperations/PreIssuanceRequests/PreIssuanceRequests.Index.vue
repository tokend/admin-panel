<template>
  <div class="preissuance-requests-index">
    <div class="app__block">
      <h2>Preissuance Requests</h2>

      <select-field class="preissuance-requests-index__asset-select"
        v-model="asset"
        label="Asset">
        <option v-for="a in assets" :value="a.id" :key="a.id">
          {{a.id}}
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
import { ApiCallerFactory } from '@/api-caller-factory'

export default {
  components: {
    PreIssuanceRequestList,
    SelectField
  },

  data () {
    return {
      asset: [{ id: 'All' }],
      assets: undefined,
      assetsLoaded: false
    }
  },

  computed: {
    assetInfo () {
      const selectedAsset = this.assets.filter(asset => asset.id === this.asset)[0]
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
        const { data } = await ApiCallerFactory
          .createStubbornCallerInstance()
          .stubbornGet('/v3/assets')
        this.assets = [{
          id: 'All'
        }].concat(data)
        this.asset = this.assets[0].id
        this.assetsLoaded = true

        this.$store.commit('CLOSE_LOADER')
      } catch (err) {
        console.error('caught error', err)
        this.$store.commit('CLOSE_LOADER')
        this.$store.dispatch('SET_ERROR', 'Can not to load assets list')
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
