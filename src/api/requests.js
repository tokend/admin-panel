import config from '@/config'
import { Sdk } from '@/sdk'

import { REQUEST_TYPES } from '@/constants'

import { CreatePreIssuanceRequest } from './responseHandlers/requests/CreatePreIssuanceRequest'
import { AssetRequest } from './responseHandlers/requests/AssetRequest'
import { IssuanceCreateRequest } from './responseHandlers/requests/IssuanceCreateRequest'

import { clearObject } from '@/utils/clearObject'
import _get from 'lodash/get'
import { ApiCallerFactory } from '@/api-caller-factory'

export const requests = {
  _review ({ action, reason = '' }, ...requests) {
    const operations = requests.map(function (item) {
      const opts = {
        requestID: item.id,
        requestHash: item.hash,
        requestType:
          _get(item, 'xdrType.value') ||
          _get(item, 'details.requestTypeI') ||
          _get(item, 'requestTypeI'),
        reviewDetails: {
          tasksToAdd: _get(item, 'reviewDetails.tasksToAdd', 0),
          tasksToRemove: _get(item, 'reviewDetails.tasksToRemove',
            item.pendingTasks
          ),
          externalDetails: '{}',
        },
        action,
        reason,
      }

      return Sdk.base.ReviewRequestBuilder.reviewRequest({
        ...opts,

        // TODO: remove. added due to a bug in the @tokend/js-sdk
        requestDetails: opts,
      })
    })
    return ApiCallerFactory
      .createCallerInstance()
      .postOperations(...operations)
  },

  _reviewWithdraw ({ action, reason = '' }, ...requests) {
    const operations = requests.map(function (item) {
      const opts = {
        requestID: item.id,
        requestHash: item.hash,
        requestType: item.request_type_i || item.requestTypeI,
        reviewDetails: {
          tasksToAdd: 0,
          tasksToRemove: item.pendingTasks || item.pending_tasks,
          externalDetails: '{}',
        },
        action,
        reason,
      }
      return Sdk.base.ReviewRequestBuilder.reviewWithdrawRequest({
        ...opts,

        // TODO: remove. added due to a bug in the @tokend/js-sdk
        requestDetails: opts,
      })
    })
    return ApiCallerFactory
      .createCallerInstance()
      .postOperations(...operations)
  },

  async approve (...requests) {
    const action = Sdk.xdr.ReviewRequestOpAction.approve().value
    const { data } = await this._review({ action }, ...requests)
    return data
  },

  async approveWithdraw (...requests) {
    const action = Sdk.xdr.ReviewRequestOpAction.approve().value
    const { data } = await this._reviewWithdraw({ action }, ...requests)
    return data
  },

  /**
   * Approves limit request without changes, then submits
   * ManageLimits op to all limit changes
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
        accountRole: undefined,
      }))

    const operations = []
    operations.push(Sdk.base.ReviewRequestBuilder.reviewLimitsUpdateRequest({
      requestHash: params.request.hash,
      requestType: params.request.xdrType.value,
      action: Sdk.xdr.ReviewRequestOpAction.approve().value,
      reason: '',
      requestID: params.request.id,
      newLimits: newLimits[0],
      reviewDetails: {
        tasksToAdd: 0,
        tasksToRemove: params.request.pendingTasks ||
          params.request.pending_tasks,
        externalDetails: '{}',
      },
    }))

    newLimits
      .forEach(limits => {
        operations.push(
          Sdk.base.ManageLimitsBuilder.createLimits(limits)
        )
      })
    const response = await ApiCallerFactory
      .createCallerInstance()
      .postOperations(...operations)
    return response.data
  },

  async rejectLimitsUpdate (params) {
    const newLimits = params.newLimits
      .map(limits => ({
        ...limits,
        id: '' + limits.id,
        accountID: params.accountId,
        accountType: undefined,
      }))

    const operation = Sdk.base.ReviewRequestBuilder.reviewLimitsUpdateRequest({
      requestHash: params.request.hash,
      requestType: params.request.xdrType.value,
      action: params.isPermanent
        ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
        : Sdk.xdr.ReviewRequestOpAction.reject().value,
      reason: params.reason,
      requestID: params.request.id,
      newLimits: newLimits[0],
    })
    const response = await ApiCallerFactory
      .createCallerInstance()
      .postOperations(operation)
    return response.data
  },

  async reject ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
      : Sdk.xdr.ReviewRequestOpAction.reject().value

    const { data } = await this._review({ action, reason }, ...requests)
    return data
  },

  async rejectWithdraw ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? Sdk.xdr.ReviewRequestOpAction.permanentReject().value
      : Sdk.xdr.ReviewRequestOpAction.reject().value

    const { data } = await this._reviewWithdraw(
      { action, reason }, ...requests
    )
    return data
  },

  async get (id) {
    const { data } = await ApiCallerFactory
      .createCallerInstance()
      .getWithSignature(`/v3/requests/${id}`, {
        include: ['request_details'],
      })
    return data
  },

  async getIssuanceRequests ({ asset, state }) {
    const filters = {}
    if (state) filters.state = state
    if (asset) filters.asset = asset

    const response = await Sdk.horizon.request.getAllForIssuances({
      order: 'desc',
      reviewer: config.MASTER_ACCOUNT,
      limit: 1000,
      ...filters,
    })
    return response
  },

  async getWithdrawalRequests ({ asset, state, requestor }) {
    const filters = {}
    if (asset) filters.dest_asset_code = asset
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    const response = await Sdk.horizon.request.getAllForWithdrawals({
      order: 'desc',
      limit: 1000,
      ...filters,
    })
    return response
  },

  async getSaleRequests ({ state, requestor }) {
    const filters = {}
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    const response = await Sdk.horizon.request.getAllForSales({
      order: 'desc',
      limit: 1000,
      ...filters,
    })
    return response
  },

  async getAssetRequests (filters) {
    const params = clearObject({
      asset: filters.code,
      requestor: filters.requestor,
      state: filters.state,
      reviewer: filters.reviewer,
      order: 'desc',
      limit: 1000,
    })

    const response = await Sdk.horizon.request.getAllForAssets(params)
    return response
  },

  async getLimitsUpdateRequests ({ state, requestor }) {
    const filters = {}
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    const response = await ApiCallerFactory
      .createCallerInstance()
      .getWithSignature('/v3/update_limits_requests', {
        filter: {
          ...filters,
        },
        page: {
          order: 'desc',
        },
        include: ['request_details'],
      })
    return response
  },

  async getPreissuanceRequests (asset) {
    if (asset.toLowerCase() === 'all') {
      asset = ''
    }
    const response = await Sdk.horizon.request.getAllForPreissuances({
      asset: asset,
      order: 'desc',
      limit: 1000,
      reviewer: config.MASTER_ACCOUNT,
    })
    response.records = mapRequests(response.data)
    return response
  },

  mapRequests,
}

function mapRequests (records) {
  return records.map(record => {
    const type = record.details.requestTypeI
    switch (type) {
      case REQUEST_TYPES.createAsset:
      case REQUEST_TYPES.updateAsset:
        return new AssetRequest(record)
      case REQUEST_TYPES.createIssuance:
        return new IssuanceCreateRequest(record)
      case REQUEST_TYPES.createPreIssuance:
        return new CreatePreIssuanceRequest(record)
      default:
        throw new Error(`Unknown reviewable request type: ${type}`)
    }
  })
}
