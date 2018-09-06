import Vue from 'vue'
import StellarSdk from 'tokend-js-sdk'

import store from '../store'
import config from '../config'

const sdkServer = () => {
  StellarSdk.Network.use(new StellarSdk.Network(config.NETWORK_PASSPHRASE))
  return new StellarSdk.Server(config.HORIZON_SERVER, { allowHttp: true })
}

const createTx = (operation) => {
  const source = new StellarSdk.Account(config.MASTER_ACCOUNT)
  const tx = new StellarSdk.TransactionBuilder(source)
    .addOperation(operation)
    .build()
  tx.sign(store.getters.keypair)
  return tx.toEnvelope().toXDR().toString('base64')
}

const submitOperation = (operation) => {
  const sourceID = config.MASTER_ACCOUNT
  const kp = store.getters.keypair

  return sdkServer().submitOperation(operation, sourceID, kp)
}

const get = (path, isSigned, data = null, toKeyserver = false) => {
  let url
  let reqConfig = {}

  if (isSigned) {
    reqConfig = sdkServer()._getConfig(path, store.getters.keypair)
    reqConfig.headers['Content-Type'] = 'application/json'
  }

  if (data) {
    reqConfig.params = data
  }

  if (toKeyserver) {
    url = config.KEY_SERVER_ADMIN + path
  } else {
    url = config.HORIZON_SERVER + path
  }

  return Vue.http.get(url, reqConfig)
    .then(response => {
      return response.body
    }).catch(err => {
      return Promise.reject(err.body)
    })
}

const patch = (path, data = {}, isSigned = false, toKeyserver = false) => {
  let reqConfig, url

  if (isSigned) {
    reqConfig = sdkServer()._getConfig(path, store.getters.keypair)
    reqConfig.headers['Content-Type'] = 'application/json'
  }

  if (toKeyserver) {
    url = config.KEY_SERVER_ADMIN + path
  } else {
    url = config.HORIZON_SERVER + path
  }
  return Vue.http.patch(url, data, reqConfig)
    .then(response => {
      return response.body
    }).catch(err => {
      return Promise.reject(err.body)
    })
}

const post = (path, data = {}, isSigned = false, toKeyserver = false) => {
  let reqConfig, url

  if (isSigned) {
    reqConfig = sdkServer()._getConfig(path, store.getters.keypair)
    reqConfig.headers['Content-Type'] = 'application/json'
  }

  if (toKeyserver) {
    url = config.KEY_SERVER_ADMIN + path
  } else {
    url = config.HORIZON_SERVER + path
  }
  return Vue.http.post(url, data, reqConfig)
    .then(response => {
      return response.body
    }).catch(err => {
      return Promise.reject(err.body)
    })
}

export default {
  sdkServer: sdkServer(),
  createTx,
  get,
  patch,
  post,
  submitOperation
}
