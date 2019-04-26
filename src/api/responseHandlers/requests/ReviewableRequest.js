import api from '@/api/index'

export class ReviewableRequest {
  constructor (record) {
    this._rawRequest = { ...record }
    this.record = { ...record, ...record.details }
    delete this.record.details

    const valuableRequestDetailsKey = Object.keys(record.details)
      .find(item => !/request_type|requestType/gi.test(item))
    this.operationDetails = this.record[valuableRequestDetailsKey]
  }

  get id () {
    return this.record.id
  }

  get state () {
    return this.record.requestState
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
