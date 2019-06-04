<template>
  <div class="limits-reviewer">
    <button
      class="limits-reviewer__back-btn"
      @click="back"
    >
      <span class="limits-reviewer__back-btn-inner">
        <i class="mdi mdi-chevron-left" />
      </span>
      Back
    </button>
    <template v-if="isLoaded && desiredLimitDetails">
      <div class="limits-reviewer__card">
        <h3 class="limits-reviewer__heading">
          Request information
        </h3>
        <div class="limits-reviewer__content-section">
          <detail
            label="Request date & time"
            :value="formatDateWithTime(request.createdAt)"
          />
          <detail
            label="Account role"
            :value="account.roleId | roleIdToString"
          />
          <detail
            label="Request type"
            :value="requestType"
          />
          <detail label="Account email">
            <email-getter :account-id="account.id" />
          </detail>
          <detail
            label="Account ID"
            :value="request.requestor"
          />
          <detail
            label="Note"
            :value="get(desiredLimitDetails, 'note')"
          />
          <detail
            label="Limits for asset"
            :value="get(desiredLimitDetails, 'asset')"
          />
          <detail
            label="Operation type limits"
            :value="get(desiredLimitDetails, 'operationType')"
          />
        </div>
        <div class="limits-reviewer__limits-wrapper">
          <div class="limits-review__limits-item">
            <h3 class="limits-reviewer__heading">
              Current limits
            </h3>
            <div class="limits-reviewer__content-section">
              <user-limits
                :limits="currentLimits"
                :key="1"
              />
            </div>
          </div>
          <div class="limits-review__limits-item">
            <h3 class="limits-reviewer__heading">
              Desired limits
            </h3>
            <div class="limits-reviewer__content-section">
              <user-limits
                :limits="desiredLimitDetails.limits"
                :key="2"
              />
            </div>
          </div>
        </div>
      </div>
      <template v-if="desiredLimitDetails.requestType === 'docsUploading'">
        <div class="limits-reviewer__uploaded-docs-list-wrapper">
          <h3 class="limits-reviewer__heading">
            Uploaded documents
          </h3>
          <uploaded-docs-list
            v-if="uploadedDocuments"
            :list="uploadedDocuments"
            :upload-date="request.updatedAt"
            :user-account-id="account.id"
          />
        </div>
        <user-details
          :id="request.requestor"
          :is-reviewing="false"
        />
      </template>
      <div class="app__form-actions limits-reviewer__btn-outer">
        <button
          class="app__btn"
          @click="approveRequest"
          :disabled="isPending"
        >
          Approve
        </button>
        <button
          class="app__btn"
          @click="isRequiringDocs = true"
          :disabled="isPending ||
            desiredLimitDetails.requestType === 'docsUploading' ||
            request.requestState === REQUEST_STATES.pending"
        >
          Request docs
        </button>
        <button
          class="app__btn-secondary"
          @click="showRejectModal"
          :disabled="isPending"
        >
          Reject
        </button>
      </div>
    </template>
    <template v-else>
      <template v-if="!isLoaded">
        <p>
          Loading...
        </p>
      </template>
      <template v-else>
        <h3>Something went wrong....</h3>
      </template>
    </template>
    <template v-if="isRequiringDocs">
      <div class="limits-reviewer__doc-list-form">
        <template v-for="(item,i) in uploadDocs">
          <div
            class="limits-reviewer__doc-list-item"
            :key="i"
          >
            <div class="limits-reviewer__doc-label">
              <datalist-field
                :doc-item="item"
                :key="i"
              />
            </div>
            <text-field
              label="Document description"
              class="limits-reviewer__doc-textfield"
              :autofocus="true"
              v-model="item.description"
            />
            <div class="limits-reviewer__doc-close-btn-wrapper">
              <button @click="removeDoc(i)">
                <i class="mdi mdi-close limits-reviewer__doc-close-btn" />
              </button>
            </div>
          </div>
        </template>
        <div class="app__form-actions limits-reviewer__doc-list-form-actions">
          <button
            class="app__btn"
            :disabled="isPending"
            @click="addMoreDoc"
          >
            Add more
          </button>
          <button
            class="app__btn"
            :disabled="isPending"
            @click="requireDocsRequest"
          >
            Submit
          </button>
        </div>
      </div>
    </template>
    <modal
      class="limits-reviewer__reject-modal"
      v-if="rejectForm.isShown"
      @close-request="hideRejectModal()"
      max-width="40rem"
    >
      <form
        class="limits-reviewer__reject-form"
        id="limits-reviewer__reject-form"
        @submit.prevent="rejectRequest"
        novalidate
      >
        <div class="app__form-row">
          <text-field
            label="Reject reason"
            class="limits-reviewer__reject-form-textfield"
            :autofocus="true"
            v-model="rejectForm.reason"
            @blur="touchField('rejectForm.reason')"
            :error-message="getFieldErrorMessage(
              'rejectForm.reason',
              { maxLength: REJECT_REASON_MAX_LENGTH }
            )"
          />
        </div>
      </form>
      <div class="app__form-actions limits-reviewer__reject-form-actions">
        <button
          class="app__btn"
          form="limits-reviewer__reject-form"
        >
          Reject
        </button>
        <button
          class="app__btn-secondary"
          @click="hideRejectModal"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { EmailGetter } from '@comcom/getters'
import Detail from '../../common/details/Detail.Row'
import Modal from '@comcom/modals/Modal'

import UserDetails from '../Users/components/UserDetails/UserDetails'
import UserLimits from './components/Limits.UserLimits'
import DatalistField from './components/Datalist'
import UploadedDocsList from './components/Limits.UploadedDocsList'

import { Sdk } from '@/sdk'
import api from '@/api'

import {
  REQUEST_STATES,
  DOCUMENT_TYPES_STR,
  LIMITS_REQUEST_STATES_STR,
} from '@/constants'
import { STATS_OPERATION_TYPES } from '@tokend/js-sdk'

import { snakeToCamelCase } from '@/utils/un-camel-case'
import { formatDateWithTime } from '../../../utils/formatters'

import get from 'lodash/get'
import isEqual from 'lodash/isEqual'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/state-bus'

const DEFAULT_LIMIT_STRUCT = {
  'id': 0,
  'accountId': null,
  'statsOpType': null,
  'assetCode': null,
  'isConvertNeeded': false,
  'dailyOut': '9223372036854.775807',
  'weeklyOut': '9223372036854.775807',
  'monthlyOut': '9223372036854.775807',
  'annualOut': '9223372036854.775807',
}

const OPERATION_TYPES = {
  payment: 'paymentOut',
  deposit: 'deposit',
  withdraw: 'withdraw',
}

const REJECT_REASON_MAX_LENGTH = 255

export default {
  components: {
    Detail,
    Modal,
    DatalistField,
    UserDetails,
    UserLimits,
    UploadedDocsList,
    EmailGetter,
  },
  mixins: [FormMixin],

  props: {
    id: { type: String, required: true },
  },

  data: _ => ({
    request: null,
    account: null,
    limits: null,
    isLoaded: false,
    isPending: false,
    isRequiringDocs: false,
    assetCode: null,
    desiredLimitDetails: null,
    REQUEST_STATES,
    DOCUMENT_TYPES_STR,
    LIMITS_REQUEST_STATES_STR,
    REJECT_REASON_MAX_LENGTH,
    uploadDocs: [
      {
        label: '',
        description: '',
      },
    ],
    rejectForm: {
      reason: '',
      isShown: false,
      isReset: false,
    },
  }),

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
    currentLimits () {
      if (!this.limits) return null
      const limits = this.limits
        .filter(limit => limit.assetCode === this.assetCode)
      const operationTypeLimits = limits
        .find(limit => {
          return limit.statsOpType === this.desiredLimitDetails.statsOpType
        })
      return operationTypeLimits || {
        ...DEFAULT_LIMIT_STRUCT,
        accountId: this.request.requestor,
        assetCode: this.assetCode,
        statsOpType: this.desiredLimitDetails.operationType,
      }
    },

    newLimit () {
      const requestDetails = this.desiredLimitDetails
      const operationType = OPERATION_TYPES[requestDetails.operationType]
      const limitsList = Object.entries(requestDetails.limits)
      const limits = {}
      for (let limit of limitsList) {
        limits[limit[0]] = limit[1] || DEFAULT_LIMIT_STRUCT[limit[0]]
      }
      return {
        ...DEFAULT_LIMIT_STRUCT,
        ...limits,
        accountId: this.request.requestor,
        assetCode: this.assetCode,
        statsOpType: STATS_OPERATION_TYPES[operationType],
      }
    },

    uploadedDocuments () {
      if (!this.desiredLimitDetails.documents) return
      return this.desiredLimitDetails.documents
    },

    requestType () {
      return LIMITS_REQUEST_STATES_STR[get(this.request, 'details.requestType')]
    },
  },

  async created () {
    try {
      await this.getRequest()
      const limitRequest = await api.requests.get(this.id)
      this.desiredLimitDetails = limitRequest
        .details[snakeToCamelCase(limitRequest.details.requestType)].details ||
        '{}'
    } catch (error) {
      ErrorHandler.process(error)
    }
  },

  methods: {
    get,
    formatDateWithTime,

    async getRequest () {
      this.$store.commit('OPEN_LOADER')
      const request = await api.requests.get(this.id)
      const camelCasedRequestType = snakeToCamelCase(
        request.details.requestType
      )
      const requestDetails = request.details[camelCasedRequestType].details
      const [account, limits] = await Promise.all([
        Sdk.horizon.account.get(request.requestor),
        Sdk.horizon.account.getLimits(request.requestor),
      ])
      this.request = request
      this.request.document = requestDetails.document
      this.request.asset = requestDetails.asset
      this.assetCode = requestDetails.asset
      this.account = account.data
      this.limits = (get(limits, 'data.limits') || [])
        .map(limit => limit.limit)
      this.isLoaded = true
      this.$store.commit('CLOSE_LOADER')
    },

    async approveRequest () {
      this.isPending = true
      try {
        const newLimits = []
        if (!isEqual(this.limits[0], this.newLimit)) {
          newLimits.push(this.newLimit)
        }
        if (!newLimits.length) {
          ErrorHandler.process('Please update user limits before approving request')
          this.isPending = false
          return
        }
        const oldLimits = this.limits
          .find(item => {
            const requestOpType = this.request.details.updateLimits
              .details.operationType
            const limitsOpType = OPERATION_TYPES[requestOpType]

            return item.assetCode === this.request.asset &&
              item.statsOpType === STATS_OPERATION_TYPES[limitsOpType]
          })

        await api.requests.approveLimitsUpdate({
          request: this.request,
          oldLimits: oldLimits,
          newLimits: newLimits,
          accountId: this.request.requestor,
        })

        this.$router.push({ name: 'limits.requests' })
        Bus.success('Request approved. Limits are changed')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async rejectRequest () {
      if (!this.isFormValid()) return

      this.hideRejectModal()
      this.isPending = true
      try {
        await api.requests.rejectLimitsUpdate({
          request: this.request,
          oldLimits: this.limits[0],
          newLimits: [this.newLimit],
          accountId: this.request.requestor,
          reason: this.rejectForm.reason,
          isPermanent: true,
        }, this.request)

        this.$router.push({ name: 'limits.requests' })
        Bus.success('Request rejected. Limits are not changed')
      } catch (error) {
        this.isPending = false
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async requireDocsRequest () {
      this.isPending = true
      try {
        const requireDocsDetails = JSON.stringify({
          docsToUpload: this.uploadDocs,
        })
        await api.requests.rejectLimitsUpdate({
          request: this.request,
          oldLimits: this.limits[0],
          newLimits: [this.newLimit],
          accountId: this.request.requestor,
          reason: requireDocsDetails,
          isPermanent: false,
        })
        Bus.success('Upload additional documents requested.')
        this.isRequiringDocs = false
      } catch (error) {
        this.isPending = false
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    showRejectModal (isReset = false) {
      if (typeof isReset !== 'boolean') {
        isReset = false
      }
      this.rejectForm.reason = ''
      this.rejectForm.isShown = true
      this.rejectForm.isReset = isReset
    },

    hideRejectModal () {
      this.rejectForm.isShown = false
    },

    addMoreDoc () {
      this.uploadDocs.push({
        label: '',
        description: '',
      })
    },

    removeDoc (doc) {
      if (this.uploadDocs.length === 1) {
        this.isRequiringDocs = false
        return
      }
      this.uploadDocs.splice(doc, 1)
    },

    back () {
      this.$router.push({ name: 'limits.requests' })
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";
.limits-reviewer__heading {
  margin-bottom: 2rem;
}

.limits-reviewer__content-section {
  margin-bottom: 3rem;
}

.limits-reviewer__limits-wrapper {
  display: flex;
  justify-content: space-between;
}

.limits-review__limits-item {
  width: 50%;
}

.limits-reviewer__btn-outer {
  display: flex;
  width: 32rem;
  margin-top: 2rem;
  &:first-child:not(:only-child) {
    margin-right: 1rem;
  }
}

.limits-reviewer__reject-form-textfield {
  margin-bottom: 2rem;
}
.limits-reviewer__doc-list-item {
  display: flex;
  margin-bottom: 3rem;
}

.limits-reviewer__doc-label {
  width: 50%;
}

.limits-reviewer__doc-list-form {
  margin-top: 3rem;
}

.limits-reviewer__doc-list-form-actions {
  width: 32rem;
}

.limits-reviewer__doc-list-form,
.limits-reviewer__card {
  background: $color-content-bg;
  border-radius: 2px;
  padding: 24px;
}

.limits-reviewer__uploaded-docs-list-wrapper {
  background: $color-content-bg;
  margin: 1rem auto;
  .limits-reviewer__heading {
    padding: 24px;
  }
}

.limits-reviewer__back-btn {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: bold;
}

.limits-reviewer__back-btn-inner {
  $dimension: 3.5rem;

  background: $color-content-bg;
  border-radius: 50%;
  box-shadow: 0 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  height: $dimension;
  margin-right: 10px;
  position: relative;
  transition: 0.2s;
  width: $dimension;

  &:hover {
    box-shadow: 0 2px 6.6px 0.6px rgba(170, 170, 170, 0.72);
  }

  i {
    position: absolute;
    font-size: 2.4rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.limits-reviewer__doc-close-btn {
  font-size: 2.4rem;
}
</style>
