import assets from './assets'
import tfa from './tfa'
import users from './users'
// new
import { requests } from './requests'

export default {
  install (Vue, options) {
    Vue.api = this
  },

  assets: assets,
  tfa: tfa,
  users: users,

  // new:
  requests,
}
