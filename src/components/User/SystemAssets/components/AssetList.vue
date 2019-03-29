<template>
  <div class="asset-list">
    <div class="asset-list__table-header" v-if="parsedAssets">
      <span class="asset-list__li-name secondary">
        Name
      </span>

      <span class="asset-list__li-code secondary">
        Code
      </span>
      <span class="asset-list__li-policy secondary">
        Policy
      </span>
    </div>

    <ul
      class="asset-list__ul"
      v-if="assets && assets.length"
    >
      <li class="asset-list__li" v-for="(asset, i) in parsedAssets" :key="i">
        <router-link class="asset-list__li-a"
          :to="{ name: 'systemAssets.show', params: { asset: asset.id }}">
          <span class="asset-list__li-name" :title="asset.creatorDetails.name">
            {{ asset.creatorDetails.name }}
          </span>

          <span class="asset-list__li-code" :title="asset.id">
            {{ asset.id }}
          </span>

          <span class="asset-list__li-policy" :title="asset.policies.value">
            {{ asset.policies.value }}
          </span>
        </router-link>
      </li>
    </ul>
    <template v-else>
      <div class="app-list__li-like">
        <template v-if="isLoading">
          <p>
            Loading...
          </p>
        </template>

        <template v-else>
          <p>
            Nothing here yet
          </p>
        </template>
      </div>
    </template>
    <div class="app__more-btn-wrp">
      <button
        class="app__btn-secondary"
        v-if="!isListEnded && assets"
        @click="onMoreClick"
      >
        More
      </button>
    </div>
  </div>
</template>

<script>
import config from '@/config'
import { Sdk } from '@/sdk'
import trim from 'lodash/trim'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  data () {
    return {
      assets: [],
      isLoading: false,
      isListEnded: false,
      rawAssetsList: {}
    }
  },

  computed: {
    contentLoaded () {
      return !this.$store.getters.showLoader
    },
    parsedAssets () {
      return this.assets.map(asset => {
        return {
          ...asset,
          policiesStr: convertPolicyToString(asset.policy)
        }
      })
    }
  },

  created () {
    this.getAssets()
  },

  methods: {
    async getAssets () {
      this.assets = []
      this.$store.commit('OPEN_LOADER')
      this.isLoading = true
      try {
        const response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/assets', {
            filter: { owner: config.MASTER_ACCOUNT }
          })
        this.rawAssetsList = response
        console.log(response.data)
        this.assets = this.addСreatorDetailsKeyToObjects(response)
        console.log(this.assets)
        this.$store.commit('CLOSE_LOADER')
      } catch (err) {
        console.error('caught error', err)
        this.$store.commit('CLOSE_LOADER')
        this.$store.dispatch('SET_ERROR', 'Something went wrong. Can\'t to load assets list')
      }
      this.isLoading = false
    },

    async onMoreClick () {
      try {
        const oldLength = this.assets.length
        const chunk = await this.rawAssetsList.fetchNext()
        const mapedChunk = this.addСreatorDetailsKeyToObjects(chunk)
        this.assets = this.assets.concat(mapedChunk)
        this.rawAssetsList.fetchNext = chunk.fetchNext
        this.isListEnded = oldLength === this.assets.length
        console.log(this.assets)
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    addСreatorDetailsKeyToObjects (array) {
      return array.data.map(item => {
        const creatorDetails = item.details || item.creatorDetails
        return Object.assign(item, { creatorDetails })
      })
    }
  }
}

function decamelize (str, prefixForRemove = '') {
  return str.replace(prefixForRemove, '').replace(/([A-Z])/g, ' $1')
}

function convertPolicyToString (policy) {
  const xdrEnumValues = Sdk.xdr.AssetPolicy.values()
  return trim(xdrEnumValues
    .filter(pol => (pol.value & policy) !== 0)
    .map(pol => decamelize(pol.name, 'asset'))
    .join(', '))
}

</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.asset-list__table-header,
.asset-list__ul {
  max-width: 64rem;
}

.asset-list__table-header {
  width: 100%;
  display: flex;
  padding: 0 2.5rem;
  margin-bottom: 0.5rem;
}

.asset-list__li {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);

  & + & {
    margin-top: 2rem;
  }
}

.asset-list__li-a {
  width: 100%;
  display: flex;
  padding: 2rem 2.5rem;
  text-decoration: none;
  color: inherit;
}

%space-right {
  &:not(:last-of-type) {
    margin-right: 3rem;
  }
}

.asset-list__li-name {
  width: 33%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.asset-list__li-code {
  width: 33%;
  text-align: center;
}

.asset-list__li-policy{
  width: 33%;
  text-align: right;
}

.asset-list__li-account-id {
  @extend %space-right;
  width: 20%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-list__li-type,
.asset-list__li-weight,
.asset-list__li-identity {
  @extend %space-right;
  width: 10%;
  text-align: right;
}
</style>
