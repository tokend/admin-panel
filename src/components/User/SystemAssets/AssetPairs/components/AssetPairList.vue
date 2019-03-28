<template>
  <div class="asset-pairs">
    <template v-if="isLoaded && list.length">
      <ul class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">
            <!-- empty -->
          </span>

          <span class="app-list__cell app-list__cell--right">
            Price
          </span>

          <span class="app-list__cell app-list__cell--right">
            Policy
          </span>
        </div>

        <router-link class="app-list__li"
          v-for="item in list" :key="`${item.baseAsset.id}/${item.quoteAsset.id}`"
          :to="{ name: 'systemAssets.assetPairs.show', params: { base: item.baseAsset.id, quote: item.quoteAsset.id }}">
          <span class="app-list__cell app-list__cell--important">
            {{`${item.baseAsset.id}/${item.quoteAsset.id}`}}
          </span>

          <span class="app-list__cell app-list__cell--right">
            <asset-amount-formatter :amount="item.price" :asset="item.quoteAsset.id" />
          </span>

          <span class="app-list__cell app-list__cell--policy app-list__cell--right">
            {{ item.policies.value }}
            <span class="asset-pair__policy-tip">
              <mdi-help-circle-icon class="asset-pairs__tip-icon"/>
              <span class="asset-pairs__policies-list">
                <span class="asset-pairs__policies-list-item"
                      v-for="(policy, i) in item.policies.flags" :key="i"
                >
                  {{ ASSET_PAIR_POLICIES_VERBOSE[policy.value] }}
                </span>
                <span class="asset-pairs__policies-list-item" v-if="!item.policies || !item.policies.length">
                  No policies for this pair
                </span>
              </span>
            </span>
          </span>

        </router-link>
      </ul>
      <div class="app__more-btn-wrp">
        <button
          class="app__btn-secondary"
          v-if="!isListEnded && list"
          @click="onMoreClick"
        >
          More
        </button>
      </div>
    </template>

    <template v-else-if="isLoaded && !list.length">
      <div class="app-list">
        <div class="app-list__li-like">
          <p>Nothing here yet</p>
        </div>
      </div>
    </template>

    <template v-else-if="isFailed">
      <div class="app-list">
        <div class="app-list__li-like">
          <p class="danger">An error occurred. Please try again later</p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="app-list">
        <div class="app-list__li-like">
          <p>Loading...</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { AssetAmountFormatter } from '@comcom/formatters'
import { ASSET_PAIR_POLICIES_VERBOSE } from '@/constants'
import 'mdi-vue/HelpCircleIcon'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    AssetAmountFormatter
  },

  data () {
    return {
      list: [],
      rawList: {},
      isLoaded: false,
      isFailed: false,
      isListEnded: false,

      ASSET_PAIR_POLICIES_VERBOSE
    }
  },

  created () {
    this.getPairs()
  },

  methods: {
    async getPairs () {
      this.isLoaded = false
      this.isFailed = false
      try {
        const response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/asset_pairs')
        this.rawList = response
        this.list = response.data
        this.isLoaded = true
      } catch (error) {
        error.showMessage()
        this.isFailed = true
      }
    },

    async onMoreClick () {
      try {
        const oldLength = this.list.length
        const chunk = await this.rawList.fetchNext()
        this.list = this.list.concat(chunk.data)
        this.rawList.fetchNext = chunk.fetchNext
        this.isListEnded = oldLength === this.list.length
      } catch (error) {
        ErrorHandler.process(error)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
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
    padding: .5rem;
    width: 2.6rem;
  }


</style>
