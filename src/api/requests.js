import config from '@/config'
import { Sdk } from '@/sdk'

import { REQUEST_TYPES } from '@/constants'

import { CreatePreIssuanceRequest } from './responseHandlers/requests/CreatePreIssuanceRequest'
import { AssetRequest } from './responseHandlers/requests/AssetRequest'
import { IssuanceCreateRequest } from './responseHandlers/requests/IssuanceCreateRequest'

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
        requestType: item.xdrType.value,
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
        requestDetails: JSON.stringify(opts),
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

  async getSaleCreateRequests ({ state, requestor }) {
    const filters = {}
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    const response = await ApiCallerFactory
      .createCallerInstance()
      .getWithSignature('/v3/create_sale_requests', {
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
    const response = await ApiCallerFactory
      .createCallerInstance()
      .getWithSignature('/v3/create_pre_issuance_requests', {
        filter: {
          'request_details.asset': asset,
          reviewer: config.MASTER_ACCOUNT,
        },
        page: {
          order: 'desc',
        },
        include: ['request_details'],
      })
    response.records = mapRequests(response.data)
    return response
  },

  mapRequests,
}

function mapRequests (records) {
  return records.map(record => {
    const type = record.xdrType.value
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
