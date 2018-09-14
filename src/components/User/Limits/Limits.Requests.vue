<template>
  <div class="limits-requests">
    <template v-if="list.data">
      <limits-list :list="list.data" />
    </template>
    <template v-else>
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
    </template>
  </div>
</template>

<script>
  import LimitsList from './components/Limits.RequestList'
  import api from '@/api'
  import {
    REQUEST_STATES
  } from '@/constants'

  export default {
    components: { LimitsList },
    data: _ => ({
      list: {},
      accountTypeList: {},
      isLoading: false
    }),
    async created () {
      await this.getList()
    },

    computed: {
    },

    methods: {
      async getList () {
        this.isLoading = true
        try {
          this.list = await api.requests.getLimitsUpdateRequests({
            state: REQUEST_STATES.pending
          })
        } catch (error) {
          error.showMessage('Cannot load user list')
        }
        this.isLoading = false
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
