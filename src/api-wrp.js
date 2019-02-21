import { ApiCaller } from '@tokend/js-sdk'
import { Wallet } from '@tokend/js-sdk'

let defaultHorizonUrl
let defaultWallet
let defaultNetworkPassphrase

export class ApiWrp {
  /**
   * Sets default horizon url to be used on creating new caller instances
   * @param {string} horizonUrl
   */
  static setDefaultHorizonUrl (horizonUrl) {
    defaultHorizonUrl = horizonUrl
  }

  /**
   * Sets default wallet to be used on creating new caller instances
   * @param {Wallet} wallet
   */
  static setDefaultWallet (wallet) {
    if (!wallet instanceof Wallet) {
      throw new Error('ApiWrp.setDefaultWallet(): wallet should be instance of Wallet')
    }
    defaultWallet = wallet
  }

  /**
   * Sets default network passphrase to be used on creating new caller instances
   * @param {string} horizonUrl
   */
  static setDefaultNetworkPassphrase (networkPassphrase) {
    defaultNetworkPassphrase = networkPassphrase
  }

  static get defaultHorizonUrl () {
    return defaultHorizonUrl
  }

  static get defaultWallet () {
    return defaultWallet
  }

  static get defaultNetworkPassphrase () {
    return defaultNetworkPassphrase
  }

  /**
   * Creates a new caller instance
   * @param {Object} [opts]
   * @param {Object} [opts.wallet]
   * @param {Object} [opts.horizonUrl]
   * @param {Object} [opts.networkPassphrase]
   */
  static createCallerInstance (opts = {}) {
    if (!opts.horizonUrl && !ApiWrp.defaultHorizonUrl) {
      throw new Error('ApiWrp.createCallerInstance(): neither opts.horizonUrl nor ApiWrp.defaultHorizonUrl provided')
    }

    const horizonUrl = opts.horizonUrl || ApiWrp.defaultHorizonUrl
    const callerInstance = ApiCaller.getInstance(horizonUrl)

    if (!opts.wallet && !ApiWrp.defaultWallet) {
      throw new Error('ApiWrp.createCallerInstance(): neither opts.wallet nor ApiWrp.defaultWallet provided')
    }

    const wallet = opts.wallet || ApiWrp.defaultWallet
    callerInstance.useWallet(wallet)

    if (!opts.networkPassphrase && !ApiWrp.defaultNetworkPassphrase) {
      throw new Error('ApiWrp.createCallerInstance(): neither opts.networkPassphrase nor ApiWrp.defaultNetworkPassphrase provided')
    }

    const networkPassphrase = opts.networkPassphrase || ApiWrp.defaultNetworkPassphrase
    callerInstance.usePassphrase(networkPassphrase)

    return callerInstance
  }
}

