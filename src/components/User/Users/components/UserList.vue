<template>
  <div class="user-list">

    <template  v-if="view.mode === VIEW_MODES_VERBOSE.index">
      <div class="user-list__filters-wrp">
        <div class="app-list-filters">
          <input-field class="app-list-filters__field" v-model.trim="filters.email" label="Email" />

          <input-field class="app-list-filters__field" v-model.trim="filters.address" label="Account ID" />
        </div>
      </div>

      <div class="user-list__list-wrp">
        <div class="app-list">
          <template v-if="list.data && list.data.length">
            <div class="app-list__header">
            <span class="app-list__cell user-list__email-cell">
              <!-- empty -->
            </span>

              <span class="app-list__cell app-list__cell--right">
              Account ID
            </span>
            </div>

            <button class="app-list__li" v-for="item in list.data" :key="item.id" @click="toggleViewMode(item.id)">
            <span class="app-list__cell app-list__cell--important user-list__email-cell" :title="item.email">
              {{item.email}}
            </span>

            <span class="app-list__cell app-list__cell--right" :title="item.id">
              {{item.id}}
            </span>
            </button>
          </template>

          <template v-else>
            <div class="app-list__li-like">
              <template v-if="isLoading">
                <p>
                  Loading...
                </p>
              </template>

              <template v-else>
                <p>
                  Nothing here yet
                </p>
              </template>
            </div>
          </template>
        </div>

        <div class="app__more-btn-wrp">
          <button class="app__btn-secondary"
                  v-if="!isListEnded && list.data"
                  @click="onMoreClick" >
            More
          </button>
        </div>
      </div>
    </template>

    <user-view
      v-if="view.mode === VIEW_MODES_VERBOSE.user"
      :id="view.userId"
      @back="toggleViewMode(null)"
    />

  </div>
</template>

<script>
import Vue from 'vue'
import api from '@/api'
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import UserView from '../Users.Show'
import {
  USER_STATES,
  USER_STATES_STR,
  USER_TYPES,
  USER_TYPES_STR
} from '@/constants'
import _ from 'lodash'
import { createTxtFile } from '@/utils/file_writer'
import 'mdi-vue/DownloadIcon'

const WHOLE_GROUP = 'all'
const USER_STATES_VERBOSE = Object.freeze({
  [USER_STATES_STR.nil]: 'Not verified',
  [USER_STATES_STR.waitingForApproval]: 'Waiting for review',
  [USER_STATES_STR.approved]: 'Approved',
  [USER_STATES_STR.rejected]: 'Rejected'
})
const USER_TYPES_VERBOSE = Object.freeze({
  [USER_TYPES_STR.notVerified]: 'Not verified',
  [USER_TYPES_STR.general]: 'General',
  [USER_TYPES_STR.syndicate]: 'Syndicate'
})
const VIEW_MODES_VERBOSE = Object.freeze({
  index: 'index',
  user: 'user'
})
export default {
  components: {
    SelectField,
    InputField,
    UserView
  },

  data () {
    return {
      WHOLE_GROUP,
      USER_STATES_VERBOSE,
      USER_TYPES_VERBOSE,
      VIEW_MODES_VERBOSE,
      filters: {
        email: '',
        address: ''
      },
      view: {
        mode: VIEW_MODES_VERBOSE.index,
        userId: null,
        scrollPosition: 0
      },
      list: {},
      isListEnded: false,
      isLoading: false,

      txtURL: '',
      USER_STATES,
      USER_TYPES
    }
  },

  created () {
    this.getList()
  },

  methods: {
    async getList () {
      this.txtURL = ''
      this.isLoading = true
      try {
        const filters = this.collectFilters()
        this.list = await api.users.getAll(filters)
        this.isListEnded = !(this.list.data || []).length
      } catch (error) {
        error.showMessage('Cannot load user list')
      }
      this.isLoading = false
    },

    async onMoreClick () {
      const oldLength = this.list.data.length
      try {
        this.list = await this.list.concatNext()
        this.isListEnded = oldLength === this.list.data.length
      } catch (error) {
        error.showMessage('Cannot load next page')
      }
    },

    collectFilters () {
      const result = {}
      for (const key in this.filters) {
        if (this.filters.hasOwnProperty(key)) {
          const element = this.filters[key]
          if (element === WHOLE_GROUP) continue
          result[key] = element
        }
      }
      return result
    },

    toggleViewMode (id) {
      if (id) {
        this.view.mode = VIEW_MODES_VERBOSE.user
        this.view.userId = id
        this.view.scrollPosition = window.scrollY
        return
      }
      this.view.mode = VIEW_MODES_VERBOSE.index
      this.view.userId = null
      Vue.nextTick(() => {
        window.scroll(0, this.view.scrollPosition)
        this.view.scrollPosition = 0
      })
    },

    async getFullList () {
      const filters = this.collectFilters()
      let list = await api.users.getAll(filters)
      let length = list.data.length
      while (1) {
        list = await list.concatNext()
        if (list.data.length === length) {
          break
        }
        length = list.data.length
      }
      return list
    },

    async generateFile () {
      const list = (await this.getFullList()).data
      this.txtURL = createTxtFile(this.usersListToCSV(list), 'text/csv;encoding:utf-8')
    },

    usersListToTxt (list) {
      return list.reduce((result, user) =>
        result + `\t\t${user.state}\t${user.id}\t${user.email}\t\t \r\n`,
      'Name\tLast Name\tState\tAccount id\t Email\t Country \r\n')
    },

    usersListToCSV (list) {
      return list.reduce((result, user) =>
        result + `,,${user.state},${user.id},${user.email},, \r\n`,
      'Name,Last Name,State,Account id, Email, Country \r\n')
    }
  },

  watch: {
    'filters.state' () { this.getList() },
    'filters.type' () { this.getList() },
    'filters.email': _.throttle(function () { this.getList() }, 1000),
    'filters.address': _.throttle(function () { this.getList() }, 1000)
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/scss/_colors.scss';

.user-list__filters-wrp {
  margin-bottom: 4rem;
}

.user-list__download-btn,
.user-list__download-link {
  background: $color-content-bg;
  box-shadow: 0px 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  display: inline-block;
  font-size: 1.6rem;
  padding: 5px 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  color: $color-text;

  svg {
    height: 16px;
    margin-left: 5px;
    transform: translateY(4px);
    width: 16px;
  }
}

</style>
