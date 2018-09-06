<template>
  <div class="trade-filters">
    <div class="app-list-filters">
      <select-field class="app-list-filters__field trade-filters__asset-selector" v-model="filters.pair">
        <template v-if="isLoaded && pairs.length">
          <option v-for="(pair, index) in pairs" :key="index" :value="pair">{{pair}}</option>
        </template>

        <template v-else-if="isLoaded && !pairs.length">
          <option value="" disabled>No pairs yet</option>
        </template>

        <template v-else-if="isFailed">
          <option value="" disabled>An error occurred</option>
        </template>

        <template v-else>
          <option value="" disabled>Loading...</option>
        </template>
      </select-field>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { SelectField } from '@comcom/fields'
import { AssetPair } from '../models/AssetPair.js'
export default {
  components: {
    SelectField
  },

  data () {
    return {
      filters: {
        pair: ''
      },
      pairs: [],
      isLoaded: false,
      isFailed: false
    }
  },

  props: ['value'],

  created () {
    this.copyFilters()
    this.getPairs()
  },

  methods: {
    copyFilters () {
      this.filters = {
        pair: this.value.pair
      }
    },

    async getPairs () {
      try {
        const pairs = (await api.assets.getAssetPairs())
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
    }
  },

  watch: {
    'filters.pair' () { this.updateFilters() }
  }
}
</script>

<style scoped>
.trade-filters__asset-selector.app-list-filters__field {
  flex: 0.333333;
}
</style>
