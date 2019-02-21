<template>
  <div
    id="app"
    v-if="isAppInitialized"
  >
    <template v-if="!isGoodBrowser">
      <no-support-message />
    </template>
    <template v-else>
      <status-message />

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

      <template v-if="isHorizonInfoLoaded">
        <router-view></router-view>
      </template>
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
      connectionError: false,
      checkConnectionI: null,
      sessionKeeperIn: null,

      isGoodBrowser: true,
      isHorizonInfoLoaded: false,
      isAppInitialized: false
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
      await this.checkConnection()
      this.checkConnectionI = setInterval(this.checkConnection, 15000)

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

      ApiWrp.setDefaultHorizonUrl(config.HORIZON_SERVER)
      ApiWrp.setDefaultNetworkPassphrase(config.NETWORK_PASSPHRASE)

      this.isAppInitialized = true
    },

    checkConnection () {
      return this.$http.get(config.HORIZON_SERVER)
        .then(response => {
          const info = response.body
          config.NETWORK_PASSPHRASE = info.network_passphrase
          config.MASTER_ACCOUNT = info.master_account_id ||
            info.admin_account_id

          // TODO: remove
          config.COMMISSION_ACCOUNT = info.commission_account_id
          config.OPERATIONAL_ACCOUNT = info.operational_account_id
          config.STORAGE_FEE_ACCOUNT = info.storage_fee_account_id

          this.isHorizonInfoLoaded = true
          this.connectionError = false
          this.error = []
        }).catch(err => {
          if (err.status !== 404) {
            this.connectionError = true
            this.$store.dispatch('SET_ERROR', 'Could not connect to the Network')
          }
        }).then(() => {
          return this.$http.get(config.KEY_SERVER_ADMIN + '/kdf_params')
            .then(() => {
              this.connectionError = false
            }).catch(err => {
              if (err.status !== 404) {
                this.connectionError = true
                this.$store.dispatch('SET_ERROR', 'Could not connect to the KeyStorage')
              }
            })
        }).then(() => {
          if (!this.connectionError) {
            clearInterval(this.checkConnectionI)
          }
        })
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
            clearInterval(this.checkConnectionI)
            break
          }
          case 'LOG_OUT': {
            clearInterval(this.sessionKeeperIn)
            clearInterval(this.timeCheckerIn)
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
      this.sessionKeeperIn = setInterval(() => {
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
