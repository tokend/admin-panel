<template>
  <div class="user-list">
    <template v-if="view.mode === VIEW_MODES_VERBOSE.index">
      <div class="user-list__filters-wrp">
        <div class="app-list-filters">
          <select-field
            class="issuance-rl__filter app-list-filters__field"
            label="Role"
            v-model="filters.role"
          >
            <option :value="''"></option>
            <option :value="ACCOUNT_ROLES.notVerified">Unverified</option>
            <option :value="ACCOUNT_ROLES.general">General</option>
            <option :value="ACCOUNT_ROLES.corporate">Сorporate</option>
          </select-field>

          <input-field
            class="app-list-filters__field"
            v-model.trim="filters.requestor"
            label="Requestor"
            autocomplete-type="email"
          />
        </div>
      </div>

      <div class="user-list__list-wrp">
        <div class="app-list">
          <template v-if="list && list.length">
            <div class="app-list__header">
              <span class="app-list__cell user-list__email-cell">
                Email
              </span>
              <span class="app-list__cell app-list__cell--right">
                Account ID
              </span>
              <span class="app-list__cell app-list__cell--right">
                Role
              </span>
              <span class="app-list__cell app-list__cell--right">
                State
              </span>
            </div>

            <button
              class="app-list__li"
              v-for="item in list"
              :key="item.id"
              @click="toggleViewMode(item.address)"
            >
              <span
                class="app-list__cell
                      app-list__cell--important
                      user-list__email-cell"
                :title="item.email"
              >
                {{ item.email }}
              </span>

              <span
                class="app-list__cell app-list__cell--right"
                :title="item.address"
              >
                {{ item.address | cropAddress }}
              </span>

              <span
                class="app-list__cell app-list__cell--right"
                :title="item.role | roleIdToString"
              >
                {{ item.role | roleIdToString }}
              </span>

              <account-state-getter
                class="app-list__cell app-list__cell--right"
                :accountId="item.address"
              />
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
        <collection-loader
          :first-page-loader="getList"
          @first-page-load="setList"
          @next-page-load="extendList"
          ref="collectionLoaderBtn"
        />
      </div>

      </div>
    </template>

    <user-view
      v-if="view.mode === VIEW_MODES_VERBOSE.user"
      :id="view.userId"
      @back="toggleViewMode(null)"
      @reviewed="getList"
    />

  </div>
</template>

<script>
import Vue from 'vue'
import { clearObject } from '@/utils/clearObject'
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { AccountStateGetter } from '@comcom/getters'
import UserView from '../Users.Show'
import _ from 'lodash'
import 'mdi-vue/DownloadIcon'
import { ApiCallerFactory } from '@/api-caller-factory'
import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'
import api from '@/api'
import { Sdk } from '@/sdk'

const VIEW_MODES_VERBOSE = Object.freeze({
  index: 'index',
  user: 'user'
})

export default {
  components: {
    SelectField,
    InputField,
    UserView,
    AccountStateGetter,
    CollectionLoader
  },

  data () {
    return {
      VIEW_MODES_VERBOSE,
      filters: {
        role: '',
        requestor: ''
      },
      view: {
        mode: VIEW_MODES_VERBOSE.index,
        userId: null,
        scrollPosition: 0
      },
      list: [],
      isLoading: false,

      ACCOUNT_ROLES: config.ACCOUNT_ROLES
    }
  },

  methods: {
    async getList () {
      this.isLoading = true
      let response = {}
      try {
        const requestor = await this.getRequestorAccountId(this.filters.requestor)
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/identities', {
            filter: clearObject({
              role: this.filters.role,
              address: requestor
            })
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
      return response
    },

    async getRequestorAccountId (requestor) {
      if (Sdk.base.Keypair.isValidPublicKey(requestor)) {
        return requestor
      } else {
        try {
          const address = await api.users.getAccountIdByEmail(requestor)
          return address || requestor
        } catch (error) {
          return requestor
        }
      }
    },

    setList (data) {
      this.list = data
      this.isLoaded = true
    },
    extendList (data) {
      this.list = this.list.concat(data)
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

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    }
  },

  watch: {
    'filters.state' () {
      this.reloadCollectionLoader()
    },
    'filters.role' () {
      this.reloadCollectionLoader()
    },
    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/_colors.scss";

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
