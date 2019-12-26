<template>
  <div class="asset-pairs">
    <template v-if="isLoaded && list.length">
      <ul class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">
            <!-- empty -->
          </span>

          <span class="app-list__cell app-list__cell--right">
            {{ "asset-pair-list.app-list-prise" | globalize }}
          </span>

          <span class="app-list__cell app-list__cell--right">
            {{ "asset-pair-list.app-list-policy" | globalize }}
          </span>
        </div>

        <router-link
          class="app-list__li"
          v-for="item in list"
          :key="`${item.baseAsset.id}/${item.quoteAsset.id}`"
          :to="{
            name: 'assets.assetPairs.show',
            params: { base: item.baseAsset.id, quote: item.quoteAsset.id }
          }"
        >
          <span class="app-list__cell app-list__cell--important">
            {{ `${item.baseAsset.id}/${item.quoteAsset.id}` }}
          </span>

          <span class="app-list__cell app-list__cell--right">
            <asset-amount-formatter
              :amount="item.price"
              :asset="item.quoteAsset.id"
            />
          </span>

          <!-- eslint-disable-next-line max-len -->
          <span
            class="app-list__cell app-list__cell--policy app-list__cell--right"
          >
            {{ item.policies.value }}
            <span class="asset-pair__policy-tip">
              <i class="mdi mdi-help-circle asset-pairs__tip-icon" />
              <span class="asset-pairs__policies-list">
                <span
                  class="asset-pairs__policies-list-item"
                  v-for="(policy, i) in item.policies.flags"
                  :key="i"
                >
                  {{ ASSET_PAIR_POLICIES_VERBOSE[policy.value] }}
                </span>
                <span
                  v-if="!item.policies || !item.policies.length"
                  class="asset-pairs__policies-list-item"
                >
                  {{ "asset-pair-list.app-list-no-policy" | globalize }}
                </span>
              </span>
            </span>
          </span>
        </router-link>
      </ul>
    </template>

    <template v-else-if="isLoaded && !list.length">
      <div class="app-list">
        <div class="app-list__li-like">
          <p>{{ "asset-pair-list.app-list-like" | globalize }}</p>
        </div>
      </div>
    </template>

    <template v-else-if="isFailed">
      <div class="app-list">
        <div class="app-list__li-like">
          <p class="danger">
            {{ "asset-pair-list.app-list-error" | globalize }}
          </p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="app-list">
        <div class="app-list__li-like">
          <p>{{ "asset-pair-list.app-list-load" | globalize }}</p>
        </div>
      </div>
    </template>

    <div class="app__more-btn-wrp">
      <collection-loader
        :first-page-loader="getList"
        @first-page-load="setList"
        @next-page-load="extendList"
      />
    </div>
  </div>
</template>

<script>
import { CollectionLoader } from '@/components/common'
import { AssetAmountFormatter } from '@comcom/formatters'

import { api } from '@/api'
import { ASSET_PAIR_POLICIES_VERBOSE } from '@/constants'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    AssetAmountFormatter,
    CollectionLoader,
  },

  data () {
    return {
      list: [],
      isLoaded: false,
      isFailed: false,

      ASSET_PAIR_POLICIES_VERBOSE,
    }
  },

  methods: {
    async getList () {
      this.isLoaded = false
      this.isFailed = false
      let response = {}
      try {
        response = await api.getWithSignature('/v3/asset_pairs')
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isFailed = true
      }
      this.isLoaded = true
      return response
    },

    setList (data) {
      this.list = data
    },

    extendList (data) {
      this.list = this.list.concat(data)
    },
  },
}
</script>

<style lang="scss" scoped>
.asset-pairs {
  max-width: 72rem;
}

.asset-pair__policy-tip {
  position: relative;

  &:hover {
    .asset-pairs__policies-list {
      display: block;
    }
  }
}

.app-list__cell--policy {
  align-items: center;
  display: flex;
  overflow: visible;
}

.asset-pairs__policies-list {
  background: rgba(10, 6, 9, 0.75);
  border-radius: 3px;
  bottom: -15px;
  color: #fff;
  display: none;
  right: 0;
  position: absolute;
}

.asset-pairs__policies-list-item {
  display: inline-block;
  padding: 5px 25px;
}

.asset-pairs__tip-icon {
  cursor: help;
  padding: 0.5rem;
  width: 2.6rem;
}
</style>
