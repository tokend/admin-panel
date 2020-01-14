<template>
  <div class="collected-fees-withdrawals">
    <h2>
      {{ "collected-fees-withdrawals.header" | globalize }}
    </h2>

    <div class="collected-fees-withdrawals__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          label="collected-fees-withdrawals.lbl-state"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending">
            {{
              "collected-fees-withdrawals.pending"
                | globalize
            }}
          </option>
          <option :value="REQUEST_STATES.cancelled">
            {{
              "collected-fees-withdrawals.canceled"
                | globalize
            }}
          </option>
          <option :value="REQUEST_STATES.approved">
            {{
              "collected-fees-withdrawals.approved"
                | globalize
            }}
          </option>
          <option :value="REQUEST_STATES.rejected">
            {{
              "collected-fees-withdrawals.rejected"
                | globalize
            }}
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected">
            {{
              "collected-fees-withdrawals.perm-rejected"
                | globalize
            }}
          </option>
        </select-field>
        <!-- eslint-disable -->
        <input-field
          class="app-list-filters__field"
          :label="'collected-fees-withdrawals.lbl-pending-tasks' | globalize"
          :placeholder="'collected-fees-withdraw.placeholder-bitmask-exact-match' | globalize"
          v-model="filters.pendingTasks"
        />
        <!-- eslint-enable -->
      </div>
    </div>

    <div class="withdrawal-list__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              {{ "collected-fees-withdrawals.created-ad" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "collected-fees-withdrawals.status" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "collected-fees-withdrawals.amount" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "collected-fees-withdrawals.tasks" | globalize }}
            </span>
          </div>

          <button
            class="app-list__li"
            v-for="item in list"
            :key="item.id"
            @click="itemToShow = item"
          >
            <date-formatter
              class="app-list__cell"
              :date="item.createdAt"
              format="DD MMM YYYY HH:mm:ss"
            />

            <span
              class="app-list__cell app-list__cell--right"
              :title="verbozify(item.state)"
            >
              {{ verbozify(item.state) }}
            </span>

            <asset-amount-formatter
              class="app-list__cell app-list__cell--right"
              is-titled
              :amount="item.requestDetails.amount"
            />

            <span class="app-list__cell app-list__cell--right">
              {{ item.allTasks }}
            </span>
          </button>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isListLoading">
              <p>
                {{ "collected-fees-withdrawals.loading" | globalize }}
              </p>
            </template>

            <template v-else-if="isListFailed">
              <p class="danger">
                {{
                  "collected-fees-withdrawals.error" | globalize
                }}
              </p>
            </template>

            <template v-else>
              <p>
                {{ "collected-fees-withdrawals.fail-load" | globalize }}
              </p>
            </template>
          </li>
        </ul>
      </template>

      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="getList"
          @first-page-load="setList"
          @next-page-load="extendList"
          ref="collectionLoaderBtn"
        />
      </div>
    </div>

    <modal
      v-if="itemToShow && itemToShow.id"
      @close-request="itemToShow = null"
      max-width="64rem"
    >
      <!-- eslint-disable-next-line max-len -->
      <h2>{{ "collected-fees-withdrawals.withdrawal-request-details" | globalize }}</h2>
      <details-reader :details="itemToShow" />
    </modal>
  </div>
</template>

<script>
import Vue from 'vue'

import { REQUEST_STATES } from '@/constants'

import { SelectField, InputField } from '@comcom/fields'
import Modal from '@comcom/modals/Modal'
import { CollectionLoader } from '@comcom'
import { AssetAmountFormatter, DateFormatter } from '@comcom/formatters'
import DetailsReader from '@comcom/details/DetailsReader'

import { verbozify } from '@/utils/verbozify'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { clearObject } from '@/utils/clearObject'

import { api } from '@/api'
import _throttle from 'lodash/throttle'

export default {
  components: {
    InputField,
    SelectField,
    CollectionLoader,
    AssetAmountFormatter,
    DateFormatter,
    Modal,
    DetailsReader,
  },

  data () {
    return {
      REQUEST_STATES,

      filters: {
        state: REQUEST_STATES.pending,
        pendingTasks: '',
        // TODO: add asset when https://tokend.atlassian.net/browse/TDV-890
        // merged
      },
      list: [],
      isListLoading: false,
      isListFailed: false,
      itemToShow: {},
    }
  },

  watch: {
    'filters.state' () {
      this.reloadWithdrawalsThrottled()
    },
    'filters.pendingTasks' () {
      this.reloadWithdrawalsThrottled()
    },
  },

  methods: {
    verbozify,

    async getList () {
      this.isListLoading = true
      let response = {}
      try {
        response = await api.getWithSignature(`/v3/create_withdraw_requests`, {
          filter: clearObject({
            requestor: Vue.params.MASTER_ACCOUNT,
            state: this.filters.state,
            pending_tasks: /^\d+$/.test(this.filters.pendingTasks)
              ? this.filters.pendingTasks
              : null,
          }),
          include: ['request_details', 'request_details.balance'],
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isListFailed = true
        this.list = []
      }
      this.isListLoading = false
      return response
    },

    setList (data) {
      this.list = data
    },

    extendList (data) {
      this.list = this.list.concat(data)
    },

    reloadWithdrawalsThrottled: _throttle(function () {
      this.isListLoading = true
      this.$refs.collectionLoaderBtn.loadFirstPage()
    }, 1200),
  },
}
</script>

<style scoped>
.collected-fees-withdrawals__filters-wrp {
  margin-bottom: 4rem;
}
</style>
