<template>
  <div class="request-list">
    <div class="request-list__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          v-model="filters.state"
          label="State"
        >
          <option
            v-for="(state, s) in Object.keys(KYC_REQUEST_STATES)"
            :key="`kyc-request-${s}`"
            :value="state"
          >
            {{ KYC_REQUEST_STATES[state].label }}
          </option>
        </select-field>

        <input-field
          class="app-list-filters__field"
          v-model.trim="filters.requestor"
          label="Requestor"
          autocomplete-type="email"
        />
      </div>
    </div>

    <div class="request-list__list-wrp">
      <template v-if="list && list.length">
        <div class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Email
            </span>
            <span class="app-list__cell app-list__cell--right">
              State
            </span>
            <span class="app-list__cell app-list__cell--right">
              Last updated
            </span>
          </div>
          <button
            class="app-list__li"
            v-for="item in list"
            :key="item.id"
            @click="showReqestDetails(item.requestor.id)"
          >
            <email-getter
              class="app-list__cell app-list__cell--important"
              :account-id="item.requestor.id"
              is-titled
            />
            <span class="app-list__cell app-list__cell--right">
              {{ item.state }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ formatDate(item.updatedAt) }}
            </span>
          </button>
        </div>
      </template>

      <template v-else>
        <div class="app-list">
          <template v-if="isLoading">
            <p class="app-list__li">
              <span class="app-list__cell app-list__cell--center">
                Loading...
              </span>
            </p>
          </template>
          <template v-else>
            <p class="app-list__li">
              <span class="app-list__cell app-list__cell--center">
                Nothing here yet
              </span>
            </p>
          </template>
        </div>
      </template>

      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="loadList"
          @first-page-load="setList"
          @next-page-load="extendList"
          ref="collectionLoaderBtn"
        />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'

import { EmailGetter } from '@comcom/getters'

import { formatDate } from '@/utils/formatters'
import { clearObject } from '@/utils/clearObject'

import { KYC_REQUEST_STATES } from '@/constants'

import { api } from '@/api'
import apiHelper from '@/apiHelper'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'
import { base } from '@tokend/js-sdk'

export default {
  name: 'kyc-recovery-request-list',
  components: {
    EmailGetter,
    SelectField,
    InputField,
    CollectionLoader,
  },

  data () {
    return {
      isLoading: false,
      list: [],
      filters: {
        state: 'pending',
        requestor: '',
        type: '',
        pendingTasks: '',
      },
      KYC_REQUEST_STATES,
    }
  },

  watch: {
    'filters.state' () { this.reloadCollectionLoader() },
    'filters.pendingTasks' () { this.reloadCollectionLoader() },
    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },

  methods: {
    async loadList () {
      this.isLoading = true
      let response = {}
      try {
        const requestor =
          await this.getRequestorAccountId(this.filters.requestor)
        response = await api.getWithSignature('/v3/kyc_recovery_requests', {
          page: { order: 'desc' },
          filter: clearObject({
            pending_tasks: this.filters.pendingTasks,
            state: KYC_REQUEST_STATES[this.filters.state].state,
            requestor: requestor,
          }),
          include: ['request_details.target_account'],
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
      return response
    },

    async getRequestorAccountId (requestor) {
      if (base.Keypair.isValidPublicKey(requestor)) {
        return requestor
      } else {
        try {
          const address = await apiHelper.users.getAccountIdByEmail(requestor)
          return address || requestor
        } catch (error) {
          return requestor
        }
      }
    },

    setList (data) {
      this.list = data
    },
    async extendList (data) {
      this.list = this.list.concat(data)
    },

    showReqestDetails (id) {
      if (id) {
        this.$router.push({
          name: 'kycRecoveryRequests.show',
          params: {
            id: id,
          },
        })
      }
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
    formatDate,
  },
}
</script>

<style scoped>
.request-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
