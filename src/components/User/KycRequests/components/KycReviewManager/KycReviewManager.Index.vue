<template>
  <div class="review-manager app__block">
    <review-item v-if="current"
                 :request="current"
                 @next="goForward"
    />
    <template v-else-if="!reviewed.length">
      <h3>No data to review</h3>
    </template>
    <template v-else>
      <h3 class="review-manager__title">Please confirm KYC actions</h3>
      <div class="review-manager__list app-list">
        <div class="review-manager__list-header app-list__header">
          <span class="app-list__cell">Email</span>
          <span class="app-list__cell app-list__cell--right">Review state</span>
          <span class="app-list__cell app-list__cell--right">Reject reason</span>
          <span class="app-list__cell app-list__cell--right">No-latin docs</span>
          <span class="app-list__cell app-list__cell--right"><!--Button--></span>
        </div>
        <div v-for="request in reviewed" class="app-list__li app-list__li--no-shadow">
          <email-getter class="app-list__cell app-list__cell--thin" :address="request.request.accountToUpdateKyc"/>
          <span class="app-list__cell app-list__cell--right app-list__cell--thin">{{ request.state }}</span>
          <span class="app-list__cell app-list__cell--right app-list__cell--thin">{{ request.reason || '–'}}</span>
          <span class="app-list__cell app-list__cell--right app-list__cell--thin">
            {{(request.tasksToAdd & REVIEW_TASKS.nonLatinDocs) !== 0 ? 'Yes' : '–'}}
          </span>
          <span class="app-list__cell app-list__cell--right app-list__cell--thin">
            <button class="review-manager__review-again-btn" @click="requestToRepeatReview = request.request">
              <mdi-pencil-icon/>Edit
            </button>
          </span>
        </div>
      </div>
      <div class="review-manager__actions">
        <button class="app__btn-secondary" @click="cancelReview">Cancel</button>
        <button class="app__btn" @click="submitTransaction" :disabled="isPending">Confirm</button>
      </div>
    </template>

    <modal v-if="requestToRepeatReview"
           @close-request="requestToRepeatReview = false">
      <review-item :request="requestToRepeatReview" @next="reviewAgain"/>
    </modal>

  </div>
</template>

<script>
  import { KycReviewHelper } from './ReviewHelper'
  import { EmailGetter } from '@comcom/getters'
  import ReviewItem from './KycReviewManager.Item'
  import Modal from '@comcom/modals/Modal'

  import api from '@/api'
  import 'mdi-vue/PencilIcon'

  import { REVIEW_TASKS } from '../../../../../constants'

  const REVIEW_PER_TIME = 10

  export default {
    components: { ReviewItem, EmailGetter, Modal },
    data: _ => ({
      current: null,
      requestToRepeatReview: null,
      reviewHelper: new KycReviewHelper(REVIEW_PER_TIME),
      isPending: false,
      REVIEW_TASKS
    }),
    async created () {
      await this.reviewHelper.init()
      this.current = this.reviewHelper.getNew()
    },
    computed: {
      reviewed () {
        return this.reviewHelper.reviewed
      }
    },
    methods: {
      goForward (reviewDetails) {
        this.reviewHelper.review(reviewDetails)
        if (this.reviewHelper.done) {
          this.current = null
          return
        }
        this.current = this.reviewHelper.getNew()
      },
      reviewAgain (newDetails) {
        this.reviewHelper.reviewAgain(this.requestToRepeatReview, newDetails)
        this.requestToRepeatReview = null
      },
      async submitTransaction () {
        if (!window.confirm('Please confirm this action')) return
        this.isPending = true
        try {
          await api.requests.reviewMultipleKycRequests(this.reviewHelper.reviewed)
          await this.reset()
        } catch (error) {
          console.error(error)
          error.showMessage()
        }
        this.isPending = false
      },
      async cancelReview () {
        if (!window.confirm('Please confirm this action')) return
        await this.reset()
      },
      async reset () {
        this.reviewHelper.clear()
        await this.reviewHelper.init()
        this.current = this.reviewHelper.getNew()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../../assets/scss/colors';

  .review-manager__list-header {
    margin-bottom: 2rem;
  }
  .review-manager__title {
    text-align: center;
    margin-bottom: 4rem;
  }
  .review-manager__review-again-btn {
    color: $color-active;
  }
  .review-manager__list {
    margin-bottom: 8rem;
  }
  .review-manager__actions {
    display: flex;
    justify-content: flex-end;
    padding-right: 2.4rem;
    button {
      max-width: 16rem;

      &:first-child {
        margin-left: .5rem;
      }
    }
  }

  .review-manager__review-again-btn {
    svg {
      height: 1.3rem;
      fill: $color-active;
      margin-right: .5rem;
      padding-top: .2rem;
      width: 1.3rem;
    }
  }
</style>
