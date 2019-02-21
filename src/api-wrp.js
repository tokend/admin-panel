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

  /**
   * Creates a new caller instance
   * @param {Object} [opts]
   * @param {Object} [opts.wallet]
   * @param {Object} [opts.horizonUrl]
   * @param {Object} [opts.networkPassphrase]
   */
  static createCallerInstance (opts = {}) {
    if (!opts.horizonUrl && !defaultHorizonUrl) {
      throw new Error('ApiWrp.createCallerInstance(): neither opts.horizonUrl nor defaultHorizonUrl provided')
    }

    const horizonUrl = opts.horizonUrl || defaultHorizonUrl
    const callerInstance = ApiCaller.getInstance(horizonUrl)

    if (!opts.wallet && !defaultWallet) {
      throw new Error('ApiWrp.createCallerInstance(): neither opts.wallet nor defaultWallet provided')
    }

    const wallet = opts.wallet || defaultWallet
    callerInstance.useWallet(wallet)

    if (!opts.networkPassphrase && !defaultNetworkPassphrase) {
      throw new Error('ApiWrp.createCallerInstance(): neither opts.networkPassphrase nor defaultNetworkPassphrase provided')
    }

    const networkPassphrase = opts.networkPassphrase || defaultNetworkPassphrase
    callerInstance.usePassphrase(networkPassphrase)

    return callerInstance
  }
}

