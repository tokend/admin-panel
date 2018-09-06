<template>
  <div class="review-item">
    <section class="review-item__kyc-section">
      <kyc-general-section v-if="request.accountTypeToSet.string === USER_TYPES_STR.general"
                           :user="user" :blobId="request.kycData.blobId"/>

      <kyc-syndicate-section v-if="request.accountTypeToSet.string === USER_TYPES_STR.syndicate"
                             :user="user" :blobId="request.kycData.blobId"/>
    </section>

    <section class="review-item__tasks">
      <h3>Details</h3>
      <tick-field v-model="details.tasksToAdd"
                  :label="REVIEW_TASKS_VOCABULARY[REVIEW_TASKS.nonLatinDocs]"
                  :cb-value="REVIEW_TASKS.nonLatinDocs"
      />
    </section>

    <section class="review-item__actions" v-if="!noActions">
      <div class="review-item__buttons">
        <button class="app__btn app__btn--danger review-item__button"
                @click="rejectForm.isShown = true">Reject</button>
        <button class="app__btn review-item__button"
                @click="approve">Approve</button>
      </div>
    </section>

    <modal class="review-item__reject-modal"
           v-if="rejectForm.isShown"
           @close-request="rejectForm.isShown = false"
           max-width="40rem">
      <form class="review-item__reject-form"
            id="user-request-reject-form"
           @submit.prevent="reject()">
        <div class="app__form-row">
          <text-field label="Reject reason"
                      :autofocus="true"
                     v-model="rejectForm.reason"
          />
        </div>
      </form>

      <div class="app__form-actions review-item__reject-form-actions">
        <button class="app__btn app__btn--danger" form="user-request-reject-form">
          Reject
        </button>
        <button class="app__btn-secondary" @click="rejectForm.isShown = false">
          Cancel
        </button>
      </div>
    </modal>


  </div>
</template>

<script>
  import KycGeneralSection from '../../../Users/components/UserDetails/UserDetails.Kyc'
  import KycSyndicateSection from '../../../Sales/components/SaleManager/SaleManager.SyndicateTab'

  import Modal from '@comcom/modals/Modal'

  import { TextField, TickField } from '@comcom/fields'
  import {
    REVIEW_STATES,
    USER_TYPES_STR,
    REVIEW_TASKS_VOCABULARY,
    REVIEW_TASKS
  } from '../../../../../constants'

  export default {
    props: ['request', 'noActions'],
    components: {
      KycGeneralSection,
      KycSyndicateSection,
      TextField,
      TickField,
      Modal
    },
    data: _ => ({
      rejectForm: {
        isShown: false,
        reason: ''
      },
      details: {
        tasksToAdd: []
      },
      USER_TYPES_STR,
      REVIEW_TASKS_VOCABULARY,
      REVIEW_TASKS
    }),
    computed: {
      user () {
        return { id: this.request.accountToUpdateKyc }
      }
    },
    methods: {
      reject () {
        this.$emit('next', {
          request: this.request,
          state: REVIEW_STATES.rejected,
          reason: this.rejectForm.reason
        })
        this.rejectForm.isShown = false
        this.rejectForm.reason = ''
      },
      skip () {
        this.$emit('next', {
          request: this.request,
          state: REVIEW_STATES.skipped
        })
      },
      approve () {
        this.$emit('next', {
          request: this.request,
          state: REVIEW_STATES.approved,
          tasksToAdd: this.details.tasksToAdd.reduce((sum, task) => sum | task, 0)
        })
      }
    }
  }
</script>

<style scoped>
  .review-item__kyc-section {
    margin-bottom: 4rem;
  }
  .review-item__buttons {
    display: flex;
    justify-content: space-between;
  }

  .review-item__button {
    max-width: 8rem;
  }

  .review-item__tasks {
    margin-bottom: 2rem;
  }

  .review-item__reject-form {
    margin-bottom: 1.5rem;
  }
</style>
