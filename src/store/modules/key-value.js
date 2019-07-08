import { api, loadingDataViaLoop } from '@/api'

function getKvValue (kvKey, kvArray) {
  const kvFound = kvArray.find((key) => key.id === kvKey)

  if (!kvFound) {
    return ''
  }

  return kvFound.value.u32
}

export const state = {
  defaultRoleIds: {
    general: null,
    corporate: null,
    usVerified: null,
    usAccredited: null,
    unverified: null,
    blocked: null,
  },
  kvAssetTypeDefault: null,
  kvAssetTypeKycRequired: null,
  kvAssetTypeSecurity: null,
  kvPollTypeRestricted: null,
  kvPollTypeUnrestricted: null,
  kvEntries: null,
}

export const mutations = {
  SET_KV_ENTRY_GENERAL_ROLE_ID (state, id) {
    state.defaultRoleIds.general = id
  },

  SET_KV_ENTRY_CORPORATE_ROLE_ID (state, id) {
    state.defaultRoleIds.corporate = id
  },

  SET_KV_ENTRY_US_VERIFIED_ROLE_ID (state, id) {
    state.defaultRoleIds.usVerified = id
  },

  SET_KV_ENTRY_US_ACCREDITED_ROLE_ID (state, id) {
    state.defaultRoleIds.usAccredited = id
  },

  SET_KV_ENTRY_UNVERIFIED_ROLE_ID (state, id) {
    state.defaultRoleIds.unverified = id
  },

  SET_KV_ENTRY_BLOCKED_ROLE_ID (state, id) {
    state.defaultRoleIds.blocked = id
  },

  SET_KV_ASSET_TYPE_DEFAULT (state, value) {
    state.kvAssetTypeDefault = value
  },

  SET_KV_ASSET_TYPE_KYC_REQUIRED (state, kvAssetTypeKycRequired) {
    state.kvAssetTypeKycRequired = kvAssetTypeKycRequired
  },

  SET_KV_ASSET_TYPE_SECURITY (state, kvAssetTypeSecurity) {
    state.kvAssetTypeSecurity = kvAssetTypeSecurity
  },

  SET_KV_POLL_TYPE_RESTRICTED (state, kvPollTypeRestricted) {
    state.kvPollTypeRestricted = kvPollTypeRestricted
  },

  SET_KV_POLL_TYPE_UNRESTRICTED (state, kvPollTypeUnrestricted) {
    state.kvPollTypeUnrestricted = kvPollTypeUnrestricted
  },

  SET_KV_ENTRIES (state, data) {
    state.kvEntries = data
  },
}

export const actions = {
  async LOAD_KV_ENTRIES ({ dispatch }) {
    await dispatch('LOAD_KV_ENTRIES_ACCOUNT_ROLE_IDS')
  },

  async LOAD_KV_ENTRIES_ACCOUNT_ROLE_IDS ({ commit }) {
    const response = await api.get(`/v3/key_values`)
    const data = await loadingDataViaLoop(response)

    const generalRoleId = getKvValue('account_role:general', data)
    const corporateRoleId = getKvValue('account_role:corporate', data)
    const unverifiedRoleId = getKvValue('account_role:unverified', data)
    const blockedRoleId = getKvValue('account_role:blocked', data)
    const usVerifiedRoleId = getKvValue('account_role:us_verified', data)
    const usAccreditedRoleId = getKvValue('account_role:us_accredited', data)
    const assetTypeDefault = getKvValue('asset_type:default', data)
    const assetTypeKycRequired = getKvValue('asset_type:kyc_required', data)
    const assetTypeSecurity = getKvValue('asset_type:security', data)
    const restrictedPollType = getKvValue('poll_type:restricted', data)
    const unrestrictedPollType = getKvValue('poll_type:unrestricted', data)

    commit('SET_KV_ENTRIES', data)
    commit('SET_KV_ENTRY_GENERAL_ROLE_ID', generalRoleId)
    commit('SET_KV_ENTRY_CORPORATE_ROLE_ID', corporateRoleId)
    commit('SET_KV_ENTRY_UNVERIFIED_ROLE_ID', unverifiedRoleId)
    commit('SET_KV_ENTRY_BLOCKED_ROLE_ID', blockedRoleId)
    commit('SET_KV_ENTRY_US_VERIFIED_ROLE_ID', usVerifiedRoleId)
    commit('SET_KV_ENTRY_US_ACCREDITED_ROLE_ID', usAccreditedRoleId)
    commit('SET_KV_ASSET_TYPE_DEFAULT', assetTypeDefault)
    commit('SET_KV_ASSET_TYPE_KYC_REQUIRED', assetTypeKycRequired)
    commit('SET_KV_ASSET_TYPE_SECURITY', assetTypeSecurity)
    commit('SET_KV_POLL_TYPE_RESTRICTED', restrictedPollType)
    commit('SET_KV_POLL_TYPE_UNRESTRICTED', unrestrictedPollType)
  },
}

export const getters = {
  kvEntryGeneralRoleId: state => state.defaultRoleIds.general,
  kvEntryCorporateRoleId: state => state.defaultRoleIds.corporate,
  kvEntryUnverifiedRoleId: state => state.defaultRoleIds.unverified,
  kvEntryUsVerifiedRoleId: state => state.defaultRoleIds.usVerified,
  kvEntryUsAccreditedRoleId: state => state.defaultRoleIds.usAccredited,
  kvEntryBlockedRoleId: state => state.defaultRoleIds.blocked,
  kvAssetTypeDefault: state => state.kvAssetTypeDefault,
  kvAssetTypeKycRequired: state => state.kvAssetTypeKycRequired,
  kvAssetTypeSecurity: state => state.kvAssetTypeSecurity,
  kvPollTypeRestricted: state => state.kvPollTypeRestricted,
  kvPollTypeUnrestricted: state => state.kvPollTypeUnrestricted,
  kvEntries: state => state.kvEntries,
}

export default {
  state,
  mutations,
  actions,
  getters,
}
