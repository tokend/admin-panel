<template>
  <div class="limits-reviewer">
    <button class="users-show__back-btn" @click="back">
      <span class="users-show__back-btn-inner">
        <mdi-chevron-left-icon/>
      </span>
      Back
    </button>
    <template v-if="isLoaded && desiredLimitDetails">
      <div class="limits-reviewer__card">
        <h3 class="limits-reviewer__heading">Request information</h3>
        <div class="limits-reviewer__content-section">
          <detail label="Request date & time" :value="formatDateWithTime(request.createdAt)"/>
          <detail label="Account type" :value="ACCOUNT_TYPES_VERBOSE[account.accountTypeI]"/>
          <detail label="Request type" :value="LIMITS_REQUEST_STATES[get(desiredLimitDetails, 'requestType')]"/>
          <detail label="Account email" :value="user.email"/>
          <detail label="Account ID" :value="request.requestor"/>
          <detail label="Note" :value="get(desiredLimitDetails, 'note')"/>
          <detail label="Limits for asset" :value="get(desiredLimitDetails, 'asset')"/>
          <detail label="Operation type limits" :value="get(desiredLimitDetails, 'operationType')"/>
        </div>
        <div class="limits-reviewer__limits-wrapper">
          <div class="limits-review__limits-item">
            <h3 class="limits-reviewer__heading">Current limits</h3>
            <div class="limits-reviewer__content-section">
              <user-limits :limits="currentLimits" :key="1"/>
            </div>
          </div>
          <div class="limits-review__limits-item">
            <h3 class="limits-reviewer__heading">Desired limits</h3>
            <div class="limits-reviewer__content-section">
              <user-limits :limits="desiredLimitDetails.limits" :key="2"/>
            </div>
          </div>
        </div>
      </div>
      <template v-if="desiredLimitDetails.requestType === 'docsUploading'">
        <div class="limits-reviewer__uploaded-docs-list-wrapper">
          <h3 class="limits-reviewer__heading">Uploaded documents</h3>
          <uploaded-docs-list :list="uploadedDocuments"
                              :uploadDate="request.updatedAt"/>
        </div>
        <user-details :id="request.requestor" :isReviewing="false"/>
      </template>
      <div class="app__form-actions limits-reviewer__btn-outer">
        <button class="app__btn" @click="approveRequest" :disabled="isPending">Approve</button>
        <button class="app__btn"
                @click="isRequiringDocs = true"
                :disabled="isPending ||
                desiredLimitDetails.requestType === 'docsUploading' ||
                request.requestState === REQUEST_STATES.pending">
                Request docs</button>
        <button class="app__btn-secondary" @click="showRejectModal" :disabled="isPending">Reject</button>
      </div>
    </template>
    <template v-else>
      <template v-if="!loaded">
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
          <div class="limits-reviewer__doc-list-item" :key="i">
            <div class="limits-reviewer__doc-label">
              <datalist-field :docItem="item" :key="i"/>
            </div>
            <text-field label="Document description"
              class="limits-reviewer__doc-textfield"
              :autofocus="true"
              v-model="item.description"
            />
            <div class="limits-reviewer__doc-close-btn-wrapper">
              <button @click="removeDoc(i)">
                <mdi-close-icon/>
              </button>
            </div>
          </div>
        </template>
          <div class="app__form-actions limits-reviewer__doc-list-form-actions">
            <button class="app__btn"
                    :disabled="isPending"
                    @click="addMoreDoc">Add more</button>
            <button class="app__btn"
                    :disabled="isPending"
                    @click="requireDocsRequest">Submit</button>
          </div>
        </div>
    </template>
    <modal class="limits-reviewer__reject-modal"
      v-if="rejectForm.isShown"
      @close-request="hideRejectModal()"
      max-width="40rem">
      <form class="limits-reviewer__reject-form"
        id="limits-reviewer__reject-form"
        @submit.prevent="hideRejectModal() || rejectRequest()">
        <div class="app__form-row">
          <text-field label="Reject reason"
            class="limits-reviewer__reject-form-textfield"
            :autofocus="true"
            v-model="rejectForm.reason"
          />
        </div>
      </form>
      <div class="app__form-actions limits-reviewer__reject-form-actions">
        <button class="app__btn" form="limits-reviewer__reject-form">
          Reject
        </button>
        <button class="app__btn-secondary" @click="hideRejectModal">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
  import Detail from '../../common/details/Detail.Row'
  import UserDetails from '../Users/components/UserDetails/UserDetails'
  import UserLimits from './components/Limits.UserLimits'
  import DatalistField from './components/Datalist'
  import UploadedDocsList from './components/Limits.UploadedDocsList'

  import { UserDocLinkGetter } from '@comcom/getters'
  import { DateFormatter } from '@comcom/formatters'
  import { InputField, TextField } from '@comcom/fields'
  import Modal from '@comcom/modals/Modal'

  import { ACCOUNT_TYPES_VERBOSE,
    REQUEST_STATES,
    DOCUMENT_TYPES_STR,
    LIMITS_REQUEST_STATES
  } from '@/constants'
  import { formatDateWithTime } from '../../../utils/formatters'
  import api from '@/api'
  import get from 'lodash/get'
  import isEqual from 'lodash/isEqual'
  import 'mdi-vue/CloseIcon'
  import 'mdi-vue/ChevronLeftIcon'

  const DEFAULT_LIMIT_STRUCT = {
    'id': 0,
    'accountType': null,
    'accountId': null,
    'statsOpType': null,
    'assetCode': null,
    'isConvertNeeded': false,
    'dailyOut': '9223372036854.775807',
    'weeklyOut': '9223372036854.775807',
    'monthlyOut': '9223372036854.775807',
    'annualOut': '9223372036854.775807'
  }

  export default {
    components: {
      Detail,
      Modal,
      TextField,
      InputField,
      DatalistField,
      UserDetails,
      UserLimits,
      DateFormatter,
      UserDocLinkGetter,
      UploadedDocsList
    },
    props: ['id'],
    data: _ => ({
      request: null,
      user: null,
      account: null,
      limits: null,
      isLoaded: false,
      isPending: false,
      isRequiringDocs: false,
      assetCode: null,
      desiredLimitDetails: null,
      REQUEST_STATES,
      ACCOUNT_TYPES_VERBOSE,
      DOCUMENT_TYPES_STR,
      LIMITS_REQUEST_STATES,
      uploadDocs: [
        {
          label: '',
          description: ''
        }
      ],
      rejectForm: {
        reason: '',
        isShown: false,
        isReset: false
      }
    }),
    async created () {
      await this.getRequest()
      const limitRequest = await api.requests.get(this.id)
      this.desiredLimitDetails = limitRequest.details || '{}'
    },
    computed: {
      currentLimits () {
        if (!this.limits) return null
        const limits = this.limits.filter(limit => limit.assetCode === this.assetCode)
        const operationTypeLimits = limits.find(limit => limit.statsOpType === this.desiredLimitDetails.statsOpType)
        return operationTypeLimits || {
          ...DEFAULT_LIMIT_STRUCT,
          accountId: this.request.requestor,
          assetCode: this.assetCode,
          statsOpType: this.desiredLimitDetails.operationType
        }
      },
      newLimit () {
        return {
          ...DEFAULT_LIMIT_STRUCT,
          ...this.desiredLimitDetails.limits,
          accountId: this.request.requestor,
          assetCode: this.assetCode,
          statsOpType: this.desiredLimitDetails.statsOpType
        }
      },
      uploadedDocuments () {
        if (!this.desiredLimitDetails.documents) return
        return this.desiredLimitDetails.documents
      }
    },
    methods: {
      get,
      formatDateWithTime,
      async getRequest () {
        this.$store.commit('OPEN_LOADER')
        const request = await api.requests.get(this.id)
        const requestDetails = get(request, 'details', {})
        const [account, user, limits] = await Promise.all([
          api.accounts.get(request.requestor),
          api.users.get(request.requestor),
          api.accounts.getLimits(request.requestor)
        ])
        this.request = request
        this.request.document = requestDetails.document
        this.request.asset = requestDetails.asset
        this.assetCode = requestDetails.asset
        this.account = account.data
        this.user = user.data
        this.limits = (get(limits, 'data.limits') || []).map(limit => limit.limit)
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
            this.$store.dispatch('SET_ERROR', 'Please update user limits before approving request')
            this.isPending = false
            return
          }
          await api.requests.approveLimitsUpdate({
            request: this.request,
            oldLimits: this.limits.payment,
            newLimits: newLimits,
            accountId: this.request.requestor
          })
          this.$router.push({ name: 'limits.requests' })
          this.$store.dispatch('SET_INFO', 'Request approved. Limits are changed')
        } catch (e) {
          console.error(e)
          e.showMessage()
        }
        this.isPending = false
      },
      async rejectRequest () {
        this.isPending = true
        try {
          await api.requests.rejectLimitsUpdate({
            request: this.request,
            oldLimits: this.limits[0],
            newLimits: [this.limits[0]],
            accountId: this.request.requestor,
            reason: this.rejectForm.reason,
            isPermanent: true
          }, this.request)
          this.$router.push({ name: 'limits.requests' })
          this.$store.dispatch('SET_INFO', 'Request rejected. Limits are not changed')
        } catch (e) {
          this.isPending = false
          console.error(e)
          e.showMessage()
        }
        this.isPending = false
      },

      async requireDocsRequest () {
        this.isPending = true
        try {
          const requireDocsDetails = JSON.stringify({
            docsToUpload: this.uploadDocs
          })
          await api.requests.rejectLimitsUpdate({
            request: this.request,
            oldLimits: this.limits[0],
            newLimits: [this.limits[0]],
            accountId: this.request.requestor,
            reason: requireDocsDetails,
            isPermanent: false
          }, this.request)
          this.$store.dispatch('SET_INFO', 'Upload additional documents requested.')
          this.isRequiringDocs = false
        } catch (e) {
          this.isPending = false
          console.error(e)
          e.showMessage()
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
          description: ''
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
      }
    }
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

  .users-show__back-btn {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.users-show__back-btn-inner {
  $dimension: 3.5rem;

  background: $color-content-bg;
  border-radius: 50%;
  box-shadow: 0 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  height: $dimension;
  margin-right: 10px;
  position: relative;
  transition: .2s;
  width: $dimension;

  &:hover {
    box-shadow: 0 2px 6.6px 0.6px rgba(170, 170, 170, 0.72);
  }

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

</style>
