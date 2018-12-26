<template>
  <div class="admin-list">
    <div class="admin-list__table-header" v-if="list">
      <span class="admin-list__li-name secondary">
        <!-- empty -->
      </span>

      <span class="admin-list__li-account-id secondary">
        Account ID
      </span>

      <span class="admin-list__li-rights secondary">
        Rights
      </span>

      <span class="admin-list__li-weight secondary">
        Weight
      </span>

      <span class="admin-list__li-identity secondary">
        Identity
      </span>
    </div>

    <ul class="admin-list__ul">
      <li class="admin-list__li" v-for="item in list" :key="item.publicKey">
        <router-link class="admin-list__li-a"
          :to="{ name: 'admins.show', params: { id: item.publicKey } }">
          <span class="admin-list__li-name" :title="item.signerName">
            {{ item.signerName.split(':')[0] }}
            <template v-if="item.publicKey === userAddress">
              <span class="secondary">(you)</span>
            </template>
          </span>

          <span class="admin-list__li-account-id" :title="item.publicKey">
            {{item.publicKey}}
          </span>

          <span class="admin-list__li-rights" :title="item.signerTypeI">
            {{ item.signerTypeI | getAdminSignerTypeLabel }}
          </span>

          <span class="admin-list__li-weight" :title="item.weight">
            {{item.weight}}
          </span>

          <span class="admin-list__li-identity" :title="item.signerIdentity">
            {{item.signerIdentity}}
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
import { Sdk } from '@/sdk'

export default {
  data () {
    return {
      list: undefined,
      masterPubKey: Vue.params.MASTER_ACCOUNT
    }
  },
  computed: {
    ...mapGetters({ userAddress: getters.GET_USER_ADDRESS })
  },
  created () {
    this.getAdminList()
  },
  methods: {
    async getAdminList () {
      this.$store.commit('OPEN_LOADER')
      try {
        const response = await Sdk.horizon.account.get(this.masterPubKey)
        const { signers } = response.data
        this.list = signers
          .map(signer =>
            signer.publicKey === this.masterPubKey
              ? Object.assign(signer, { signerName: 'Master' })
              : signer
          )
          .sort((signerA, signerB) => {
            if (signerA.signerName === '') return 1
            if (signerB.signerName === '') return -1
            if (signerA.signerName === signerB.signerName) return 0
            return signerA.signerName > signerB.signerName ? 1 : -1
          })
      } catch (err) {
        console.error(err)
        this.$store.dispatch('SET_ERROR', 'Can’t load administrators list')
      }
      this.$store.commit('CLOSE_LOADER')
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
  width: 25%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.admin-list__li-account-id {
  @extend %space-right;
  width: 20%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-list__li-rights,
.admin-list__li-weight,
.admin-list__li-identity {
  @extend %space-right;
  width: 10%;
  text-align: right;
}
</style>
