import { api, loadingDataViaLoop } from '@/api'
import { snakeToCamelCase } from '@/utils/un-camel-case'

function getKvValue (kvKey, kvArray) {
  const kvFound = kvArray.find((key) => key.id === kvKey)

  if (!kvFound) {
    return ''
  }

  return kvFound.value.u32
}

export const state = {
  defaultRoleIds: {
    general: -1,
    corporate: -1,
    usVerified: -1,
    usAccredited: -1,
    unverified: -1,
    blocked: -1,
  },
  kvAssetTypeDefault: -1,
  kvAssetTypeKycRequired: -1,
  kvAssetTypeSecurity: -1,
  kvPollTypeRestricted: -1,
  kvPollTypeUnrestricted: -1,
  kvPoolTypes: {
    restricted: -1,
    unrestricted: -1,
  },
  kvAssetTypes: {
    default: -1,
    kycRequired: -1,
    security: -1,
  },
  kvSingerRoles: {
    default: -1,
  },
  kvChangeRoleTasks: {
    completeAutoVerification: -1,
    submitAutoVerification: -1,
    manualReviewRequired: -1,
    default: -1,
  },
  kvEntries: [],
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

  SET_KV_SINGER_ROLES_DEFAULT (state, id) {
    state.kvSingerRoles.default = id
  },

  SET_KV_ENTRIES (state, data) {
    state.kvEntries = data
  },

  SET_KV_CHANGE_ROLE_TASKS_COMPLETE_VERIFICATION (state, id) {
    state.kvChangeRoleTasks.completeAutoVerification = id
  },

  SET_KV_CHANGE_ROLE_TASKS_SUBMIT_VERIFICATION (state, id) {
    state.kvChangeRoleTasks.submitAutoVerification = id
  },

  SET_KV_CHANGE_ROLE_TASKS_MANUAL_REVIEW (state, id) {
    state.kvChangeRoleTasks.manualReviewRequired = id
  },
  SET_KV_CHANGE_ROLE_TASKS_DEFAULT (state, id) {
    state.kvChangeRoleTasks.default = id
  },

  SET_KV_POLL_TYPE (state, data) {
    state.kvPoolTypes = data
      .filter(item => /poll_type/ig.test(item.id))
      .reduce((result, item) => {
        const assetTypeName = snakeToCamelCase(item.id.split(':')[1])
        result[assetTypeName] = String(item.value.u32)
        return result
      }, state.kvPoolTypes)
  },

  SET_KV_ASSET_TYPE (state, data) {
    state.kvAssetTypes = data
      .filter(item => /asset_type/ig.test(item.id))
      .reduce((result, item) => {
        const assetTypeName = snakeToCamelCase(item.id.split(':')[1])
        result[assetTypeName] = String(item.value.u32)
        return result
      }, state.kvAssetTypes)
  },
}

export const actions = {
  async LOAD_KV_ENTRIES ({ commit }) {
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
    const singerRolesDefault = getKvValue('signer_role:default', data)
    const changeRoleTasksCompleteVerifiction =
      getKvValue('change_role_task:complete_auto_verification', data)
    const changeRoleTasksSubmitVerifiction =
      getKvValue('change_role_task:submit_auto_verification', data)
    const changeRoleTasksManualReview =
      getKvValue('change_role_task:manual_review_required', data)
    const changeRoleTasksDefault =
      getKvValue('change_role_tasks:*:*', data)

    commit('SET_KV_ENTRIES', data)
    commit('SET_KV_POLL_TYPE', data)
    commit('SET_KV_ASSET_TYPE', data)
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
    commit('SET_KV_SINGER_ROLES_DEFAULT', singerRolesDefault)
    // eslint-disable max-len
    commit('SET_KV_CHANGE_ROLE_TASKS_COMPLETE_VERIFICATION', changeRoleTasksCompleteVerifiction)
    commit('SET_KV_CHANGE_ROLE_TASKS_SUBMIT_VERIFICATION', changeRoleTasksSubmitVerifiction)
    commit('SET_KV_CHANGE_ROLE_TASKS_MANUAL_REVIEW', changeRoleTasksManualReview)
    commit('SET_KV_CHANGE_ROLE_TASKS_DEFAULT', changeRoleTasksDefault)
  },
}

export const getters = {
  kvEntryGeneralRoleId: state => state.defaultRoleIds.general,
  kvEntryCorporateRoleId: state => state.defaultRoleIds.corporate,
  kvEntryUnverifiedRoleId: state => state.defaultRoleIds.unverified,
  kvEntryUsVerifiedRoleId: state => state.defaultRoleIds.usVerified,
  kvEntryUsAccreditedRoleId: state => state.defaultRoleIds.usAccredited,
  kvEntryBlockedRoleId: state => state.defaultRoleIds.blocked,
  kvAccountRoles: state => state.defaultRoleIds,
  kvAssetTypeDefault: state => state.kvAssetTypeDefault,
  kvAssetTypeKycRequired: state => state.kvAssetTypeKycRequired,
  kvAssetTypeSecurity: state => state.kvAssetTypeSecurity,
  kvPollTypeRestricted: state => state.kvPollTypeRestricted,
  kvPollTypeUnrestricted: state => state.kvPollTypeUnrestricted,
  kvSingerRoles: state => state.kvSingerRoles.default,
  kvEntries: state => state.kvEntries,
  kvPoolTypes: state => state.kvPoolTypes,
  kvAssetTypes: state => state.kvAssetTypes,
  kvChangeRoleTasks: state => state.kvChangeRoleTasks,
}

export default {
  state,
  mutations,
  actions,
  getters,
}
