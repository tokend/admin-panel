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

    <ul class="asset-list__ul">
      <li class="asset-list__li" v-for="(asset, i) in parsedAssets" :key="i">
        <router-link class="asset-list__li-a"
          :to="{ name: 'systemAssets.show', params: { asset: asset.code }}">
          <span class="asset-list__li-name" :title="asset.details.name">
            {{ asset.details.name }}
          </span>

          <span class="asset-list__li-code" :title="asset.code">
            {{ asset.code }}
          </span>

          <span class="asset-list__li-policy" :title="asset.policy">
            {{ asset.policy }}
          </span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import { xdr } from 'tokend-js-sdk'
import trim from 'lodash/trim'

export default {
  data () {
    return {
      assets: []
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
    getAssets () {
      this.assets = []
      this.$store.commit('OPEN_LOADER')

      return Vue.api.assets.getSystemAssets().then(response => {
        this.assets = response
        this.$store.commit('CLOSE_LOADER')
      }).catch(err => {
        console.error('caught error', err)

        this.$store.commit('CLOSE_LOADER')
        this.$store.dispatch('SET_ERROR', 'Something went wrong. Can\'t to load assets list')
      })
    }
  }
}

function decamelize (str, prefixForRemove = '') {
  return str.replace(prefixForRemove, '').replace(/([A-Z])/g, ' $1')
}

function convertPolicyToString (policy) {
  const xdrEnumValues = xdr.AssetPolicy.values()
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
