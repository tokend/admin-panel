import config from '@/config'
import { KYC_TASKS_TO_REMOVE_ON_REJECT } from '../constants'
import server from '../utils/server'
import store from '../store'
import { xdr, ReviewRequestBuilder, CreateUpdateKYCRequestBuilder, ManageLimitsBuilder } from 'tokend-js-sdk'
import { deriveRequestIdFromCreateKycRequestResult } from '../utils/parseXdrTxResponse'

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
import { ServerCallBuilder } from './ServerCallBuilder'
import { envelopOperations } from './helpers/envelopOperations'
import { clearObject } from '@/utils/clearObject'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('requests')
  .registerResource('request')
  .registerResource('transactions')
  .registerResource('withdrawals')
  .registerResource('assets')
  .registerResource('issuances')
  .registerResource('sales')
  .registerResource('update_kyc')
  .registerResource('limits_updates')

export const requests = {
  _review ({ action, reason = '' }, ...requests) {
    const tx = envelopOperations(
      ...requests.map(function (item) {
        return ReviewRequestBuilder.reviewRequest({
          requestID: item.id,
          requestHash: item.hash,
          requestType: typeof item.request_type_i === 'undefined' ? item.requestTypeI : item.request_type_i,
          source: config.MASTER_ACCOUNT,
          action,
          reason
        })
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  _reviewWithdraw ({ action, reason = '' }, ...requests) {
    const tx = envelopOperations(
      ...requests.map(function (item) {
        return ReviewRequestBuilder.reviewTwoStepWithdrawRequest({
          requestID: item.id,
          requestHash: item.hash,
          requestType: item.request_type_i || item.requestTypeI,
          source: config.MASTER_ACCOUNT,
          action,
          reason,
          externalDetails: {}
        })
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  _reviewKyc ({ action, reason }, request, tasks) {
    const tx = envelopOperations(
      ReviewRequestBuilder.reviewUpdateKYCRequest({
        requestID: request.id,
        requestHash: request.hash,
        requestType: request.request_type_i || request.requestTypeI,
        action,
        reason,
        tasksToAdd: tasks.add,
        tasksToRemove: tasks.remove,
        externalDetails: {}
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  approve (...requests) {
    const action = xdr.ReviewRequestOpAction.approve().value
    return this._review({ action }, ...requests)
  },

  approveWithdraw (...requests) {
    const action = xdr.ReviewRequestOpAction.approve().value
    return this._reviewWithdraw({ action }, ...requests)
  },

  approveKyc (request, opts = {}) {
    const action = xdr.ReviewRequestOpAction.approve().value

    return this._reviewKyc({ action, reason: '' }, request, {
      remove: opts.tasksToRemove || KYC_TASKS_TO_REMOVE_ON_APPROVE,
      add: opts.tasksToAdd || KYC_TASKS_TO_ADD_ON_APPROVE
    })
  },

  /**
   * Approves limit request without changes, then submits ManageLimits op to all limit changes
   * @param {Object} params.request
   * @param {Object} params.oldLimits
   * @param {Array} params.newLimits
   * @returns {*}
   */
  approveLimitsUpdate (params) {
    const newLimits = params.newLimits
      .map(limits => ({
        ...limits,
        id: '' + limits.id,
        accountID: params.accountId,
        accountType: undefined
      }))
    const tx = envelopOperations(
      ReviewRequestBuilder.reviewLimitsUpdateRequest({
        requestHash: params.request.hash,
        requestType: params.request.request_type_i || params.request.requestTypeI,
        source: config.MASTER_ACCOUNT,
        action: xdr.ReviewRequestOpAction.approve().value,
        reason: '',
        requestID: params.request.id,
        newLimits: newLimits[0]
      }),
      ...newLimits
        .map(limits => ManageLimitsBuilder.createLimits(limits))
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .post({ tx })
  },

  rejectLimitsUpdate (params) {
    const newLimits = params.newLimits
      .map(limits => ({
        ...limits,
        id: '' + limits.id,
        accountID: params.accountId,
        accountType: undefined
      }))
    const tx = envelopOperations(
      ReviewRequestBuilder.reviewLimitsUpdateRequest({
        requestHash: params.request.hash,
        requestType: params.request.request_type_i || params.request.requestTypeI,
        source: config.MASTER_ACCOUNT,
        action: params.isPermanent
        ? xdr.ReviewRequestOpAction.permanentReject().value
        : xdr.ReviewRequestOpAction.reject().value,
        reason: params.reason,
        requestID: params.request.id,
        newLimits: newLimits[0]
      })
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .post({ tx })
  },

  reject ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? xdr.ReviewRequestOpAction.permanentReject().value
      : xdr.ReviewRequestOpAction.reject().value
    return this._review({ action, reason }, ...requests)
  },

  rejectWithdraw ({ reason, isPermanent = false }, ...requests) {
    const action = isPermanent
      ? xdr.ReviewRequestOpAction.permanentReject().value
      : xdr.ReviewRequestOpAction.reject().value
    return this._reviewWithdraw({ action, reason }, ...requests)
  },

  rejectKyc (request, reason) {
    const action = xdr.ReviewRequestOpAction.reject().value

    return this._reviewKyc({ action, reason },
      request, {
        remove: KYC_TASKS_TO_REMOVE_ON_REJECT,
        add: KYC_TASKS_TO_ADD_ON_REJECT
      })
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
      CreateUpdateKYCRequestBuilder.createUpdateKYCRequest({
        requestID: '0',
        accountToUpdateKYC: opts.accountToUpdateKyc,
        accountTypeToSet: xdr.AccountType.notVerified().value,
        kycLevelToSet: 0,
        kycData: { blob_id: opts.blobId },
        allTasks: 0
      }),
      CreateUpdateKYCRequestBuilder.createUpdateKYCRequest({
        requestID: '0',
        accountToUpdateKYC: opts.accountToUpdateKyc,
        accountTypeToSet: opts.accountTypeToSet,
        kycLevelToSet: 0,
        kycData: { blob_id: opts.blobId }
      })
    ]
    if (opts.requestToApprove) {
      operations.unshift(
        ReviewRequestBuilder.reviewUpdateKYCRequest({
          requestID: opts.requestToApprove.id,
          requestHash: opts.requestToApprove.hash,
          requestType: opts.requestToApprove.request_type_i || opts.requestToApprove.requestTypeI,
          action: xdr.ReviewRequestOpAction.approve().value,
          reason: '',
          tasksToAdd: KYC_TASKS_TO_ADD_ON_APPROVE,
          tasksToRemove: opts.requestToApprove.pendingTasks,
          externalDetails: {}
        })
      )
    }

    const tx = envelopOperations(...operations)
    const txResponse = await new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })

    const requestId = deriveRequestIdFromCreateKycRequestResult(txResponse, operations.length - 1)
    await this.rejectKyc(await this.get(requestId), opts.rejectReason)
  },

  reviewMultipleKycRequests (requestsDetails) {
    const rejectAction = xdr.ReviewRequestOpAction.reject().value
    const approveAction = xdr.ReviewRequestOpAction.approve().value

    const tx = envelopOperations(
      ...requestsDetails.map(detail =>
        ReviewRequestBuilder.reviewUpdateKYCRequest({
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
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .sign()
      .post({ tx })
  },

  get (id) {
    return new ScopedServerCallBuilder()
      .requests()
      .id(id)
      .sign()
      .get()
      .then(({ data }) => data)
  },

  getAssetRequest (filters) {
    const params = clearObject({
      asset: filters.code,
      requestor: filters.requestor,
      state: filters.state,
      reviewer: filters.reviewer,
      order: 'desc'
    })

    return new ScopedServerCallBuilder()
      .request()
      .assets()
      .sign()
      .get(params)
      .then(({ data }) => data[0] || null)
  },

  getIssuanceRequests ({ asset, state }) {
    const filters = {}
    if (state) filters.state = state
    if (asset) filters.asset = asset

    return new ScopedServerCallBuilder()
      .request()
      .issuances()
      .sign()
      .get({
        order: 'desc',
        reviewer: config.MASTER_ACCOUNT,
        limit: store.getters.pageLimit,
        ...filters
      })
  },

  getWithdrawalRequests ({ asset, state, requestor }) {
    const filters = {}
    if (asset) filters.dest_asset_code = asset
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    return new ScopedServerCallBuilder()
      .request()
      .withdrawals()
      .sign()
      .get({
        order: 'desc',
        limit: store.getters.pageLimit,
        ...filters
      })
  },

  getSaleRequests ({ state, requestor }) {
    const filters = {}
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    return new ScopedServerCallBuilder()
      .request()
      .sales()
      .sign()
      .get({
        order: 'desc',
        limit: store.getters.pageLimit,
        ...filters
      })
  },

  getKycRequests ({ state, requestor, type }) {
    const filters = {}
    if (requestor) filters.requestor = requestor
    if (type) filters.account_type_to_set = type
    if (state && state.state) {
      filters.state = state.state
      state.tasksToProcess ? filters.mask_set = state.tasksToProcess : null
      state.tasksProcessed ? filters.mask_not_set = state.tasksProcessed : null
    }
    return new ScopedServerCallBuilder()
      .request()
      .update_kyc()
      .sign()
      .get({
        ...filters,
        order: 'desc',
        limit: store.getters.pageLimit
      })
  },

  getAssetRequests (filters) {
    const params = clearObject({
      asset: filters.code,
      requestor: filters.requestor,
      state: filters.state,
      reviewer: filters.reviewer,
      order: 'desc'
    })

    return new ScopedServerCallBuilder()
      .request()
      .assets()
      .sign()
      .get(params)
  },

  getLimitsUpdateRequests ({ asset, state, requestor }) {
    const filters = {}
    if (asset) filters.dest_asset_code = asset
    if (state) filters.state = state
    if (requestor) filters.requestor = requestor

    return new ScopedServerCallBuilder()
      .request()
      .limits_updates()
      .sign()
      .get({
        order: 'desc',
        limit: store.getters.pageLimit,
        ...filters
      })
  },

  // legacy

  reviewRequest (opts) {
    opts.source = config.MASTER_ACCOUNT
    const operation = ReviewRequestBuilder.reviewRequest(opts)
    return server.submitOperation(operation, true)
  },

  getPreissuanceRequests (asset) {
    if (asset.toLowerCase() === 'all') {
      asset = ''
    }

    return server.sdkServer.reviewableRequestsHelper()
      .preissuances()
      .forAssetCode(asset)
      .order('desc')
      .forReviewer(config.MASTER_ACCOUNT)
      .limit(store.getters.pageLimit)
      .callWithSignature(store.getters.keypair)
      .then(response => {
        response.records = mapRequests(response.records)
        return response
      })
  },

  getAssetCreationRequests ({ state, requestor, asset }) {
    return server.sdkServer.reviewableRequestsHelper()
      .assets()
      .order('desc')
      .forReviewer(config.MASTER_ACCOUNT)
      .limit(store.getters.pageLimit)
      .forState(state)
      .forRequestor(requestor)
      .forAssetCode(asset)
      .callWithSignature(store.getters.keypair)
      .then(response => {
        response.records = mapRequests(response.records)
        return Promise.resolve(response)
      })
  },

  getTokenRequestById (id) {
    return server.sdkServer.reviewableRequestsHelper()
      .assets()
      .reviewableRequest(id)
      .callWithSignature(store.getters.keypair)
      .then(response => {
        return Promise.resolve(new TokenRequest(response))
      })
  },

  mapRequests
}

function mapRequests (records) {
  return records.map(record => {
    const type = record.details.request_type_i
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
