<template>
  <div class="trade-filters">
    <div class="app-list-filters">
      <select-field
        class="app-list-filters__field trade-filters__asset-selector"
        v-model="filters.pair"
      >
        <template v-if="isLoaded && pairs.length">
          <option
            v-for="(pair, index) in pairs"
            :key="index"
            :value="pair">
            {{ pair }}
          </option>
        </template>

        <template v-else-if="isLoaded && !pairs.length">
          <option value="" disabled>
            {{ "trade-filters.no-pairs" | globalize }}
          </option>
        </template>

        <template v-else-if="isFailed">
          <option value="" disabled>
            {{ "trade-filters.error" | globalize }}
          </option>
        </template>

        <template v-else>
          <option value="" disabled>
            {{ "trade-filters.loading" | globalize }}
          </option>
        </template>
      </select-field>
    </div>
  </div>
</template>

<script>
import { SelectField } from '@comcom/fields'
import { AssetPair } from '../models/AssetPair.js'
import { api, loadingDataViaLoop } from '@/api'

export default {
  components: {
    SelectField,
  },

  props: {
    value: { type: Object, required: true },
  },

  data () {
    return {
      filters: {
        pair: '',
      },
      pairs: [],
      isLoaded: false,
      isFailed: false,
    }
  },

  watch: {
    'filters.pair' () { this.updateFilters() },
  },

  created () {
    this.copyFilters()
    this.getPairs()
  },

  methods: {
    copyFilters () {
      this.filters = {
        pair: this.value.pair,
      }
    },

    async getPairs () {
      try {
        let response = await api.getWithSignature('/v3/asset_pairs')
        let assets = await loadingDataViaLoop(response)
        const pairs = assets
          .map(item => new AssetPair(item).toString())

        this.filters.pair = this.filters.pair || pairs[0]
        this.pairs = pairs

        this.isLoaded = true
        throw new Error('')
      } catch (error) {
        this.isFailed = true
      }
    },

    updateFilters () {
      this.$emit('input', this.filters)
    },
  },
}
</script>

<style scoped>
.trade-filters__asset-selector.app-list-filters__field {
  flex: 0.333333;
}
</style>
