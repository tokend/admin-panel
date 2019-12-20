<template>
  <div
    id="app"
    :key="lang"
  >
    <status-message />

    <template v-if="isAppInitialized">
      <template v-if="!isGoodBrowser">
        <no-support-message />
      </template>

      <template v-else>
        <transition name="fade">
          <div
            class="modal-background"
            v-if="isModalOpen"
            @click="$store.commit('WANT_CLOSE_MODAL')"
          />
        </transition>

        <transition name="fade">
          <loading-screen v-if="showLoader" />
        </transition>

        <verify-tfa />

        <idle-logout />

        <router-view />
      </template>
    </template>

    <template v-else>
      <div class="app__loading-wrp">
        <template v-if="isConfigLoadingFailed">
          <p class="app__loading-error-txt">
            Initializing failed
          </p>
        </template>

        <template v-else>
          <p class="app__loading-txt">
            Initializing the app...
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import StatusMessage from './components/StatusMessage'
import IdleLogout from './components/IdleLogout.vue'
import VerifyTfa from './components/VerifyTfa'
import LoadingScreen from './components/Loader'
import NoSupportMessage from './components/IERestrictionMessage.vue'

import UAParser from 'ua-parser-js'

import { api, documentsManager } from '@/api'
import config from '../../config'

import { Wallet } from '@tokend/js-sdk'

import './scss/app.scss'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { ErrorTracker } from '@/utils/ErrorTracker'
import { mapActions } from 'vuex'
import { i18n } from '@/i18n'

function isIE () {
  const parser = new UAParser()
  const browser = parser.getBrowser()
  if (browser.name === 'IE[Mobile]' || browser.name === 'IE') return true
  return false
}

export default {
  name: 'app',
  components: {
    LoadingScreen,
    VerifyTfa,
    StatusMessage,
    IdleLogout,
    NoSupportMessage,
  },

  data () {
    return {
      sessionKeeperInterval: null,
      isGoodBrowser: true,
      isAppInitialized: false,
      isConfigLoadingFailed: false,
      lang: i18n.language,
    }
  },

  computed: {
    isModalOpen () {
      return this.$store.state.isModalOpen
    },

    showLoader () {
      return this.$store.getters.showLoader
    },

    isLoggedIn () {
      return this.$store.state.auth.isLoggedIn
    },
  },

  async created () {
    this.isGoodBrowser = !isIE()
    if (!this.isGoodBrowser) return

    i18n.onLanguageChanged(lng => (this.lang = lng))

    await this.initApp()
  },

  methods: {
    ...mapActions({
      loadKvEntries: 'LOAD_KV_ENTRIES',
    }),

    async initApp () {
      this.subscribeToStoreMutations()
      await this.loadConfigs()

      if (this.$store.getters.GET_USER.keys.seed) {
        const wallet = new Wallet(
          '',
          this.$store.getters.GET_USER.keys.seed,
          this.$store.getters.GET_USER.keys.accountId,
          this.$store.getters.GET_USER.wallet.id
        )
        api.useWallet(wallet)
        ErrorTracker.setLoggedInUser({
          'accountId': this.$store.getters.GET_USER.keys.accountId,
          'name': this.$store.getters.GET_USER.name,
        })
        this.$store.dispatch('LOG_IN')
      }
      documentsManager.useApi(api)
      documentsManager.useStorageURL(config.FILE_STORAGE)

      if (!this.isConfigLoadingFailed) {
        this.isAppInitialized = true
      }
    },

    async loadConfigs () {
      try {
        await this.loadHorizonConfigs()
        await this.loadKvEntries()
      } catch (error) {
        this.isConfigLoadingFailed = true
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async loadHorizonConfigs () {
      api.useBaseURL(config.HORIZON_SERVER)
      const { data: horizonConfig } = await api.getRaw('/')
      api.useNetworkDetails(horizonConfig)
      config.NETWORK_PASSPHRASE = horizonConfig.networkPassphrase
      config.MASTER_ACCOUNT = horizonConfig.masterAccountId ||
        horizonConfig.adminAccountId
    },

    subscribeToStoreMutations () {
      this.$store.subscribe((mutation, state) => {
        switch (mutation.type) {
          case 'OPEN_MODAL': {
            document.body.classList.add('modal-open')
            break
          }
          case 'CLOSE_MODAL': {
            document.body.classList.remove('modal-open')
            break
          }
          case 'LOG_IN': {
            this.sessionKeeper()
            break
          }
          case 'LOG_OUT': {
            clearInterval(this.sessionKeeperInterval)
            this.$router.push({ name: 'login' })
            break
          }
          default: {
            const shouldIdleBeStarted = this.$store.state.auth.isLoggedIn &&
              this.$store.getters.logoutTimer === null
            if (shouldIdleBeStarted) {
              this.$store.dispatch('START_IDLE')
            }
          }
        }
      })
    },

    sessionKeeper () {
      this.$store.commit('KEEP_SESSION')
      this.sessionKeeperInterval = setInterval(() => {
        this.$store.commit('KEEP_SESSION')
      }, 10 * 1000)
    },
  },
}
</script>

<style lang="scss">
@import "../../assets/scss/colors";
#app {
  min-height: 100%;
  min-width: 102rem;
  display: flex;
  flex-direction: column;
  background-color: $color-bg;
}

.app__loading-wrp {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.app__loading-txt {
  text-align: center;
  font-size: 7.2rem;
  color: $color-text-secondary;
  font-weight: bold;
  text-shadow: .1rem .1rem 0 $color-shadow-secondary-text;
}

.app__loading-error-txt {
  @extend .app__loading-txt;
  color: $color-text-init-loading-failed;
  text-shadow: .1rem .1rem 0 $color-shadow-init-loading-failed;
}

// ***** Legacy *****

.modal-open {
  overflow-y: hidden;
  position: relative;
}

.modal-background {
  background: rgba(0, 0, 0, 0.8);
  display: block;
  z-index: 800;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
</style>
