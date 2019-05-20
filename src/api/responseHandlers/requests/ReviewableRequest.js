import api from '@/api/index'

export class ReviewableRequest {
  constructor (record) {
    this._rawRequest = { ...record }
    this.record = { ...record, ...record.requestDetails }
    this.operationDetails = this.record.requestDetails
  }

  get id () {
    return this.record.id
  }

  get state () {
    return this.record.state
  }

  get rejectReason () {
    return this.record.rejectReason
  }

  // actions:

  fulfill () {
    return api.requests.approve(this._rawRequest)
  }

  reject (reason = '', isPermanent = false) {
    return api.requests.reject({ reason, isPermanent }, this._rawRequest)
  }
}
