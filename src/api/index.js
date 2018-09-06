import accounts from './accounts'
import assets from './assets'
import balances from './balances'
import documents from './documents'
import emissions from './emissions'
import exchanges from './exchanges'
import fees from './fees'
import forfeits from './forfeits'
import limits from './limits'
import operations from './operations'
import tfa from './tfa'
import transactions from './transactions'
import users from './users'

// new
import { assetCreation } from './asset-creation'
import { requests } from './requests'
import { sales } from './sales'
import { orderBooks } from './order-books'
import { charts } from './charts'

export default {
  install (Vue, options) {
    Vue.api = this
  },

  assets: assets,
  accounts: accounts,
  balances: balances,
  documents: documents,
  emissions: emissions,
  exchanges: exchanges,
  fees: fees,
  forfeits: forfeits,
  limits: limits,
  operations: operations,
  tfa: tfa,
  transactions: transactions,
  users: users,

  // new:
  assetCreation,
  requests,
  sales,
  orderBooks,
  charts
}
