import axios from 'axios'
import { TokenD, KeyServerCaller, Wallet } from '@tokend/js-sdk'

import store from '../store'
import config from '../config'

const sdkServer = () => {
  const sdkInstance = new TokenD(config.KEY_SERVER_ADMIN, {
    allowHttp: true,
  }) // true for use http, only localhost
  return new KeyServerCaller({
    axios: axios.create({
      baseURL: config.KEY_SERVER_ADMIN,
    }),
    sdk: sdkInstance,
  })
}

const get = (path, data = null, isSigned) => {
  if (isSigned) {
    const wallet = new Wallet(
      '',
      store.getters.GET_USER.keys.seed,
      store.getters.GET_USER.keys.accountId
    )
    return sdkServer()
      .getWithSignature(path, data, wallet)
      .then(r => {
        return r.data
      }).catch(err => {
        return Promise.reject(err)
      })
  } else {
    return sdkServer()
      .get(path, data)
      .then(r => {
        return r.data
      }).catch(err => {
        return Promise.reject(err)
      })
  }
}

const patch = (path, data = {}) => {
  const wallet = new Wallet(
    '',
    store.getters.GET_USER.keys.seed,
    store.getters.GET_USER.keys.accountId
  )
  return sdkServer()
    .patchWithSignature(path, data, wallet)
    .then(r => {
      return r.data
    }).catch(err => {
      return Promise.reject(err)
    })
}

const post = (path, data = {}) => {
  const wallet = new Wallet(
    '',
    store.getters.GET_USER.keys.seed,
    store.getters.GET_USER.keys.accountId
  )
  return sdkServer()
    .postWithSignature(path, data, wallet)
    .then(r => {
      return r.data
    }).catch(err => {
      return Promise.reject(err)
    })
}

export default {
  sdkServer: sdkServer(),
  get,
  patch,
  post,
}
