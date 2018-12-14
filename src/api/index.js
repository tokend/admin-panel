import accounts from './accounts'
import assets from './assets'
import documents from './documents'
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
  tfa: tfa,
  users: users,

  // new:
  requests
}
