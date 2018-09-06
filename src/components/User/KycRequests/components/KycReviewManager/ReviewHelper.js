import { KYC_REQUEST_STATES } from '@/constants'
import api from '@/api'

export class KycReviewHelper {
  constructor (reviewPerTime) {
    this.index = 0
    this.list = {}

    this.toReview = []
    this.reviewed = []

    this.reviewPerTime = reviewPerTime
  }

  async init () {
    this.list = await api.requests.getKycRequests(
      { state: KYC_REQUEST_STATES.pending }
    )
    this.toReview = this.list.data
  }

  clear () {
    this.index = 0
    this.list = {}
    this.toReview.splice(0, this.toReview.length)
    this.reviewed.splice(0, this.reviewed.length)
  }

  getNew () {
    if (this.done) {
      throw new Error('All requests were reviewed. You need to clear reviewed before using getNew()')
    }
    if (this.toReview.length) {
      return this.toReview.splice(0, 1)[0]
    }
    throw new Error('Something wrong in your code motherfucker!')
  }

  /**
   * @param {object} requestDetails
   * @param {object} requestDetails.state
   * @param {object} requestDetails.request
   * @param {object} [requestDetails.reason] - reason if rejected
   */
  review (requestDetails) {
    this.reviewed.push(requestDetails)
  }

  reviewAgain (request, newDetails) {
    const oldItem = this.reviewed.find(item => item.request.id === request.id)
    oldItem.state = newDetails.state
    oldItem.request = newDetails.request
    oldItem.reason = newDetails.reason
    oldItem.tasksToAdd = newDetails.tasksToAdd
  }

  get done () {
    return !this.toReview.length || this.reviewed.length >= this.reviewPerTime
  }
}
