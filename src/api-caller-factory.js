import { ApiCaller } from '@tokend/js-sdk'
import { Wallet } from '@tokend/js-sdk'

let defaultHorizonUrl
let defaultWallet
let defaultNetworkPassphrase

export class ApiCallerFactory {
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
      throw new Error('ApiCallerFactory.setDefaultWallet(): wallet should be instance of Wallet')
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
    const callerInstance = ApiCallerFactory.createPublicCallerInstance(opts)

    if (!opts.wallet && !ApiCallerFactory.defaultWallet) {
      throw new Error('ApiCallerFactory.createCallerInstance(): neither opts.wallet nor ApiCallerFactory.defaultWallet provided')
    }

    const wallet = opts.wallet || ApiCallerFactory.defaultWallet
    callerInstance.useWallet(wallet)

    if (!opts.networkPassphrase && !ApiCallerFactory.defaultNetworkPassphrase) {
      throw new Error('ApiCallerFactory.createCallerInstance(): neither opts.networkPassphrase nor ApiCallerFactory.defaultNetworkPassphrase provided')
    }

    const networkPassphrase = opts.networkPassphrase || ApiCallerFactory.defaultNetworkPassphrase
    callerInstance.usePassphrase(networkPassphrase)

    return callerInstance
  }

  /**
   * Creates a new public caller instance (requires no keypair and passphrase)
   * @param {Object} [opts]
   * @param {Object} [opts.horizonUrl]
   */
  static createPublicCallerInstance (opts = {}) {
    if (!opts.horizonUrl && !ApiCallerFactory.defaultHorizonUrl) {
      throw new Error('ApiCallerFactory.createCallerInstance(): neither opts.horizonUrl nor ApiCallerFactory.defaultHorizonUrl provided')
    }

    const horizonUrl = opts.horizonUrl || ApiCallerFactory.defaultHorizonUrl
    const callerInstance = ApiCaller.getInstance(horizonUrl)

    return callerInstance
  }
}

