import { Asset } from '../wrappers/asset'
import { api, loadingDataViaLoop } from '@/api'

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
    let pageResponse = await api.get('/v3/assets', {
      page: { limit: ASSETS_PAGE_LIMIT },
    })
    let assets = await loadingDataViaLoop(pageResponse)

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
