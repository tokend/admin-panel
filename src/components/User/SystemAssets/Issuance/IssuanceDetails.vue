<template>
  <div class="issuance-details">
    <div class="issuance-details app__block">
      <h2>Issuance details</h2>
      <template v-if="isLoaded">
        <ul class="key-value-list">
          <li class="issuance-details__list-item">
            <span>ID</span>
            <span>{{ issuance.id }}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>Date</span>
            <span>{{ issuance.createdAt | dateTime }}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>Initiator</span>
            <span>{{requestorAccount.accountId}}</span>
          </li>
          <li v-if="requestorAccount.accountId !== this.$store.getters.masterId" class="issuance-details__list-item">
            <span>Initiator (Email)</span>
            <span><email-getter :address="issuance.requestor" is-titled/></span>
          </li>
          <li class="issuance-details__list-item">
            <span>Initiator account type</span>
            <span>{{requestorAccount.accountType | accountType}}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>Value</span>
            <span>{{localize(issuance.amount)}} {{issuance.asset}}</span>
          </li>
          <li class="issuance-details__list-item">
            <span>State</span>
            <span>{{issuance.requestState | localizeIssuanceRequestState}}</span>
          </li>
        </ul>
        <template v-if="issuance.requestStateI === REQUEST_STATES.pending">
          <div class="issuance-details__action-btns">
            <button class="app__btn issuance-details__action-btn"
                    @click="fulfill(issuance)"
                    :disabled="isSubmitting || issuance.requestStateI !== REQUEST_STATES.pending">
              Fulfill
            </button>

            <button class="app__btn app__btn--danger issuance-details__action-btn"
                    @click="selectForRejection(issuance)"
                    :disabled="isSubmitting || issuance.requestStateI !== REQUEST_STATES.pending">
              Reject
            </button>
          </div>
        </template>
      </template>
      <template v-else>
        <span class="issuance-details__list-item">Loading...</span>
      </template>
      <modal v-if="itemToReject"
             @close-request="clearRejectionSelection()"
             max-width="40rem">
        <form class="issuance-rl__reject-form" id="issuance-rl-reject-form"
              @submit.prevent="reject(itemToReject) && clearRejectionSelection()">
          <div class="app__form-row">
            <text-field label="Enter reject reason" v-model="rejectForm.reason"/>
          </div>
        </form>

        <div class="issuance-rl__reject-form-actions app__form-actions">
          <button class="app__btn app__btn--danger" form="issuance-rl-reject-form">
            Reject
          </button>
          <button class="app__btn-secondary" @click="clearRejectionSelection">
            Cancel
          </button>
        </div>
      </modal>
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  import { REQUEST_STATES } from '@/constants'
  import Modal from '@comcom/modals/Modal'

  import TextField from '@comcom/fields/TextField'
  import { EmailGetter } from '@comcom/getters'
  import localize from '@/utils/localize'
  import { confirmAction } from '../../../../js/modals/confirmation_message'

  export default {
    components: {
      EmailGetter,
      Modal,
      TextField
    },
    props: ['id'],
    data: _ => ({
      REQUEST_STATES,
      issuance: null,
      itemToReject: null,
      isRejectionModalShown: false,
      isSubmitting: false,
      requestorAccount: null,
      isLoaded: false,
      rejectForm: {
        reason: ''
      }
    }),
    methods: {
      localize,
      async getAccount (id) {
        try {
          const response = await api.accounts.get(id)
          this.requestorAccount = response.data
        } catch (error) {
          error.showMessage('Cannot load initiator account')
        }
      },
      async getIssuance (id) {
        try {
          this.issuance = await api.requests.get(id)
        } catch (error) {
          this.$store.dispatch('SET_ERROR', 'Cannot load issuance request list.')
        }
      },
      async fulfill (issuance) {
        this.isSubmitting = true
        if (await confirmAction()) {
          try {
            await api.requests.approve(issuance)
            await this.getIssuance(this.id)
            this.$store.dispatch('SET_INFO', 'Request fulfilled succesfully.')
          } catch (error) {
            error.showMessage()
          }
          this.isSubmitting = false
        } else {
          this.isSubmitting = false
        }
      },
      selectForRejection (item) {
        this.itemToReject = item
        this.rejectForm.reason = ''
      },
      async reject (item) {
        this.isSubmitting = true
        try {
          await api.requests.reject(
            { reason: this.rejectForm.reason, isPermanent: true },
            item
          )
          await this.getIssuance(this.id)
          this.$store.dispatch('SET_INFO', 'Request rejected succesfully.')
        } catch (error) {
          error.showMessage()
        }
        this.isSubmitting = false
      },
      clearRejectionSelection () {
        this.itemToReject = null
      }
    },
    async created () {
      await this.getIssuance(this.id)
      await this.getAccount(this.issuance.requestor)
      this.isLoaded = true
    }
  }
</script>

<style scoped>
  .issuance-details.app__block {
    max-width: 64rem;
  }

  .issuance-details__list-item {
    padding: 0.3rem 0.8rem;
    margin: 0 -0.8rem;
    display: flex;
    justify-content: space-between;
  }

  .issuance-details__action-btns {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-top: 4rem;
  }

  .issuance-details__action-btn {
    margin-right: 1rem;
    max-width: 15rem;
  }
</style>
