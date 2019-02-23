<template>
  <div class="admin-list">
    <div
      class="admin-list__table-header"
      v-if="list.length"
    >
      <span class="admin-list__li-name secondary">
        <!-- empty -->
      </span>

      <span class="admin-list__li-role secondary">
        Role
      </span>

      <span class="admin-list__li-account-id secondary">
        Account ID
      </span>

      <span class="admin-list__li-weight secondary">
        Weight
      </span>

      <span class="admin-list__li-identity secondary">
        Identity
      </span>
    </div>

    <ul class="admin-list__ul">
      <li
        class="admin-list__li"
        v-for="item in list"
        :key="item.id"
      >
        <router-link
          class="admin-list__li-a"
          :to="{ name: 'admins.show', params: { id: item.id } }"
        >
          <span
            class="admin-list__li-name"
            :title="item.details.name"
          >
            <template v-if="item.id === masterPubKey">
              Master
            </template>
            <template v-else>
              {{ item.details.name }}
            </template>

            <template v-if="item.id === userAddress">
              <span class="secondary">(you)</span>
            </template>
          </span>

          <span
            class="admin-list__li-role"
            :title="item.role.id | deriveRoleName(signerRoles)"
          >
            {{ item.role.id | deriveRoleName(signerRoles) }}
          </span>

          <span
            class="admin-list__li-account-id"
            :title="item.id"
          >
            {{ item.id | cropAddress }}
          </span>

          <span
            class="admin-list__li-weight"
            :title="item.weight"
          >
            {{ item.weight }}
          </span>

          <span
            class="admin-list__li-identity"
            :title="item.identity"
          >
            {{ item.identity }}
          </span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { getters } from '@/store/types'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  data () {
    return {
      list: [],
      masterPubKey: Vue.params.MASTER_ACCOUNT,
      signerRoles: []
    }
  },

  filters: {
    deriveRoleName (roleId, signerRoles = []) {
      if (+roleId === 1) {
        return 'Master'
      }
      const role = signerRoles.find(item => item.id === roleId) || {}
      return (role.details || {}).name || `Unnamed (${roleId})`
    }
  },

  computed: {
    ...mapGetters({ userAddress: getters.GET_USER_ADDRESS })
  },

  async created () {
    try {
      await this.loadSignerRoles()
      await this.loadSignerList()
    } catch (error) {
      ErrorHandler.process(error)
    }
  },

  methods: {
    async loadSignerRoles () {
      const signerRoles = await this.getAllSignerRoles()
      this.signerRoles = signerRoles.data
    },

    async getAllSignerRoles () {
      const pageLimit = 100
      const list = await ApiCallerFactory
        .createCallerInstance()
        .get('/v3/signer_roles', {
          page: { limit: pageLimit }
        })

      let isListFullyLoaded = list.data.length < pageLimit
      while (!isListFullyLoaded) {
        const newChunk = await list.fetchNext()
        const oldLength = list.data.length
        list._data = list.data.concat(newChunk)
        if (oldLength === list.data.length) {
          isListFullyLoaded = true
        }
      }

      return list
    },

    async loadSignerList () {
      this.$store.commit('OPEN_LOADER')
      const response = await this.getSingersOfMaster()
      this.list = response.data
        .sort((itemA, itemB) => {
          if (itemA.details.name === '') return 1
          if (itemB.details.name === '') return -1
          if (itemA.details.name === itemB.details.name) return 0
          return itemA.details.name > itemB.details.name ? 1 : -1
        })
      this.$store.commit('CLOSE_LOADER')
    },

    async getSingersOfMaster () {
      const response = await ApiCallerFactory
        .createCallerInstance()
        .getWithSignature(`/v3/accounts/${this.masterPubKey}/signers`)
      return response
    }
  }
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
