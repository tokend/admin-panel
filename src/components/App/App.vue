<template>
  <div id="app">
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
          > </div>
        </transition>

        <transition name="fade">
          <loading-screen v-if="showLoader" />
        </transition>

        <verify-tfa></verify-tfa>

        <idle-logout></idle-logout>

        <router-view></router-view>
      </template>
    </template>

    <template v-else>
      <div class="app__loading-wrp">
        <template v-if="isHorizonConnectionError">
          <p class="app__loading-error-txt">
            Cannot connect to Horizon
          </p>
        </template>

        <template v-else-if="isRolesRetrievalError">
          <p class="app__loading-error-txt">
            Cannot retrieve roles
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
import config from '../../config'
import StatusMessage from './components/StatusMessage'
import IdleLogout from './components/IdleLogout.vue'
import VerifyTfa from './components/VerifyTfa'
import LoadingScreen from './components/Loader'
import UAParser from 'ua-parser-js'
import NoSupportMessage from './components/IERestrictionMessage.vue'
import { Sdk } from '@/sdk'
import { Wallet } from '@tokend/js-sdk'

import './scss/app.scss'
import { ApiWrp } from '@/api-wrp'
import { ErrorHandler } from '@/utils/ErrorHandler'

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
    NoSupportMessage
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
    }
  },

  data () {
    return {
      sessionKeeperInterval: null,
      isGoodBrowser: true,
      isAppInitialized: false,
      isRolesRetrievalError: false,
      isHorizonConnectionError: false
    }
  },

  async created () {
    this.isGoodBrowser = !isIE()
    if (!this.isGoodBrowser) return
    await this.initApp()
  },

  methods: {
    async initApp () {
      this.subscribeToStoreMutations()
      await this.loadHorizonConfigs()

      await Sdk.init(config.HORIZON_SERVER)
      if (this.$store.getters.GET_USER.keys.seed) {
        const wallet = new Wallet(
          '',
          this.$store.getters.GET_USER.keys.seed,
          this.$store.getters.GET_USER.keys.accountId,
          this.$store.getters.GET_USER.wallet.id
        )
        Sdk.sdk.useWallet(wallet)
        ApiWrp.setDefaultWallet(wallet)
        this.$store.dispatch('LOG_IN')
      }

      this.isAppInitialized = true
    },

    async loadHorizonConfigs () {
      try {
        const { body: horizonConfig } =
          await this.$http.get(config.HORIZON_SERVER)

        config.NETWORK_PASSPHRASE = horizonConfig.network_passphrase
        config.MASTER_ACCOUNT = horizonConfig.master_account_id ||
          horizonConfig.admin_account_id

        ApiWrp.setDefaultHorizonUrl(config.HORIZON_SERVER)
        ApiWrp.setDefaultNetworkPassphrase(config.NETWORK_PASSPHRASE)
      } catch (error) {
        setTimeout(
          () => (this.isHorizonConnectionError = true),
          new Date().getFullYear()
        )
        ErrorHandler.processWithoutFeedback(error)
      }

      try {
        const { body: roles } =
          await this.$http.get(`${config.HORIZON_SERVER}/key_value`)
        config.ACCOUNT_ROLES.notVerified = roles
          .find(item => item.key === 'account_role:unverified')
          .uint32_value
        config.ACCOUNT_ROLES.general = roles
          .find(item => item.key === 'account_role:general')
          .uint32_value
        config.ACCOUNT_ROLES.corporate = roles
          .find(item => item.key === 'account_role:corporate')
          .uint32_value
        config.ACCOUNT_ROLES.blocked = roles
          .find(item => item.key === 'account_role:blocked')
          .uint32_value
        config.SIGNER_ROLES.default = roles
          .find(item => item.key === 'signer_role:default')
          .uint32_value
      } catch (error) {
        setTimeout(
          () => (this.isRolesRetrievalError = true),
          new Date().getFullYear()
        )
        ErrorHandler.processWithoutFeedback(error)
      }
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
            if (this.$store.state.auth.isLoggedIn && this.$store.getters.logoutTimer === null) {
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
    }
  }
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
}

.app__loading-error-txt {
  text-align: center;
  font-size: 7.2rem;
  color: $color-danger;
  font-weight: bold;
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
