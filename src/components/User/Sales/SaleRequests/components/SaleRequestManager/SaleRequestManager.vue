<template>
  <div class="sale-rm">
    <h2>Manage opportunity request</h2>

    <div class="app__block">
      <template v-if="request.isReady">
        <tabs>
          <tab name="Details">
            <details-tab :request="request" />
          </tab>

          <tab name="Full description">
            <description-tab :sale-request="request.sale" />
          </tab>

          <tab name="Corporate user">
            <syndicate-tab :sale-request="request.sale" />
          </tab>
        </tabs>

        <div
          class="sale-rm__actions app__form-actions"
          v-if="request.sale.requestStateI === REQUEST_STATES.pending"
        >
          <button
            class="app__btn"
            @click="approve"
            :disabled="isSubmitting"
          >
            Approve
          </button>
          <button
            class="app__btn app__btn--danger"
            :disabled="isSubmitting"
            @click="showRejectForm"
          >
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

    <modal
      v-if="rejectForm.isShown"
      @close-request="hideRejectForm"
      max-width="40rem"
    >
      <p class="text">Reject reason</p>

      <form
        class="sale-rm__reject-form"
        id="sale-reject-form"
        @submit.prevent="reject() & hideRejectForm()"
      >
        <div class="app__form-row">
          <text-field
            v-model="rejectForm.reason"
            :label="null"
          />
        </div>

        <div class="app__form-row">
          <tick-field
            v-model="rejectForm.isPermanentReject"
            label="Reject permanently"
          />
        </div>
      </form>

      <div class="sale-rm__reject-form-actions app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="sale-reject-form"
        >
          Reject
        </button>
        <button
          class="app__btn-secondary"
          @click="hideRejectForm"
        >
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
import cloneDeep from 'lodash/cloneDeep'
import { snakeToCamelCase } from '@/utils/un-camel-case'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { TokenRequest } from '@/api/responseHandlers/requests/TokenRequest'

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
      token: {},
      isSubmitting: false
    }
  },

  props: ['id'],
  computed: {
    getSaleDetails () {
      return this.request.sale.details[this.request.sale.details.requestType]
    }
  },
  created () {
    if (this.id) {
      this.getRequest(this.id)
    } else {
      throw new Error('SaleRequestManager: provide "id" or "sale"')
    }
  },

  methods: {
    async getRequest (id) {
      try {
        this.request.sale = await this.getSaleRequest(id)
        const token = await this.getToken()
        this.token = token
        this.request.token = token.operationDetails
        this.request.isReady = true
      } catch (error) {
        ErrorHandler.process(error)
        this.request.isFailed = true
      }
    },

    async getToken () {
      const response = await api.requests.getAssetRequests({})
      const token = response.data
          .map(response => new TokenRequest(response))
          .filter(response => {
            return response.code === this.getSaleDetails.baseAsset
          })
      return token[0]
    },

    async getSaleRequest (id) {
      const response = await api.requests.get(id)
      const sale = this.fixDetails(response)
      return sale
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
          await api.requests.approve(this.token._rawRequest, this.request.sale)
          this.$store.dispatch('SET_INFO', 'Opportunity request approved.')
          this.$router.push({ name: 'sales.requests' })
        } catch (error) {
          ErrorHandler.process(error)
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
          this.token._rawRequest,
          this.request.sale
        )
        this.$store.dispatch('SET_INFO', 'Opportunity request rejected successfully.')
        this.$router.push({ name: 'sales.requests' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isSubmitting = false
    },

    fixDetails (record) {
      const newRecord = cloneDeep(record)

      const valuableRequestDetailsKey = Object.keys(record.details)
        .find(item => !/request_type|requestType/gi.test(item))

      newRecord.details.requestType =
        snakeToCamelCase(record.details.requestType)
      newRecord.details[newRecord.details.requestType] =
        record.details[valuableRequestDetailsKey] || {}

      return newRecord
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
