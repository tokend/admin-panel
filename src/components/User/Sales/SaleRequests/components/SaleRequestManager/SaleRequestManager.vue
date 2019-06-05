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
          <!-- eslint-disable-next-line max-len -->
          <template v-if="request.isFailedLoadAsset || request.isFailedLoadSale">
            <template v-if="request.isFailedLoadAsset">
              Please сonfirm token creation request:
              {{ getSaleDetails.baseAsset }}
            </template>
            <template v-else>
              An error occurred
            </template>
          </template>
          <template v-else>
            Loading...
          </template>
        </p>
      </template>
    </div>

    <modal
      v-if="rejectForm.isShown"
      @close-request="hideRejectForm"
      max-width="40rem"
    >
      <p class="text">
        Reject reason
      </p>

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
import TextField from '@comcom/fields/TextField'
import TickField from '@comcom/fields/TickField'

import Modal from '@comcom/modals/Modal'
import { Tabs, Tab } from '@comcom/Tabs'
import { confirmAction } from '../../../../../../js/modals/confirmation_message'

import DetailsTab from './SaleRequestManager.DetailsTab'
import DescriptionTab from './SaleRequestManager.DescriptionTab'
import SyndicateTab from '../../../components/SaleManager/SaleManager.SyndicateTab'

import api from '@/api'

import cloneDeep from 'lodash/cloneDeep'
import { snakeToCamelCase } from '@/utils/un-camel-case'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { AssetRequest } from '@/api/responseHandlers/requests/AssetRequest'
import { ASSET_PAIR_POLICIES, REQUEST_STATES } from '@/constants'
import { ApiCallerFactory } from '@/api-caller-factory'

export default {
  components: {
    Tabs,
    Tab,
    TextField,
    TickField,
    Modal,
    DetailsTab,
    DescriptionTab,
    SyndicateTab,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      REQUEST_STATES,
      request: {
        sale: {},
        asset: {},
        isReady: false,
        isFailedLoadAsset: false,
        isFailedLoadSale: false,
      },
      rejectForm: {
        reason: '',
        isShown: false,
        isPermanentReject: false,
      },
      asset: {},
      ASSET_PAIR_POLICIES,
      isSubmitting: false,
    }
  },

  computed: {
    getSaleDetails () {
      return this.request.sale.details[this.request.sale.details.requestType]
    },
  },

  created () {
    if (this.id) {
      this.getRequest(this.id)
    } else {
      throw new Error('SaleRequestManager: provide "id" or "sale"')
    }
    this.makePairTradeable()
  },

  methods: {
    async getRequest (id) {
      try {
        this.request.sale = await this.getSaleRequest(id)
        const asset = await this.getAsset()
        this.asset = asset
        this.request.asset = asset
        this.request.isReady = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.request.isFailedLoadAsset = true
      }
    },

    async getAsset () {
      const response = await api.requests.getAssetRequests({})
      const asset = response.data
        .map(response => new AssetRequest(response))
        .filter(response => {
          return response.code === this.getSaleDetails.baseAsset
        })
      return asset[0]
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
          await api.requests.approve(this.asset._rawRequest, this.request.sale)
          await this.makePairTradeable()
          this.$store.dispatch('SET_INFO', 'Opportunity request approved.')
          this.$router.push({ name: 'sales.requests' })
        } catch (error) {
          ErrorHandler.process(error)
        }
      }
      this.isSubmitting = false
    },

    async makePairTradeable () {
      try {
        const { data: pairs } = await ApiCallerFactory
          .createCallerInstance()
          .get('/v3/asset_pairs', {
            filter: { base_asset: this.request.token.code },
          })

        pairs.forEach(async item => {
          item.policies.value |= ASSET_PAIR_POLICIES.tradeableSecondaryMarket

          await api.assets.updatePair({
            base: item.baseAsset.id,
            quote: item.quoteAsset.id,
            policies: Number(item.policies.value),
            physicalPrice: String(item.price),
            updatePolicy: true,
            // `0` because of xdr-operation requires for it
            physicalPriceCorrection: '0',
            maxPriceStep: '0',
          })
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async reject () {
      this.isSubmitting = true
      try {
        await api.requests.reject(
          {
            reason: this.rejectForm.reason,
            isPermanent: this.rejectForm.isPermanentReject,
          },
          this.asset._rawRequest,
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
    },
  },
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
