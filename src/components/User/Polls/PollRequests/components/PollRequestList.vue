<template>
  <div class="poll-request-list">
    <div class="poll-request-list__filters-wrp">
      <select-field
        class="poll-request-list__filter"
        v-model="filters.state"
        :label="'poll-request-list.lbl-state' | globalize"
      >
        <option :value="REQUEST_STATES.pending.stateI">
          {{ "poll-request-list.pending" | globalize }}
        </option>
        <option :value="REQUEST_STATES.cancelled.stateI">
          {{ "poll-request-list.canceled" | globalize }}
        </option>
        <option :value="REQUEST_STATES.approved.stateI">
          {{ "poll-request-list.approved" | globalize }}
        </option>
        <option :value="REQUEST_STATES.permanentlyRejected.stateI">
          {{ "poll-request-list.permanently-rejected" | globalize }}
        </option>
      </select-field>

      <input-field
        class="poll-request-list__filter"
        v-model="filters.requestor"
        :label="'poll-request-list.lbl-requestor' | globalize"
        autocomplete-type="email"
      />
    </div>

    <div class="poll-request-list__table-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell poll-request-list__id-cell">
              #
            </span>

            <span class="app-list__cell">
              {{ "poll-request-list.created-at" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "poll-request-list.requestor" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "poll-request-list.question" | globalize }}
            </span>
          </div>

          <router-link
            class="app-list__li"
            v-for="(item, i) in list"
            :key="i"
            :to="{ name: 'polls.requests.show', params: { id: item.id }}"
          >
            <span
              class="app-list__cell poll-request-list__id-cell"
              :title="item.id"
            >
              {{ item.id }}
            </span>
            <span class="app-list__cell">
              {{ item.requestDetails.startTime | formatDate }}
            </span>
            <span
              class="app-list__cell"
              :title="item.requestor.id"
            >
              <email-getter :account-id="item.requestor.id" />
            </span>

            <span
              class="app-list__cell"
              :title="item.requestDetails.creatorDetails.question"
            >
              {{ item.requestDetails.creatorDetails.question }}
            </span>
          </router-link>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like" v-if="isLoadingList">
            {{ "poll-request-list.loading" | globalize }}
          </li>
          <li class="app-list__li-like" v-else>
            {{ "poll-request-list.nothing-here-yet" | globalize }}
          </li>
        </ul>
      </template>

      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="getList"
          @first-page-load="setList"
          @next-page-load="concatList"
          ref="collectionLoaderBtn"
        />
      </div>
    </div>
  </div>
</template>

<script>
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'
import { EmailGetter } from '@comcom/getters'

import { CollectionLoader } from '@/components/common'

import { api } from '@/api'
import apiHelper from '@/apiHelper'
import { base } from '@tokend/js-sdk'

import { REQUEST_STATES } from '@/constants'

import _ from 'lodash'
import { clearObject } from '@/utils/clearObject'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    InputField,
    SelectField,
    EmailGetter,
    CollectionLoader,
  },

  data () {
    return {
      list: [],
      isLoadingList: false,
      filters: {
        state: REQUEST_STATES.pending.stateI,
        requestor: '',
      },
      REQUEST_STATES,
    }
  },

  watch: {
    'filters.state' () { this.reloadList() },

    'filters.requestor': _.throttle(function () {
      this.reloadList()
    }, 1000),
  },

  methods: {
    async getList () {
      this.isLoadingList = true

      let response = {}
      try {
        const requestor = await this.getRequestorAccountId(
          this.filters.requestor
        )

        response = await api.getWithSignature('/v3/create_poll_requests', {
          filter: clearObject({
            state: this.filters.state,
            requestor: requestor,
          }),
          include: ['request_details'],
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }

      this.isLoadingList = false
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

    concatList (data) {
      this.list = this.list.concat(data)
    },

    reloadList () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors';

.poll-request-list__filters-wrp {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  padding: 2rem 2.5rem 2.5rem;
  margin-bottom: 4rem;
  display: flex;
  justify-content: space-between;
}

.poll-request-list__filter {
  flex: 1;
  & + & {
    margin-left: 2rem;
  }
}

.poll-request-list__id-cell {
  max-width: 8rem;
}
</style>
