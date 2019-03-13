<template>
  <div class="sale-list">
    <h2>
      Fund list
    </h2>

    <div class="sale-list__filters-wrp">
      <div class="app-list-filters sale-list__filters">
        <input-field
          class="app-list-filters__field sale-list__field"
          label="Token code"
          v-model="filters.baseAsset"
        />
        <input-field
          class="app-list-filters__field sale-list__field"
          label="Name"
          v-model="filters.name"
        />
        <input-field
          class="app-list-filters__field sale-list__field"
          label="Owner"
          placeholder="Address (full match)"
          v-model="owner"
        />
        <input-date-field
          label="Start date"
          class="sale-list__field sale-list__field-margin-top"
          :enableTime="false"
          v-model="filtersDate.startDate"
        />
        <input-date-field
          label="End date"
          class="sale-list__field sale-list__field-margin-left sale-list__field-margin-top"
          :enableTime="false"
          v-model="filtersDate.endDate"
        />
        <tick-field
          class="app-list-filters__field sale-list__field sale-list__field-margin-left sale-list__field-margin-top"
          label="Open only"
          v-model="filters.openOnly"
        />
      </div>
    </div>

    <div class="sale-list__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty -->
            </span>
            <span class="app-list__cell">Name</span>
            <span class="app-list__cell">State</span>
            <span class="app-list__cell">Owner</span>
          </div>

          <router-link
            class="app-list__li"
            v-for="item in list.data"
            :key="item.id"
            :to="{ name: 'sales.show', params: { id: item.id }}"
          >
            <span
              class="app-list__cell app-list__cell--important"
              :title="item.baseAsset"
            >
              {{ item.baseAsset }}
            </span>
            <span
              class="app-list__cell"
              :title="item.name"
            >
              {{ item.details.name }}
            </span>
            <span class="app-list__cell">
              <template v-if="item.state.value === SALE_STATES.open">
                Open
              </template>
              <template v-else-if="item.state.value === SALE_STATES.closed">
                Closed
              </template>
              <template v-else-if="item.state.value === SALE_STATES.cancelled">
                Cancelled
              </template>
            </span>
            <span class="app-list__cell">
              <email-getter
                :account-id="item.ownerId"
                is-titled
              />
            </span>
          </router-link>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">Nothing here yet</template>
            <template v-else>Loading...</template>
          </li>
        </ul>
      </template>
      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="this.getList"
          @first-page-load="this.setList"
          @next-page-load="this.getMoreEntries"
          ref="collectionLoaderBtn"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { AssetAmountFormatter } from '@comcom/formatters'
import { SALE_STATES } from '@/constants'
import { InputField, TickField, InputDateField } from '@comcom/fields'
import { EmailGetter } from '@comcom/getters'
import _ from 'lodash'
import { Sdk } from '@/sdk'
import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'

export default {
  components: {
    AssetAmountFormatter,
    InputField,
    TickField,
    EmailGetter,
    InputDateField,
    CollectionLoader
  },

  data () {
    return {
      SALE_STATES,

      list: {
        data: [],
        rawData: []
      },
      isLoaded: false,
      owner: '',
      filters: {
        baseAsset: '',
        owner: '',
        openOnly: false,
        name: ''
      },
      filtersDate: {
        startDate: '',
        endDate: ''
      },
      isNoMoreEntries: false
    }
  },

  methods: {
    async getOwner () {
      const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (Sdk.base.Keypair.isValidPublicKey(this.owner)) {
        this.filters.owner = this.owner
      } else if (emailRegExp.test(this.owner)) {
        this.filters.owner = await api.users.getAccountIdByEmail(this.owner)
      } else {
        this.filters.owner = this.owner
      }
    },

    async getList () {
      this.isLoaded = false
      let response = {}
      try {
        response = await Sdk.horizon.sales.getPage({
          base_asset: this.filters.baseAsset,
          owner: this.filters.owner,
          open_only: this.filters.openOnly,
          name: this.filters.name,
          order: this.filters.order || 'desc',
          limit: this.filters.limit || config.PAGE_LIMIT
        })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isLoaded = true
      return response
    },

    setList (data) {
      this.list.data = data
      this.list.rawData = data
    },

    filterByDate () {
      let sortedList = this.list.rawData
      if (this.filtersDate.startDate) {
        sortedList = sortedList.filter(sale => +new Date(sale.startTime) >= +new Date(this.filtersDate.startDate))
      }
      if (this.filtersDate.endDate) {
        sortedList = sortedList.filter(sale => +new Date(sale.endTime) <= +new Date(this.filtersDate.endDate))
      }
      this.list.data = sortedList
    },

    async getMoreEntries (data) {
      try {
        this.list.data = this.list.data.concat(data)
        this.list.rowData = this.list.data.concat(data)
      } catch (error) {
        ErrorHandler.process(error)
      }
    }
  },

  watch: {
    'filters.openOnly' () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
    'owner': _.throttle(function () {
      this.getOwner()
      this.$refs.collectionLoaderBtn.loadFirstPage()
    }, 1000),
    'filters.name': _.throttle(function () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    }, 1000),
    'filters.baseAsset': _.throttle(function () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    }, 1000),
    'filtersDate.startDate' () {
      this.filterByDate()
      // hides collection-loader button
      this.$refs.collectionLoaderBtn.isCollectionFetched = true
    },
    'filtersDate.endDate' () {
      this.filterByDate()
      // hides collection-loader button
      this.$refs.collectionLoaderBtn.isCollectionFetched = true
    }
  }
}
</script>

<style scoped lang="scss">
.sale-list__filters-wrp {
  margin-bottom: 4rem;
}

.sale-list__filters {
  flex-wrap: wrap;
}

.sale-list__field {
  min-width: calc(33.333333% - 2rem);
}

.sale-list__field-margin {
  &-left {
    margin-left: 2rem;
  }
  &-top {
    margin-top: 2rem;
  }
}
</style>
