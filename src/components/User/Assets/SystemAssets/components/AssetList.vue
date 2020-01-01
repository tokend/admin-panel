<template>
  <div class="asset-list">
    <div class="asset-list__table-header" v-if="parsedAssets">
      <span class="asset-list__li-name secondary">
        {{ "asset-list.name" | globalize }}
      </span>

      <span class="asset-list__li-code secondary">
        {{ "asset-list.code" | globalize }}
      </span>
      <span class="asset-list__li-policy secondary">
        {{ "asset-list.policy" | globalize }}
      </span>
    </div>

    <ul class="asset-list__ul" v-if="assets && assets.length">
      <li
        class="asset-list__li"
        v-for="(asset, i) in parsedAssets"
        :key="i">
        <router-link
          class="asset-list__li-a"
          :to="{
            name: 'assets.systemAssets.show',
            params: { asset: asset.id }
          }"
        >
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
            {{ "asset-list.loading" | globalize }}
          </p>
        </template>

        <template v-else>
          <p>
            {{ "asset-list.fail-load" | globalize }}
          </p>
        </template>
      </div>
    </template>
    <div class="app__more-btn-wrp app__more-btn-wrp--left">
      <collection-loader
        :first-page-loader="getAssets"
        @first-page-load="setAssets"
        @next-page-load="extendAssets"
      />
    </div>
  </div>
</template>

<script>
import { CollectionLoader } from '@/components/common'

import { base } from '@tokend/js-sdk'
import { api } from '@/api'

import trim from 'lodash/trim'

import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    CollectionLoader,
  },

  data () {
    return {
      assets: [],
      isLoading: false,
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
          policiesStr: convertPolicyToString(asset.policy),
        }
      })
    },
  },

  methods: {
    async getAssets () {
      this.assets = []
      this.$store.commit('OPEN_LOADER')
      this.isLoading = true

      let response = {}
      try {
        response = await api.getWithSignature('/v3/assets', {
          filter: { owner: config.MASTER_ACCOUNT },
        })
        this.$store.commit('CLOSE_LOADER')
      } catch (err) {
        this.$store.commit('CLOSE_LOADER')
        ErrorHandler.process("Something went wrong. Can't to load assets list")
      }

      this.isLoading = false
      return response
    },

    setAssets (data) {
      this.assets = this.addСreatorDetailsKeyToObjects(data)
    },

    async extendAssets (data) {
      try {
        const mapedData = this.addСreatorDetailsKeyToObjects(data)
        this.assets = this.assets.concat(mapedData)
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    addСreatorDetailsKeyToObjects (array) {
      return array.map(item => {
        const creatorDetails = item.details || item.creatorDetails
        return Object.assign(item, { creatorDetails })
      })
    },
  },
}

function decamelize (str, prefixForRemove = '') {
  return str.replace(prefixForRemove, '').replace(/([A-Z])/g, ' $1')
}

function convertPolicyToString (policy) {
  const xdrEnumValues = base.xdr.AssetPolicy.values()
  return trim(
    xdrEnumValues
      .filter(pol => (pol.value & policy) !== 0)
      .map(pol => decamelize(pol.name, 'asset'))
      .join(', ')
  )
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

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

.asset-list__li-policy {
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

.app__more-btn-wrp--left {
  margin-right: auto;
  margin-left: 0;
  max-width: 64rem;
}
</style>
