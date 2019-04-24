<template>
  <div class="price-chart-fetcher">
    <template v-if="priceHistory && Object.keys(priceHistory).length">
      <div class="app__block">
        <div class="price-chart-fetcher__filters-wrp">
          <scale-picker v-model="scale" />
        </div>

        <price-chart :price-history="priceHistory" :scale="scale" :asset-pair="filters.pair" />
      </div>
    </template>

    <template v-else-if="isLoaded">
      <div class="app__block price-chart__empty">
        <p>No chart data yet</p>
      </div>
    </template>

    <template v-else-if="isFailed">
      <div class="app__block price-chart__empty">
        <p>An error occurred while fetching chart data. Please try again later</p>
      </div>
    </template>

    <template v-else>
      <div class="app__block price-chart__empty">
        <p>Fetching chart data...</p>
      </div>
    </template>
  </div>
</template>

<script>
import { Sdk } from '@/sdk'
import { AssetPair } from '../../models/AssetPair'
import PriceChart from './PriceChart.Renderer'
import ScalePicker from './PriceChart.ScalePicker'
export default {
  props: ['filters'],

  components: {
    PriceChart,
    ScalePicker
  },

  data () {
    return {
      priceHistory: {},
      scale: 'day',
      isLoaded: [],
      isFailed: []
    }
  },

  created () {
    this.getPriceHistory()
  },

  methods: {
    async getPriceHistory () {
      try {
        this.isLoaded = false
        this.isFailed = false
        this.priceHistory = {}
        const pair = new AssetPair(this.filters.pair)
        Sdk.horizon.charts.get(`${pair.base}-${pair.quote}`)
        const response = await Sdk.horizon.charts.get(`${pair.base}-${pair.quote}`)

        this.priceHistory = response.data
        let val1 = 1
        let ddd1 = 0.05
        this.priceHistory.hour.forEach(element => {
          val1 += ddd1
          if (val1 >= 2) {
            ddd1 = -0.1
          }
          if (val1 <= 0) {
            ddd1 = 0.06
          }

          element.value = val1
        })
        let val = 1
        let ddd = 0.05
        this.priceHistory.day.forEach(element => {
          val += ddd
          if (val >= 2) {
            if (Math.random() * 1 > 0.5) {
              ddd = Math.random() * -0.5
            } else {
              ddd = Math.random() * 0.1
            }
          }
          if (val <= 0) {
            ddd = Math.random() * 1
          }

          element.value = val
        })
        console.log(this.priceHistory)
        this.isLoaded = true
      } catch (error) {
        console.error(error)
        if (error.status === 404) {
          this.isLoaded = true
        } else {
          this.isFailed = true
        }
      }
    }
  },

  watch: {
    'filters.pair' () { this.getPriceHistory() }
  }
}
</script>

<style scoped>
.price-chart-fetcher__filters-wrp {
  margin-bottom: 2rem;
}

.price-chart__empty.price-chart__empty {
  height: 30rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
