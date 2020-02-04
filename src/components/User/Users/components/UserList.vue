<template>
  <div class="user-list">
    <div class="user-list__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          :label="'user-list.lbl-role' | globalize"
          v-model="filters.role"
        >
          <option :value="''" />
          <option :value="kvAccountRoles.unverified">
            {{ "user-list.unverified" | globalize }}
          </option>
          <option :value="kvAccountRoles.general">
            {{ "user-list.general" | globalize }}
          </option>
          <option :value="kvAccountRoles.corporate">
            {{ "user-list.corporate" | globalize }}
          </option>
          <option :value="kvAccountRoles.blocked">
            {{ "user-list.blocked" | globalize }}
          </option>
        </select-field>

        <input-field
          class="app-list-filters__field"
          v-model.trim="filters.requestor"
          :label="'user-list.lbl-requestor' | globalize"
          autocomplete-type="email"
        />
      </div>
    </div>

    <div class="user-list__list-wrp">
      <div class="app-list">
        <template v-if="list && list.length">
          <div class="app-list__header">
            <span class="app-list__cell user-list__email-cell">
              {{ "user-list.mail" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "user-list.account-id" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "user-list.role" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "user-list.state" | globalize }}
            </span>
          </div>

          <button
            class="app-list__li"
            v-for="item in list"
            :key="item.id"
            @click="showUserDetails(item.address)"
          >
            <span
              class="app-list__cell
                        app-list__cell--important
                        user-list__email-cell"
              :title="item.email ? item.email : '-'"
            >
              {{ item.email ? item.email : '-' }}
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

            <span
              class="app-list__cell app-list__cell--right"
              :title="item.role | accountState"
            >
              {{ item.role | accountState }}
            </span>
          </button>
        </template>

        <template v-else>
          <div class="app-list__li-like">
            <template v-if="isLoading || !isUsersIdentityLoad">
              <p>
                {{ "user-list.loading" | globalize }}
              </p>
            </template>

            <template v-else>
              <p>
                {{ "user-list.nothing-here-yet" | globalize }}
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
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import _ from 'lodash'
import apiHelper from '@/apiHelper'

import { api } from '@/api'
import { CollectionLoader } from '@/components/common'
import { clearObject } from '@/utils/clearObject'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { base } from '@tokend/js-sdk'
import { mapGetters } from 'vuex'
import { UserRecord } from '@/js/records/user.record'

export default {
  components: {
    SelectField,
    InputField,
    CollectionLoader,
  },

  data () {
    return {
      filters: {
        role: '',
        requestor: '',
      },
      list: [],
      isLoading: false,
      isUsersIdentityLoad: false,
    }
  },

  computed: {
    ...mapGetters([
      'kvAccountRoles',
    ]),
  },

  watch: {
    'filters.role' () {
      this.reloadCollectionLoader()
    },

    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },

  methods: {
    async getList () {
      this.isLoading = true
      let response = {}
      try {
        const requestor =
          await this.getRequestorAccountId(this.filters.requestor)
        response = await api.getWithSignature('/v3/accounts', {
          filter: clearObject({
            role: this.filters.role,
            account: requestor,
          }),
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

    async setList (userList) {
      const users = await this.getUsersWithIdentity(userList)
      this.list = users
    },
    async extendList (userList) {
      const users = await this.getUsersWithIdentity(userList)
      this.list = this.list.concat(users)
    },

    showUserDetails (id) {
      if (id) {
        this.$router.push({
          name: 'users.show',
          params: {
            id: id,
          },
        })
      }
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },

    async getUsersWithIdentity (userList) {
      if (!userList.length) return []

      const users = userList.map(user => {
        return {
          id: user.id,
          type: 'account',
        }
      })

      const usersIdentity = await this.loadUsersIdentity(users)

      const usersWithIdentity = userList.map(user => {
        const userIdentity = usersIdentity.find(identity => {
          return identity.address === user.id
        })

        return new UserRecord(user, userIdentity)
      })

      return usersWithIdentity
    },

    async loadUsersIdentity (users) {
      this.isUsersIdentityLoad = false
      try {
        const { data } = await api.postWithSignature('/identities/mass-emails', {
          data: users,
        })
        return data
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isUsersIdentityLoad = true
    },
  },
}
</script>

<style lang="scss" scoped>
.user-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
