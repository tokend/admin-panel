<template>
  <div class="sale-rm">
    <h2>Manage fund request</h2>

    <div class="app__block">
      <template v-if="request.isReady">
        <tabs>
          <tab name="Details">
            <details-tab :request="request" />
          </tab>

          <tab name="Full description">
            <description-tab :sale-request="request.sale" />
          </tab>

          <tab name="Syndicate user">
            <syndicate-tab :sale-request="request.sale" />
          </tab>
        </tabs>

        <div class="sale-rm__actions app__form-actions"
          v-if="request.sale.requestStateI === REQUEST_STATES.pending">
          <button class="app__btn" @click="approve" :disabled="isSubmitting">
            Approve
          </button>
          <button class="app__btn app__btn--danger" :disabled="isSubmitting"
            @click="showRejectForm">
            Reject
          </button>
        </div>
      </template>

      <template v-else>
        <p>
          <template v-if="request.isFailed">An error occurred</template>
          <template v-else>Loading...</template>
        </p>
      </template>
    </div>

    <modal v-if="rejectForm.isShown" @close-request="hideRejectForm" max-width="40rem">
      <p class="text">Reject reason</p>

      <form class="sale-rm__reject-form" id="sale-reject-form"
        @submit.prevent="reject() & hideRejectForm()">
        <div class="app__form-row">
          <text-field v-model="rejectForm.reason" :label="null"/>
        </div>

        <div class="app__form-row">
          <tick-field v-model="rejectForm.isPermanentReject" label="Reject permanently" />
        </div>
      </form>

      <div class="sale-rm__reject-form-actions app__form-actions">
        <button class="app__btn app__btn--danger" form="sale-reject-form">
          Reject
        </button>
        <button class="app__btn-secondary" @click="hideRejectForm">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import api from '@/api'
import TextField from '@comcom/fields/TextField'
import TickField from '@comcom/fields/TickField'
import Modal from '@comcom/modals/Modal'
import { REQUEST_STATES } from '@/constants'
import DetailsTab from './SaleRequestManager.DetailsTab'
import DescriptionTab from './SaleRequestManager.DescriptionTab'
import { confirmAction } from '../../../../../../js/modals/confirmation_message'
import SyndicateTab from '../../../components/SaleManager/SaleManager.SyndicateTab'
import { Tabs, Tab } from '@comcom/Tabs'

export default {
  components: {
    Tabs,
    Tab,
    TextField,
    TickField,
    Modal,
    DetailsTab,
    DescriptionTab,
    SyndicateTab
  },

  data () {
    return {
      REQUEST_STATES,
      request: {
        sale: {},
        token: {},
        isReady: false,
        isFailed: false
      },
      rejectForm: {
        reason: '',
        isShown: false,
        isPermanentReject: false
      },
      isSubmitting: false
    }
  },

  props: ['id', 'sale'],

  created () {
    if (this.sale) {
      // TODO: check source/purpose of this code, delete if sure it wont break app
      this.assignRequest(this.sale)
    } else if (this.id) {
      this.getRequest(this.id)
    } else {
      throw new Error('SaleRequestManager: provide "id" or "sale"')
    }
  },

  methods: {
    async assignRequest (request) {
      try {
        this.request.sale = request
        this.request.token = await this.getTokenRequest(this.request.sale.baseAsset)
        this.request.isReady = true
      } catch (error) {
        error.showMessage('Cannot get fund request. Pleazse try again later')
        this.request.isFailed = true
      }
    },

    async getRequest (id) {
      try {
        this.request.sale = await this.getSaleRequest(id)
        this.request.token = await this.getToken(this.request.sale.baseAsset)
        this.request.isReady = true
      } catch (error) {
        error.showMessage('Cannot get fund request. Please try again later')
        this.request.isFailed = true
      }
    },

    getSaleRequest (id) {
      return api.requests.get(id)
    },

    getTokenRequest (sale) {
      return api.requests.getAssetRequest({
        code: sale.baseAsset,
        requestor: sale.requestor,
        state: sale.requestStateI
      })
    },

    async getToken (sale) {
      const response = (await api.assets.get(sale)).data
      return response
    },

    async getSaleDescription (userId, blobId) {
      return (await api.users.getBlob({ userId, blobId })).data.value
    },

    showRejectForm () {
      this.rejectForm.isShown = true
    },

    hideRejectForm () {
      this.rejectForm.isShown = false
    },

    async approve () {
      this.isSubmitting = true
      if (await confirmAction()) {
        try {
          await api.requests.approve(this.request.sale)
          this.$store.dispatch('SET_INFO', 'Fund request approved.')
          this.$router.push({ name: 'sales.requests' })
        } catch (error) {
          console.error(error)
          error.showMessage()
        }
      }
      this.isSubmitting = false
    },

    async reject () {
      this.isSubmitting = true
      try {
        await api.requests.reject(
          {
            reason: this.rejectForm.reason,
            isPermanent: this.rejectForm.isPermanentReject
          },
          this.request.sale
        )
        this.$store.dispatch('SET_INFO', 'Fund request rejected successfully.')
        this.$router.push({ name: 'sales.requests' })
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isSubmitting = false
    }
  }
}
</script>

<style scoped lang="scss">
.sale-rm__actions.app__form-actions {
  margin-top: 4rem;
  max-width: 30rem;
}

.sale-rm__reject-form {
  margin-bottom: 2rem;
}
</style>
