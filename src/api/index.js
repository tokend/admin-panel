import accounts from './accounts'
import assets from './assets'
import documents from './documents'
import emissions from './emissions'
import fees from './fees'
import forfeits from './forfeits'
import keyValue from './key-value'
import limits from './limits'
import tfa from './tfa'
import transactions from './transactions'
import users from './users'
// new
import { requests } from './requests'
import { sales } from './sales'
import { orderBooks } from './order-books'

export default {
  install (Vue, options) {
    Vue.api = this
  },

  assets: assets,
  accounts: accounts,
  documents: documents,
  emissions: emissions,
  fees: fees,
  forfeits: forfeits,
  keyValue: keyValue,
  limits: limits,
  tfa: tfa,
  transactions: transactions,
  users: users,

  // new:
  requests,
  sales,
  orderBooks
}
