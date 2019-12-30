<template>
  <div class="admin-list">
    <div class="admin-list__table-header" v-if="list.length">
      <span class="admin-list__li-name secondary">
        <!-- empty -->
      </span>

      <span class="admin-list__li-role secondary">
        {{ "admin-list.role-sec" | globalize }}
      </span>

      <span class="admin-list__li-account-id secondary">
        {{ "admin-list.acc-id-sec" | globalize }}
      </span>

      <span class="admin-list__li-weight secondary">
        {{ "admin-list.weight-sec" | globalize }}
      </span>

      <span class="admin-list__li-identity secondary">
        {{ "admin-list.identity-sec" | globalize }}
      </span>
    </div>

    <ul class="admin-list__ul" v-if="list && list.length">
      <li
        class="admin-list__li"
        v-for="item in list"
        :key="item.id">
        <router-link
          class="admin-list__li-a"
          :to="{ name: 'admins.show', params: { id: item.id } }"
        >
          <span class="admin-list__li-name" :title="item.details.name">
            <template v-if="item.id === masterPubKey">
              {{ "admin-list.master-acc" | globalize }}
            </template>
            <template v-else>
              {{ item.details.name }}
            </template>

            <template v-if="item.id === userAddress">
              <span class="secondary">
                {{ "admin-list.user-adds" | globalize }}
              </span>
            </template>
          </span>

          <span
            class="admin-list__li-role"
            :title="item.role.id | deriveRoleName(signerRoles)"
          >
            {{ item.role.id | deriveRoleName(signerRoles) }}
          </span>

          <span class="admin-list__li-account-id" :title="item.id">
            {{ item.id | cropAddress }}
          </span>

          <span class="admin-list__li-weight" :title="item.weight">
            {{ item.weight }}
          </span>

          <span class="admin-list__li-identity" :title="item.identity">
            {{ item.identity }}
          </span>
        </router-link>
      </li>
    </ul>
    <template v-else>
      <div class="app-list__li-like">
        <template v-if="isLoading">
          <p>
            {{ "admin-list.load" | globalize }}
          </p>
        </template>

        <template v-else>
          <p>
            {{ "admin-list.fail-load" | globalize }}
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

import { mapGetters } from 'vuex'
import { getters } from '@/store/types'

import { api, loadingDataViaLoop } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  filters: {
    deriveRoleName (roleId, signerRoles = []) {
      if (+roleId === 1) {
        return 'Master'
      }
      const role = signerRoles.find(item => item.id === roleId) || {}
      return (role.details || {}).name || `Unnamed (${roleId})`
    },
  },

  data () {
    return {
      list: [],
      masterPubKey: Vue.params.MASTER_ACCOUNT,
      signerRoles: [],
      isLoading: false,
    }
  },

  computed: {
    ...mapGetters({ userAddress: getters.GET_USER_ADDRESS }),
  },

  async created () {
    this.$store.commit('OPEN_LOADER')
    try {
      await this.loadSignerRoles()
      await this.loadSignerList()
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
    this.$store.commit('CLOSE_LOADER')
  },

  methods: {
    async loadSignerRoles () {
      let response = await api.getWithSignature('/v3/signer_roles')
      let signerRoles = await loadingDataViaLoop(response)
      this.signerRoles = signerRoles
    },

    async loadSignerList () {
      this.isLoading = true
      const endpoint = `/v3/accounts/${this.masterPubKey}/signers`
      const { data } = await api.getWithSignature(endpoint)
      this.list = data
      this.isLoading = false
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../../assets/scss/colors";

.admin-list__table-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2.5rem;
  margin-bottom: 0.5rem;
}

.admin-list__li {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);

  & + & {
    margin-top: 2rem;
  }
}

.admin-list__li-a {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 2rem 2.5rem;
  text-decoration: none;
  color: inherit;
}

%space-right {
  &:not(:last-of-type) {
    margin-right: 3rem;
  }
}

.admin-list__li-name {
  @extend %space-right;
  width: 20%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.admin-list__li-role {
  @extend %space-right;
  width: 35%;
  text-align: right;
}

.admin-list__li-account-id,
.admin-list__li-weight,
.admin-list__li-identity {
  @extend %space-right;
  width: 15%;
  text-align: right;
}
</style>
