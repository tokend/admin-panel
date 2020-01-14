<template>
  <div class="poll-list">
    <h2>
      {{ "poll-list.header" | globalize }}
    </h2>

    <div class="poll-list__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field poll-list__field"
          :label="'poll-list.lbl-state' | globalize"
          v-model="filters.state"
        >
          <option :value="POLL_STATES.open">
            {{ "poll-list.select-field-open" | globalize }}
          </option>
          <option :value="POLL_STATES.passed">
            {{ "poll-list.select-field-passed" | globalize }}
          </option>
          <option :value="POLL_STATES.failed">
            {{ "poll-list.select-field-failed" | globalize }}
          </option>
          <option :value="POLL_STATES.canceled">
            {{ "poll-list.select-field-cancelled" | globalize }}
          </option>
        </select-field>

        <input-date-field
          label="poll-list.lbl-min-start-time"
          class="poll-list__field"
          v-model="filters.minStartTime"
        />

        <input-date-field
          label="poll-list.lbl-min-end-time"
          class="poll-list__field"
          v-model="filters.maxEndTime"
        />

        <input-field
          class="app-list-filters__field poll-list__field"
          :label="'poll-list.owner' | globalize"
          :placeholder="'poll-list.placeholder-addres-or-email' | globalize"
          v-model="filters.owner"
          autocomplete-type="email"
        />
      </div>
    </div>

    <div class="poll-list__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell poll-list__id-cell">
              #
            </span>

            <span class="app-list__cell">
              {{ "poll-list.state" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "poll-list.owner" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "poll-list.question" | globalize }}
            </span>
          </div>

          <router-link
            class="app-list__li"
            v-for="item in list"
            :key="item.id"
            :to="{ name: 'polls.show', params: { id: item.id }}"
          >
            <span class="app-list__cell poll-list__id-cell">
              {{ item.id }}
            </span>

            <span class="app-list__cell">
              <template v-if="item.pollState.value === POLL_STATES.open">
                {{ "poll-list.template-open" | globalize }}
              </template>

              <template v-else-if="item.pollState.value === POLL_STATES.passed">
                {{ "poll-list.template-passed" | globalize }}
              </template>

              <template v-else-if="item.pollState.value === POLL_STATES.passed">
                {{ "poll-list.template-failed" | globalize }}
              </template>

              <!-- eslint-disable-next-line max-len -->
              <template v-else-if="item.pollState.value === POLL_STATES.canceled">
                {{ "poll-list.template-canceled" | globalize }}
              </template>
            </span>

            <span class="app-list__cell">
              <email-getter
                :account-id="item.owner.id"
                is-titled
              />
            </span>

            <span
              class="app-list__cell"
              :title="item.creatorDetails.question"
            >
              {{ item.creatorDetails.question }}
            </span>
          </router-link>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">
              {{ "poll-list.nothing-here-yet" | globalize }}
            </template>

            <template v-else>
              {{ "poll-list.loading" | globalize }}
            </template>
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
import {
  InputField,
  InputDateField,
  SelectField,
} from '@comcom/fields'

import { EmailGetter } from '@comcom/getters'
import { CollectionLoader } from '@/components/common'

import { api } from '@/api'
import apiHelper from '@/apiHelper'

import _throttle from 'lodash/throttle'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { clearObject } from '@/utils/clearObject'
import { POLL_STATES } from '@/constants/poll-states'

export default {
  components: {
    InputField,
    SelectField,
    EmailGetter,
    InputDateField,
    CollectionLoader,
  },

  data () {
    return {
      POLL_STATES,
      list: [],
      isLoaded: false,
      filters: {
        state: POLL_STATES.open,
        minStartTime: '',
        maxEndTime: '',
        owner: '',
      },
    }
  },

  watch: {
    'filters.state' () {
      this.reloadList()
    },

    'filters.owner' () {
      this.reloadListThrottled()
    },

    'filters.minStartTime' () {
      this.reloadListThrottled()
    },

    'filters.maxEndTime' () {
      this.reloadListThrottled()
    },
  },

  methods: {
    async getList () {
      let response = {}

      this.isLoaded = false
      try {
        response = await api.getWithSignature('/v3/polls', {
          filter: clearObject({
            owner: await apiHelper.users.getAccountIdBy(this.filters.owner),
            state: this.filters.state,
            min_start_time: this.filters.minStartTime,
            max_end_time: this.filters.maxEndTime,
          }),
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoaded = true

      return response
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

    reloadListThrottled: _throttle(function () {
      this.reloadList()
    }, 1000),
  },
}
</script>

<style scoped lang="scss">
$filter-margin: 2rem;

.poll-list__filters-wrp {
  margin-bottom: 4rem;
}

.poll-list__id-cell {
  max-width: 8rem;
}

.poll-list__field {
  min-width: calc(25% - 2rem);

  &:not(:first-of-type) {
    margin-left: 2rem;
  }
}
</style>
