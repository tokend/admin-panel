import accounts from './accounts'
import assets from './assets'
import documents from './documents'
import limits from './limits'
import tfa from './tfa'
import users from './users'
// new
import { requests } from './requests'

export default {
  install (Vue, options) {
    Vue.api = this
  },

  assets: assets,
  accounts: accounts,
  documents: documents,
  limits: limits,
  tfa: tfa,
  users: users,

  // new:
  requests
}
