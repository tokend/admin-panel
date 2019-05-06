<template>
  <div class="kyc-requests-queue app__block">
    <template v-if="pendingRequests.length">
      <template v-if="!isConfirmationShown">
        <h2>
          {{ currentRequestIndex + 1 }} / {{ pendingRequests.length }} requests
        </h2>

        <pending-request-viewer
          v-for="(request, i) in pendingRequests"
          :key="request.id"
          v-show="currentRequestIndex === i"
          :request="request"
        />

        <pending-request-actions
          class="kyc-requests-queue__actions"
          :request="pendingRequests[currentRequestIndex]"
          @reviewed="nextRequest"
        />
      </template>

      <template v-else>
        {{ JSON.stringify(operations) }}
      </template>
    </template>

    <template v-else>
      <div>
        <template v-if="isLoading">
          <p>
            <span>
              Loading...
            </span>
          </p>
        </template>

        <template v-else>
          <p>
            <span>
              No requests to review yet
            </span>
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import PendingRequestViewer from './components/PendingRequestViewer'
import PendingRequestActions from './components/PendingRequestActions'

import config from '@/config'
import { ApiCallerFactory } from '@/api-caller-factory'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { REQUEST_STATES } from '@tokend/js-sdk'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

export default {
  name: 'kyc-requests-queue',
  components: {
    PendingRequestViewer,
    PendingRequestActions,
  },

  data () {
    return {
      isLoading: false,
      isConfirmationShown: false,
      pendingRequests: [],
      operations: [],
      currentRequestIndex: 0,
      REQUEST_STATES,
      CHANGE_ROLE_TASKS: config.CHANGE_ROLE_TASKS,
    }
  },

  async created () {
    await this.loadList()
  },

  methods: {
    async loadList () {
      this.isLoading = true
      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/change_role_requests', {
            page: { order: 'desc' },
            filter: { state: REQUEST_STATES.pending },
            include: ['request_details'],
          })
        this.pendingRequests = data.map(item => new ChangeRoleRequest(item))
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
    },

    nextRequest (payload) {
      this.operations.push(payload)
      this.currentRequestIndex++
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })

      if (this.currentRequestIndex === this.pendingRequests.length) {
        this.isConfirmationShown = true
      }
    },
  },
}
</script>

<style scoped>
.kyc-requests-queue__actions {
  margin-top: 4rem;
}
</style>
