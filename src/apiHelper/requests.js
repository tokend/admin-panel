import config from '@/config'
import { base } from '@tokend/js-sdk'

import { REQUEST_TYPES, ALL_ASSETS_ID } from '@/constants'

import { CreatePreIssuanceRequest } from './responseHandlers/requests/CreatePreIssuanceRequest'
import { AssetRequest } from './responseHandlers/requests/AssetRequest'
import { IssuanceCreateRequest } from './responseHandlers/requests/IssuanceCreateRequest'

import _get from 'lodash/get'
import { api } from '@/api'
import { globalize } from '@/components/App/filters/filters'
import { RoleRecord } from '@/js/records/role.record'

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

      return base.ReviewRequestBuilder.reviewRequest({
        ...opts,

        // TODO: remove. added due to a bug in the @tokend/js-sdk
        requestDetails: opts,
      })
    })
    return api.postOperations(...operations)
  },

  _reviewWithdraw ({ action, reason = '' }, ...requests) {
    const operations = requests.map(function (item) {
      const opts = {
        requestID: item.id,
        requestHash: item.hash,
        requestType: REQUEST_TYPES.createWithdraw,
        reviewDetails: {
          tasksToAdd: 0,
          tasksToRemove: item.pendingTasks || item.pending_tasks,
          externalDetails: {},
        },
        action,
        reason,
      }
      return base.ReviewRequestBuilder.reviewWithdrawRequest(opts)
    })
    return api.postOperations(...operations)
  },

  async approve (...requests) {
    const action = base.xdr.ReviewRequestOpAction.approve().value
    const { data } = await this._review({ action }, ...requests)
    return data
  },

  async approveWithdraw (...requests) {
    const action = base.xdr.ReviewRequestOpAction.approve().value
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
    operations.push(base.ReviewRequestBuilder.reviewLimitsUpdateRequest({
      requestHash: params.request.hash,
      requestType: params.request.xdrType.value,
      action: base.xdr.ReviewRequestOpAction.approve().value,
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
          base.ManageLimitsBuilder.createLimits(limits)
        )
      })
    const response = await api.postOperations(...operations)
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

    const operation = base.ReviewRequestBuilder.reviewLimitsUpdateRequest({
      requestHash: params.request.hash,
      requestType: params.request.xdrType.value,
      action: params.isPermanent
        ? base.xdr.ReviewRequestOpAction.permanentReject().value
        : base.xdr.ReviewRequestOpAction.reject().value,
      reason: params.reason,
      requestID: params.request.id,
      newLimits: newLimits[0],
    })
    const response = await api.postOperations(operation)
    return response.data
  },

  async reject ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? base.xdr.ReviewRequestOpAction.permanentReject().value
      : base.xdr.ReviewRequestOpAction.reject().value

    const { data } = await this._review({ action, reason }, ...requests)
    return data
  },

  async rejectWithdraw ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? base.xdr.ReviewRequestOpAction.permanentReject().value
      : base.xdr.ReviewRequestOpAction.reject().value

    const { data } = await this._reviewWithdraw(
      { action, reason }, ...requests
    )
    return data
  },

  async get (id) {
    const { data } = await api.getWithSignature(`/v3/requests/${id}`, {
      include: ['request_details'],
    })
    return data
  },

  async getSaleCreateRequests ({ state, requestor }) {
    const filters = {}
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    const response = await api.getWithSignature('/v3/create_sale_requests', {
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

    const response = await api.getWithSignature('/v3/update_limits_requests', {
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
    if (asset.toLowerCase() === ALL_ASSETS_ID) {
      asset = ''
    }
    const endpoint = '/v3/create_pre_issuance_requests'
    const response = await api.getWithSignature(endpoint, {
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
  async updateRole (role) {
    const operation = base.ManageAccountRoleBuilder.update(
      new RoleRecord(role))
    await api.postOperations(operation)
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
        throw new Error(globalize('requests.unknown-request-type', {
          type: type,
        })
        )
    }
  })
}
