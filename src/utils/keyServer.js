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

const get = async (path, data = null, isSigned) => {
  if (isSigned) {
    const wallet = new Wallet(
      '',
      store.getters.GET_USER.keys.seed,
      store.getters.GET_USER.keys.accountId
    )

    const response = await sdkServer().getWithSignature(path, data, wallet)
    return response.data
  } else {
    const response = await sdkServer().get(path, data)
    return response.data
  }
}

const patch = async (path, data = {}) => {
  const wallet = new Wallet(
    '',
    store.getters.GET_USER.keys.seed,
    store.getters.GET_USER.keys.accountId
  )

  const response = await sdkServer().patchWithSignature(path, data, wallet)
  return response.data
}

const post = async (path, data = {}) => {
  const wallet = new Wallet(
    '',
    store.getters.GET_USER.keys.seed,
    store.getters.GET_USER.keys.accountId
  )

  const response = await sdkServer().postWithSignature(path, data, wallet)
  return response.data
}

export default {
  sdkServer: sdkServer(),
  get,
  patch,
  post,
}
