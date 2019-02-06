import config from '@/config'
import { KYC_TASKS_TO_REMOVE_ON_REJECT } from '../constants'
import store from '../store'
import { deriveRequestIdFromCreateKycRequestResult } from '../utils/parseXdrTxResponse'
import { Sdk } from '@/sdk'

import {
  REQUEST_TYPES,
  REVIEW_STATES,
  KYC_TASKS_TO_REMOVE_ON_APPROVE,
  KYC_TASKS_TO_ADD_ON_APPROVE,
  KYC_TASKS_TO_ADD_ON_REJECT
} from '@/constants'

import { CreatePreIssuanceRequest } from './responseHandlers/requests/CreatePreIssuanceRequest'
import { TokenRequest } from './responseHandlers/requests/TokenRequest'
import { IssuanceCreateRequest } from './responseHandlers/requests/IssuanceCreateRequest'
import { clearObject } from '@/utils/clearObject'

export const requests = {
  _review ({ action, reason = '' }, ...requests) {
    const operations = requests.map(function (item) {
      return Sdk.base.ReviewRequestBuilder.reviewRequest({
        requestID: item.id,
        requestHash: item.hash,
        requestType: item.details.requestTypeI,
        action,
        reason
      })
    })
    return Sdk.horizon.transactions.submitOperations(...operations)
  },

  _reviewWithdraw ({ action, reason = '' }, ...requests) {
    const operations = requests.map(function (item) {
      return Sdk.base.ReviewRequestBuilder.reviewTwoStepWithdrawRequest({
        requestID: item.id,
        requestHash: item.hash,
        requestType: item.request_type_i || item.requestTypeI,
        action,
        reason,
        externalDetails: {}
      })
    })
    return Sdk.horizon.transactions.submitOperations(...operations)
  },

  async _reviewKyc ({ action, reason }, request, tasks) {
    const operation = Sdk.base.ReviewRequestBuilder.reviewUpdateKYCRequest({
      requestID: request.id,
      requestHash: request.hash,
      requestType: request.request_type_i || request.requestTypeI,
      action,
      reason,
      tasksToAdd: tasks.add,
      tasksToRemove: tasks.remove,
      externalDetails: {}
    })
    return (await Sdk.horizon.transactions.submitOperations(operation))
  },

  async approve (...requests) {
    const action = Sdk.xdr.ReviewRequestOpAction.approve().value
    return (await this._review({ action }, ...requests)).data
  },

  async approveWithdraw (...requests) {
    const action = Sdk.xdr.ReviewRequestOpAction.approve().value
    return (await this._reviewWithdraw({ action }, ...requests)).data
  },

  async approveKyc (request, opts = {}) {
    const action = Sdk.xdr.ReviewRequestOpAction.approve().value

    return (await this._reviewKyc({ action, reason: '' }, request, {
      remove: opts.tasksToRemove || KYC_TASKS_TO_REMOVE_ON_APPROVE,
      add: opts.tasksToAdd || KYC_TASKS_TO_ADD_ON_APPROVE
    })).data
  },

  /**
   * Approves limit request without changes, then submits ManageLimits op to all limit changes
   * @param {Object} params.request
   * @param {Object} params.oldLimits
   * @param {Array} params.newLimits
   * @returns {*}
   */
  async approveLimitsUpdate (params) {
    const newLimits = params.newLimits
      .map(limits => ({
        ...limits,
        id: '' + limits.id,
        accountID: params.accountId,
        accountType: undefined
      }))
    const operations = []
    operations.push(Sdk.base.ReviewRequestBuilder.reviewLimitsUpdateRequest({
      requestHash: params.request.hash,
      requestType: params.request.request_type_i || params.request.requestTypeI,
      action: Sdk.xdr.ReviewRequestOpAction.approve().value,
      reason: '',
      requestID: params.request.id,
      newLimits: newLimits[0]
    }))
    newLimits
      .forEach(limits => {
        operations.push(
          Sdk.base.ManageLimitsBuilder.createLimits(limits)
        )
      })
    const response = await Sdk.horizon.transactions.submitOperations(...operations)
    return response.data
  },

  async rejectLimitsUpdate (params) {
    const newLimits = params.newLimits
      .map(limits => ({
        ...limits,
        id: '' + limits.id,
        accountID: params.accountId,
        accountType: undefined
      }))
    const operation = Sdk.base.ReviewRequestBuilder.reviewLimitsUpdateRequest({
      requestHash: params.request.hash,
      requestType: params.request.request_type_i || params.request.requestTypeI,
      action: params.isPermanent
        ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
        : Sdk.xdr.ReviewRequestOpAction.reject().value,
      reason: params.reason,
      requestID: params.request.id,
      newLimits: newLimits[0]
    })
    const response = await Sdk.horizon.transactions.submitOperations(operation)
    return response.data
  },

  async reject ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
      : Sdk.xdr.ReviewRequestOpAction.reject().value
    return (await this._review({ action, reason }, ...requests)).data
  },

  async rejectWithdraw ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
      : Sdk.xdr.ReviewRequestOpAction.reject().value
    return (await this._reviewWithdraw({ action, reason }, ...requests)).data
  },

  async rejectKyc (request, reason) {
    const action = Sdk.xdr.ReviewRequestOpAction.reject().value

    return (await this._reviewKyc({ action, reason },
      request, {
        remove: KYC_TASKS_TO_REMOVE_ON_REJECT,
        add: KYC_TASKS_TO_ADD_ON_REJECT
      })).data
  },

  /**
   * @param {object} opts
   * @param {string} opts.accountToUpdateKyc
   * @param {string} opts.accountTypeToSet
   * @param {string} opts.blobId
   * @param {string} opts.rejectReason
   * @param {string} opts.requestToApprove
   */
  async resetToUnverified (opts) {
    const operations = [
      Sdk.base.CreateUpdateKYCRequestBuilder.createUpdateKYCRequest({
        requestID: '0',
        accountToUpdateKYC: opts.accountToUpdateKyc,
        accountTypeToSet: Sdk.xdr.AccountType.notVerified().value,
        kycLevelToSet: 0,
        kycData: { blob_id: opts.blobId },
        allTasks: 0
      }),
      Sdk.base.CreateUpdateKYCRequestBuilder.createUpdateKYCRequest({
        requestID: '0',
        accountToUpdateKYC: opts.accountToUpdateKyc,
        accountTypeToSet: opts.accountTypeToSet,
        kycLevelToSet: 0,
        kycData: { blob_id: opts.blobId }
      })
    ]
    if (opts.requestToApprove) {
      operations.unshift(
        Sdk.base.ReviewRequestBuilder.reviewUpdateKYCRequest({
          requestID: opts.requestToApprove.id,
          requestHash: opts.requestToApprove.hash,
          requestType: opts.requestToApprove.request_type_i || opts.requestToApprove.requestTypeI,
          action: Sdk.xdr.ReviewRequestOpAction.approve().value,
          reason: '',
          tasksToAdd: KYC_TASKS_TO_ADD_ON_APPROVE,
          tasksToRemove: opts.requestToApprove.pendingTasks,
          externalDetails: {}
        })
      )
    }
    const txResponse = await Sdk.horizon.transactions.submitOperations(...operations)

    const requestId = deriveRequestIdFromCreateKycRequestResult(txResponse, operations.length - 1)
    await this.rejectKyc(await this.get(requestId), opts.rejectReason)
  },

  async reviewMultipleKycRequests (requestsDetails) {
    const rejectAction = Sdk.xdr.ReviewRequestOpAction.reject().value
    const approveAction = Sdk.xdr.ReviewRequestOpAction.approve().value

    const operations = requestsDetails.map(detail =>
        Sdk.base.ReviewRequestBuilder.reviewUpdateKYCRequest({
          requestID: detail.request.id,
          requestHash: detail.request.hash,
          requestType: detail.request.request_type_i || detail.request.requestTypeI,
          action: detail.state === REVIEW_STATES.approved ? approveAction : rejectAction,
          reason: detail.reason || '',
          tasksToAdd: detail.state === REVIEW_STATES.approved ? detail.tasksToAdd : KYC_TASKS_TO_ADD_ON_REJECT,
          tasksToRemove: detail.state === REVIEW_STATES.approved ? KYC_TASKS_TO_REMOVE_ON_APPROVE : KYC_TASKS_TO_REMOVE_ON_REJECT,
          externalDetails: {}
        }
      ))
    const response = await Sdk.horizon.transactions.submitOperations(...operations)
    return response.data
  },

  async get (id) {
    const response = await Sdk.horizon.request.get(id)
    return response.data
  },

  async getIssuanceRequests ({ asset, state }) {
    const filters = {}
    if (state) filters.state = state
    if (asset) filters.asset = asset
    return (await Sdk.horizon.request.getAllForIssuances({
      order: 'desc',
      reviewer: config.MASTER_ACCOUNT,
      limit: store.getters.pageLimit,
      ...filters
    }))
  },

  async getWithdrawalRequests ({ asset, state, requestor }) {
    const filters = {}
    if (asset) filters.dest_asset_code = asset
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor
    return (await Sdk.horizon.request.getAllForWithdrawals({
      order: 'desc',
      limit: store.getters.pageLimit,
      ...filters
    }))
  },

  async getSaleRequests ({ state, requestor }) {
    const filters = {}
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor
    return (await Sdk.horizon.request.getAllForSales({
      order: 'desc',
      limit: store.getters.pageLimit,
      ...filters
    }))
  },

  async getKycRequests ({ state, requestor, type }) {
    const filters = {}
    if (requestor) filters.requestor = requestor
    if (type) filters.account_type_to_set = type
    if (state && state.state) {
      filters.state = state.state
      state.tasksToProcess ? filters.mask_set = state.tasksToProcess : null
      state.tasksProcessed ? filters.mask_not_set = state.tasksProcessed : null
    }
    const response = await Sdk.horizon.request.getAllForUpdateKyc({
      ...filters,
      order: 'desc',
      limit: store.getters.pageLimit
    })
    return response
  },

  async getAssetRequests (filters) {
    const params = clearObject({
      asset: filters.code,
      requestor: filters.requestor,
      state: filters.state,
      reviewer: filters.reviewer,
      order: 'desc'
    })
    return (await Sdk.horizon.request.getAllForAssets(params))
  },

  async getLimitsUpdateRequests ({ asset, state, requestor }) {
    const filters = {}
    if (asset) filters.dest_asset_code = asset
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor
    return (await Sdk.horizon.request.getAllForLimitsUpdates({
      order: 'desc',
      limit: store.getters.pageLimit,
      ...filters
    }))
  },

  async getPreissuanceRequests (asset) {
    if (asset.toLowerCase() === 'all') {
      asset = ''
    }
    const response = await Sdk.horizon.request.getAllForPreissuances({
      asset: asset,
      order: 'desc',
      reviewer: config.MASTER_ACCOUNT
    })
    response.records = mapRequests(response.data)
    return response
  },

  mapRequests
}

function mapRequests (records) {
  return records.map(record => {
    const type = record.details.requestTypeI
    switch (type) {
      case REQUEST_TYPES.assetCreate:
      case REQUEST_TYPES.assetUpdate:
        return new TokenRequest(record)
      case REQUEST_TYPES.issuanceCreate:
        return new IssuanceCreateRequest(record)
      case REQUEST_TYPES.preIssuanceCreate:
        return new CreatePreIssuanceRequest(record)
      default:
        throw new Error(`Unknown reviewable request type: ${type}`)
    }
  })
}
