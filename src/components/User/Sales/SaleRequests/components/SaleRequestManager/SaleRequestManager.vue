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
          <template v-if="request.isFailedLoadAsset || request.isFailedLoadSale">
            <template v-if="request.isFailedLoadAsset">
              Please сonfirm token creation request: {{ getSaleDetails.baseAsset }}
            </template>
            <template v-else>An error occurred</template>
          </template>
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
import { Sdk } from '@/sdk'
import api from '@/api'
import TextField from '@comcom/fields/TextField'
import TickField from '@comcom/fields/TickField'
import Modal from '@comcom/modals/Modal'
import { REQUEST_STATES, ASSET_PAIR_POLICIES } from '@/constants'
import DetailsTab from './SaleRequestManager.DetailsTab'
import DescriptionTab from './SaleRequestManager.DescriptionTab'
import { confirmAction } from '../../../../../../js/modals/confirmation_message'
import SyndicateTab from '../../../components/SaleManager/SaleManager.SyndicateTab'
import { Tabs, Tab } from '@comcom/Tabs'
import cloneDeep from 'lodash/cloneDeep'
import { snakeToCamelCase } from '@/utils/un-camel-case'
import { ErrorHandler } from '@/utils/ErrorHandler'

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
        isFailedLoadAsset: false,
        isFailedLoadSale: false
      },
      rejectForm: {
        reason: '',
        isShown: false,
        isPermanentReject: false
      },
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
      } catch (error) {
        ErrorHandler.process(error)
        this.request.isFailedLoadSale = true
      }
      try {
        if (this.request.isFailedLoadSale) return
        const response = await Sdk.horizon.assets
          .get(this.getSaleDetails.baseAsset)
        this.request.token = response.data
        this.request.isReady = true
      } catch (error) {
        ErrorHandler.process(error)
        this.request.isFailedLoadAsset = true
      }
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
          await api.requests.approve(this.request.sale)
          await this.makePairTradeable()
          this.$store.dispatch('SET_INFO', 'Fund request approved.')
          this.$router.push({ name: 'sales.requests' })
        } catch (error) {
          ErrorHandler.process(error)
        }
      }
      this.isSubmitting = false
    },

    async makePairTradeable () {
      const response = await Sdk.horizon.assetPairs.getAll()
      const pairs = response.data
        .filter(item => item.base === this.request.token.code)

      pairs.forEach(async item => {
        item.policies = [ASSET_PAIR_POLICIES.tradeableSecondaryMarket]
          .reduce((sum, policy) => sum | policy, 0)

        await api.assets.updatePair({ ...item, updatePolicy: true })
      })
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
