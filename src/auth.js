import Vue from 'vue'
import store from './store'
import router from './router'
import Sdk from 'tokend-js-sdk'
import StellarWallet from 'tokend-wallet-js-sdk'
import accounts from './api/accounts'

const server = {
  'trusted': true,
  'websocket_ssl': false
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

  createWallet (credentials, redirect) {
    const signingKeys = Sdk.Keypair.fromSecret(credentials.seed)
    const keychainData = { seed: signingKeys.seed(), accountId: signingKeys.accountId() }
    const mainData = { username: credentials.username.toLowerCase(), server: server }

    return StellarWallet.createAdminWallet({
      username: credentials.username.toLowerCase(),
      password: credentials.password,
      publicKey: signingKeys.rawPublicKey().toString('hex'),
      accountId: signingKeys.accountId(),
      keychainData: JSON.stringify(keychainData),
      mainData: JSON.stringify(mainData),
      server: Vue.params.KEY_SERVER_ADMIN,
      keypair: signingKeys
    }).then((response) => {
      this._storeToken(response, credentials.username)

      if (redirect) router.push({ name: redirect })
    }).catch((errorResponse) => {
      return errorResponse
    })
  },

  login (creds) {
    const params = {
      server: Vue.params.KEY_SERVER_ADMIN,
      username: creds.username.toLowerCase(),
      password: creds.password
    }

    return StellarWallet.getWallet(params)
      .then(wallet => {
        this._storeToken(wallet, creds.username)
        return { ok: true, enabledTFA: false }
      }).catch(err => {
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
              rawWalletKey: err.rawWalletKey
            }
          }
        }

        return { ok: false, status: err.code, message: err.message }
      })
  },

  continueLogin (params) {
    const options = {
      server: Vue.params.KEY_SERVER_ADMIN,
      username: params.username,
      walletId: params.walletId,
      rawMasterKey: params.rawMasterKey,
      rawWalletId: params.rawWalletId,
      rawWalletKey: params.rawWalletKey
    }

    return StellarWallet.showWallet(options)
      .then(wallet => {
        this._storeToken(wallet, params.username)
        return { ok: true }
      }).catch(err => {
        return { ok: false, message: err.message, code: err.status }
      })
  },

  async seedLogin (seed) {
    const auth = store.state.auth || {}
    const user = store.state.user || {}
    const keypair = Sdk.Keypair.fromSecret(seed)

    user.name = 'admin_demo'
    user.keys = user.keys || {}
    user.keys.accountId = keypair.accountId()
    user.keys.seed = keypair.secret()

    const signerTypes = await this._getSignerTypes(user.keys.accountId)

    Object.assign(user, signerTypes)
    store.commit('UPDATE_USER', user)
    store.commit('UPDATE_AUTH', auth)
  },

  async _storeToken (credentials, username) {
    const auth = store.state.auth
    const user = store.state.user
    user.name = username
    user.keys = JSON.parse(credentials.getKeychainData())
    user.wallet = {
      id: credentials.getWalletId()
    }

    const signerTypes = await this._getSignerTypes(user.keys.accountId)

    Object.assign(user, signerTypes)
    store.commit('UPDATE_USER', user)
    store.commit('UPDATE_AUTH', auth)
  },

  async _getSignerTypes (accountId) {
    const result = {}
    let response = {}

    try {
      response = await accounts.getSignerById(accountId)
    } catch (error) {
      console.error(error)
      error.message = 'Cannot get signer types'
      throw error
    }

    result.signerTypes = response.signer.signer_types
    result.signerTypes.forEach((val) => {
      if (val.value === 2) result.admin = true
      if (val.value === 4) result.accountCreator = true
      if (val.value === 32) result.forfeitProvider = true
    })

    return result
  }
}
