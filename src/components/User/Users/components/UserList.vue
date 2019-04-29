<template>
  <div class="user-list">
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
          v-model.trim="filters.email"
          label="Email"
          autocomplete-type="email"
        />

        <input-field
          class="app-list-filters__field"
          v-model.trim="filters.address"
          label="Account ID"
          autocomplete-type="address"
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
  </div>
</template>

<script>
import { clearObject } from '@/utils/clearObject'
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { AccountStateGetter } from '@comcom/getters'
import _ from 'lodash'
import 'mdi-vue/DownloadIcon'
import { ApiCallerFactory } from '@/api-caller-factory'
import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { CollectionLoader } from '@/components/common'

export default {
  components: {
    SelectField,
    InputField,
    AccountStateGetter,
    CollectionLoader
  },

  data () {
    return {
      filters: {
        email: '',
        address: '',
        role: ''
      },
      view: {
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
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/identities', {
            filter: clearObject({
              email: this.filters.email,
              role: this.filters.role,
              address: this.filters.address
            })
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
      return response
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
        this.$router.push({
          name: 'users.show',
          params: {
            id: id
          }
        })
        return
      }
      this.view.userId = null
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
    'filters.email': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
    'filters.address': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
.user-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
