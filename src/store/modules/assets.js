import { Asset } from '../wrappers/asset'
import { ApiCallerFactory } from '@/api-caller-factory'

const ASSETS_PAGE_LIMIT = 100

const state = {
  assets: [],
}

const mutations = {
  SET_ASSETS (state, assets) {
    state.assets = assets
  },
}

const actions = {
  async LOAD_ASSETS ({ commit }) {
    let pageResponse
    let assets

    pageResponse = await ApiCallerFactory
      .createCallerInstance()
      .get('/v3/assets', {
        page: { limit: ASSETS_PAGE_LIMIT },
      })
    assets = pageResponse.data

    while (pageResponse.data.length) {
      pageResponse = await pageResponse.fetchNext()
      assets.push(...pageResponse.data)
    }

    commit('SET_ASSETS', assets)
  },
}

const getters = {
  assets: state => state.assets.map(a => new Asset(a)),
  assetByCode: (_, getters) => assetCode =>
    getters.assets.find(item => item.code === assetCode),
}

export default {
  state,
  mutations,
  actions,
  getters,
}
