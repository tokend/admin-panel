<template>
  <div class="config-checker">
    <button
      class="config-checker__icon"
      v-if="foundIssues.length"
      @click="togglePane"
    >
      <mdi-alert-outline-icon />
    </button>
    <div
      class="config-checker__pane"
      v-if="isPaneActive"
    >
      <ul>
        <li
          v-for="(item, i) in foundIssues"
          :key="i"
        >
          {{ item.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Bus from '@/utils/EventBus'

import { ASSET_POLICIES } from '@/constants'
import config from '@/config'

import api from '@/api'
import { Sdk } from '@/sdk'

import store from '@/store'

import 'mdi-vue/AlertOutlineIcon'

const CHECK_LIST = [
  {
    message: 'Please set exactly 1 quote asset',
    async check ({ store, api }) {
      const response = (await Sdk.horizon.assets
        .getAll({ owner: config.MASTER_ACCOUNT }))
      return (response.data || [])
        .filter(item => item && item.policy & ASSET_POLICIES.statsQuoteAsset)
        .length !== 1
    },
  },
]

export default {
  data () {
    return {
      isPaneActive: false,
      foundIssues: [],
    }
  },

  async created () {
    this.checkConfig()
    Bus.$on('recheckConfig', () => this.checkConfig())
  },

  methods: {
    togglePane () {
      this.isPaneActive = !this.isPaneActive
      this.closeOnOutsideClick()
    },

    async checkConfig () {
      for (const item of CHECK_LIST) {
        if (await item.check({ store, api })) {
          (this.foundIssues || (this.foundIssues = [])).push(item)
        } else {
          this.foundIssues = (this.foundIssues || [])
            .filter(issue => issue.message !== item.message)
        }
      }
    },

    closeOnOutsideClick () {
      const listener = (e) => {
        if (e.target.closest('.config-checker')) return
        this.isPaneActive = false
        document.removeEventListener('click', listener)
      }
      document.addEventListener('click', listener)
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.config-checker {
  color: $color-text-inverse;
  position: relative;
  height: 100%;
  margin-right: 10px;
  margin-left: auto;
  display: flex;
  align-items: center;
}

.config-checker__icon {
  cursor: pointer;
  svg {
    fill: orangered;
  }
}

.config-checker__pane {
  background-color: $color-content-bg;
  position: absolute;
  top: 85%;
  right: 0;
  min-width: 25rem;
  padding: 1.5rem;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);
  color: $color-danger;
}
</style>
