<template>
  <div class="sale-list">
    <h2>
      Fund list
    </h2>

    <div class="sale-list__filters-wrp">
      <div class="app-list-filters">
        <input-field class="app-list-filters__field"
          label="Token code"
          v-model="filters.baseAsset"
        />
        <input-field class="app-list-filters__field"
          label="Name"
          v-model="filters.name"
        />
        <input-field class="app-list-filters__field"
          label="Owner"
          placeholder="Address (full match)"
          v-model="filters.owner"
        />
        <tick-field class="app-list-filters__field"
          label="Open only"
          v-model="filters.openOnly"
        />
      </div>
    </div>

    <div class="sale-list__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell"><!-- empty --></span>
            <span class="app-list__cell">Name</span>
            <span class="app-list__cell">State</span>
            <span class="app-list__cell">Owner</span>
          </div>

          <router-link class="app-list__li" v-for="item in list.data" :key="item.id"
            :to="{ name: 'sales.show', params: { id: item.id }}">
            <span class="app-list__cell app-list__cell--important" :title="item.baseAsset">
              {{item.baseAsset}}
            </span>
            <span class="app-list__cell" :title="item.name">
              {{item.name}}
            </span>
            <span class="app-list__cell">
              <template v-if="item.state.value === SALE_STATES.open">Open</template>
              <template v-else-if="item.state.value === SALE_STATES.closed">Closed</template>
              <template v-else-if="item.state.value === SALE_STATES.cancelled">Cancelled</template>
            </span>
            <span class="app-list__cell">
              <email-getter :address="item.ownerId" is-titled />
            </span>
          </router-link>
        </ul>

        <div class="app__more-btn-wrp" v-if="!isNoMoreEntries">
          <button class="app__btn-secondary" @click="getMoreEntries">
            More
          </button>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">Nothing here yet</template>
            <template v-else>Loading...</template>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { AssetAmountFormatter } from '@comcom/formatters'
import { SALE_STATES } from '@/constants'
import { InputField, TickField } from '@comcom/fields'
import { EmailGetter } from '@comcom/getters'
import _ from 'lodash'

export default {
  components: {
    AssetAmountFormatter,
    InputField,
    TickField,
    EmailGetter
  },

  data () {
    return {
      SALE_STATES,

      list: {},
      isLoaded: false,
      filters: {
        baseAsset: '',
        owner: '',
        openOnly: false,
        name: ''
      },
      isNoMoreEntries: false
    }
  },

  created () {
    this.getList()
  },

  methods: {
    async getList () {
      this.isLoaded = false
      this.isNoMoreEntries = false

      try {
        this.list = await api.sales.getAll(this.filters)
      } catch (error) {
        error.showMessage('Cannot get fund request list. Please try again later')
      }

      this.isLoaded = true
    },

    async getMoreEntries () {
      const oldLength = (this.list.data || []).length
      this.list = await this.list.concatNext()
      this.isNoMoreEntries = oldLength === this.list.data.length
    }
  },

  watch: {
    'filters.openOnly' () { this.getList() },
    'filters.owner': _.throttle(function () { this.getList() }, 1000),
    'filters.name': _.throttle(function () { this.getList() }, 1000),
    'filters.baseAsset': _.throttle(function () { this.getList() }, 1000)
  }
}
</script>

<style scoped>
.sale-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
