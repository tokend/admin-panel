// TODO: refactor this mess
import Vue from 'vue'

import store from './store'
import router from './router'

import StellarWallet from 'tokend-wallet-js-sdk'

import { Sdk } from '@/sdk'
import config from '@/config'
import { ApiCallerFactory } from '@/api-caller-factory'

import { Wallet } from '@tokend/js-sdk'

const server = {
  'trusted': true,
  'websocket_ssl': false,
}

export default {
  /**
   * Install the Auth class.
   *
   * @param {Object} Vue The global Vue.
   * @param {Object} options Any options we want to have in our plugin.
   * @return {void}
   */
  install (Vue, options) {
    Vue.auth = this
  },

  async createWallet (credentials, redirect) {
    const signingKeys = Sdk.base.Keypair.fromSecret(credentials.seed)
    const keychainData = {
      seed: signingKeys.seed(),
      accountId: signingKeys.accountId(),
    }

    const mainData = {
      username: credentials.username.toLowerCase(),
      server: server,
    }

    try {
      const wallet = await StellarWallet.createAdminWallet({
        username: credentials.username.toLowerCase(),
        password: credentials.password,
        publicKey: signingKeys.rawPublicKey().toString('hex'),
        accountId: signingKeys.accountId(),
        keychainData: JSON.stringify(keychainData),
        mainData: JSON.stringify(mainData),
        server: Vue.params.KEY_SERVER_ADMIN,
        keypair: signingKeys,
      })

      this._storeWallet(wallet, credentials.username)

      if (redirect) {
        router.push({ name: redirect })
      }
    } catch (error) {
      return error
    }
  },

  async login (credentials) {
    const params = {
      server: Vue.params.KEY_SERVER_ADMIN,
      username: credentials.username.toLowerCase(),
      password: credentials.password,
    }

    try {
      const wallet = await StellarWallet.getWallet(params)
      this._storeWallet(wallet, credentials.username)

      return { ok: true, enabledTFA: false }
    } catch (err) {
      if (err.status === 403 && err.tfaRequired) {
        return {
          ok: true,
          enabledTFA: true,
          token: err.token,
          phone: err.phone,
          loginParams: {
            walletId: err.walletId,
            rawMasterKey: err.rawMasterKey,
            rawWalletId: err.rawWalletId,
            rawWalletKey: err.rawWalletKey,
          },
        }
      } else {
        return {
          ok: false,
          status: err.code,
          message: err.message,
        }
      }
    }
  },

  async continueLogin (params) {
    const options = {
      server: Vue.params.KEY_SERVER_ADMIN,
      username: params.username,
      walletId: params.walletId,
      rawMasterKey: params.rawMasterKey,
      rawWalletId: params.rawWalletId,
      rawWalletKey: params.rawWalletKey,
    }

    try {
      const wallet = await StellarWallet.showWallet(options)
      this._storeWallet(wallet, params.username)

      return { ok: true }
    } catch (err) {
      return {
        ok: false,
        message: err.message,
        code: err.status,
      }
    }
  },

  async seedLogin (seed) {
    const auth = store.state.auth || {}
    const user = store.state.user || {}
    const keyPair = Sdk.base.Keypair.fromSecret(seed)

    user.name = 'admin_demo'
    user.address = keyPair.accountId()
    user.keys = user.keys || {}
    user.keys.accountId = config.MASTER_ACCOUNT
    user.keys.seed = keyPair.secret()

    const signingWallet = new Wallet(
      '',
      user.keys.seed,
      user.keys.accountId
    )
    Sdk.sdk.useWallet(signingWallet)
    ApiCallerFactory.setDefaultWallet(signingWallet)

    store.commit('UPDATE_USER', user)
    store.commit('UPDATE_AUTH', auth)
  },

  async _storeWallet (wallet, username) {
    const auth = store.state.auth || {}
    const user = store.state.user || {}

    user.name = username
    user.address = JSON.parse(wallet.getKeychainData()).accountId
    user.keys = user.keys || {}
    user.keys.accountId = config.MASTER_ACCOUNT
    user.keys.seed = JSON.parse(wallet.getKeychainData()).seed
    user.wallet = user.wallet || {}
    user.wallet.id = wallet.getWalletId()

    const signingWallet = new Wallet(
      '',
      user.keys.seed,
      user.keys.accountId,
      wallet.getWalletId()
    )
    Sdk.sdk.useWallet(signingWallet)
    ApiCallerFactory.setDefaultWallet(signingWallet)

    store.commit('UPDATE_USER', user)
    store.commit('UPDATE_AUTH', auth)
  },
}
