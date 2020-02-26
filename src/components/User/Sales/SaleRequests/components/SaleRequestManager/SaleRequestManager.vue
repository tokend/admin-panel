<template>
  <div class="sale-rm">
    <h2>{{ "sale-request-manager.header" | globalize }}</h2>

    <div class="app__block">
      <template v-if="request.isReady">
        <tabs>
          <tab :name="'sale-request-manager.tab-details' | globalize">
            <details-tab :request="request" />
          </tab>

          <tab :name="'sale-request-manager.tab-full-description' | globalize">
            <description-tab :sale-request="request.sale" />
          </tab>

          <tab :name="'sale-request-manager.tab-corporate-user' | globalize">
            <syndicate-tab :sale-request="request.sale" />
          </tab>
        </tabs>

        <div
          class="sale-rm__actions app__form-actions"
          v-if="request.sale.stateI === REQUEST_STATES.pending.stateI"
        >
          <button
            class="app__btn"
            @click="approve"
            :disabled="isSubmitting"
          >
            {{ "sale-request-manager.btn-approve" | globalize }}
          </button>
          <button
            class="app__btn app__btn--danger"
            :disabled="isSubmitting"
            @click="showRejectForm"
          >
            {{ "sale-request-manager.btn-reject" | globalize }}
          </button>
        </div>
      </template>

      <template v-else>
        <p>
          <template v-if="request.isFailed">
            {{ "sale-request-manager.error" | globalize }}
          </template>
          <template v-else>
            {{ "sale-request-manager.loading" | globalize }}
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
        {{ "sale-request-manager.reject-reason" | globalize }}
      </p>

      <form
        class="sale-rm__reject-form"
        id="sale-reject-form"
        @submit.prevent="reject"
        novalidate
      >
        <div class="app__form-row">
          <text-field
            v-model="rejectForm.reason"
            :label="null"
            :disabled="formMixin.isDisabled"
            @blur="touchField('rejectForm.reason')"
            :error-message="getFieldErrorMessage(
              'rejectForm.reason',
              { maxLength: REJECT_REASON_MAX_LENGTH }
            )"
          />
        </div>

        <div class="app__form-row">
          <tick-field
            v-model="rejectForm.isPermanentReject"
            :label="'sale-request-manager.lbl-perm-rejected' | globalize"
          />
        </div>
      </form>

      <div class="sale-rm__reject-form-actions app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="sale-reject-form"
          :disabled="formMixin.isDisabled"
        >
          {{ "sale-request-manager.btn-reject" | globalize }}
        </button>
        <button
          class="app__btn-secondary"
          @click="hideRejectForm"
          :disabled="formMixin.isDisabled"
        >
          {{ "sale-request-manager.btn-cancel" | globalize }}
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import Modal from '@comcom/modals/Modal'
import { Tabs, Tab } from '@comcom/Tabs'
import { confirmAction } from '../../../../../../js/modals/confirmation_message'

import DetailsTab from './SaleRequestManager.DetailsTab'
import DescriptionTab from './SaleRequestManager.DescriptionTab'
import SyndicateTab from '../../../components/SaleManager/SaleManager.SyndicateTab'
import { globalize } from '@/components/App/filters/filters'
import { REQUEST_STATES } from '@/constants'

import cloneDeep from 'lodash/cloneDeep'
import { snakeToCamelCase } from '@/utils/un-camel-case'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { api } from '@/api'
import apiHelper from '@/apiHelper'
import { Bus } from '@/utils/bus'

const REJECT_REASON_MAX_LENGTH = 255

export default {
  components: {
    Tabs,
    Tab,
    Modal,
    DetailsTab,
    DescriptionTab,
    SyndicateTab,
  },
  mixins: [FormMixin],

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      request: {
        sale: {},
        asset: {},
        isReady: false,
        isFailed: false,
      },
      rejectForm: {
        reason: '',
        isShown: false,
        isPermanentReject: false,
      },
      isSubmitting: false,
      REQUEST_STATES,
      REJECT_REASON_MAX_LENGTH,
    }
  },

  validations () {
    return {
      rejectForm: {
        reason: {
          required,
          maxLength: maxLength(REJECT_REASON_MAX_LENGTH),
        },
      },
    }
  },

  computed: {
    getSaleDetails () {
      return this.request.sale.requestDetails
    },
  },

  created () {
    if (this.id) {
      this.getRequest(this.id)
    } else {
      throw new Error(globalize('sale-request-manager.error-get-request'))
    }
  },

  methods: {
    async getRequest (id) {
      try {
        this.request.sale = await this.getSaleRequest(id)
        const endpoint = `/v3/assets/${this.getSaleDetails.baseAsset.id}`
        const { data } = await api.getWithSignature(endpoint, {
          include: ['owner'],
        })
        this.request.asset = data
        this.request.isReady = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.request.isFailed = true
      }
    },

    async getSaleRequest (id) {
      const endpoint = `/v3/create_sale_requests/${id}`
      const { data } = await api.getWithSignature(endpoint, {
        include: ['request_details.quote_assets'],
      })
      const sale = this.fixDetails(data)
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
          await apiHelper.requests.approve(this.request.sale)
          Bus.success('sale-request-manager.sale-request-approved')
          this.$router.push({ name: 'sales.requests' })
        } catch (error) {
          ErrorHandler.process(error)
        }
      }
      this.isSubmitting = false
    },

    async reject () {
      if (!this.isFormValid()) return

      this.hideRejectForm()
      this.isSubmitting = true
      try {
        await apiHelper.requests.reject(
          {
            reason: this.rejectForm.reason,
            isPermanent: this.rejectForm.isPermanentReject,
          },
          this.request.sale
        )
        Bus.success('sale-request-manager.sale-request-rejected')
        this.$router.push({ name: 'sales.requests' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isSubmitting = false
    },

    fixDetails (record) {
      const newRecord = cloneDeep(record)
      newRecord.requestDetails.requestType =
        snakeToCamelCase(record.xdrType.name)

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
