<template>
  <div>
    <!-- Reject Form -->
    <div
      class="flex-column info-block"
      v-if="requestSelected"
    >
      <h2 class="preissuance-request-list__reject-heading">
        {{ "pre-issuance-request-list.reject" | globalize }}
      </h2>

      <p class="preissuance-request-list__reject-hint">
        {{ "pre-issuance-request-list.input-reason-and-submit" | globalize }}
      </p>

      <div class="preissuance-request-list__form-row app__form-row">
        <input-field
          class="app__form-field"
          v-model="rejectReason"
          :label="'pre-issuance-request-list.lbl-reject-reason' | globalize"
        />
      </div>

      <div class="preissuance-request-list__form-actions app__form-actions">
        <button
          class="app__btn app__btn--danger"
          @click="reject(currentRequest)"
          :disabled="buttonDisabled"
        >
          {{ "pre-issuance-request-list.btn-submit-rejection" | globalize }}
        </button>
        <button
          class="app__btn-secondary"
          @click="requestSelected = false"
          :disabled="buttonDisabled"
        >
          {{ "pre-issuance-request-list.btn-cancel" | globalize }}
        </button>
      </div>
    </div>
    <!--/ Reject Form -->

    <!-- Request List -->
    <div v-show="!requestSelected">
      <div
        class="full-width preissuance-request-list"
        v-if="filteredRequests && filteredRequests.length"
      >
        <table class="preissuance-request-list__table">
          <thead>
            <tr>
              <th>
                <span class="secondary">
                  {{ "pre-issuance-request-list.amount" | globalize }}
                </span>
              </th>
              <th>
                <span class="secondary">
                  {{ "pre-issuance-request-list.asset" | globalize }}
                </span>
              </th>
              <th>
                <span class="secondary">
                  {{ "pre-issuance-request-list.status" | globalize }}
                </span>
              </th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
            >
              <td><span>{{ localize(request.amount()) }}</span></td>
              <td><span>{{ request.asset() }}</span></td>
              <td><span>{{ verbozify(request.state) }}</span></td>

              <td>
                <span class="preissuance-request-list__td-actions-wrp">
                  <button
                    class="app__btn app__btn--small app__btn--danger"
                    @click="setReject(request)"
                    :disabled="request.state !== 'pending'"
                  >
                    {{ "pre-issuance-request-list.btn-reject" | globalize }}
                  </button>

                  <button
                    class="app__btn app__btn--small"
                    @click="fulfill(request)"
                    :disabled="buttonDisabled || request.state !== 'pending'"
                  >
                    {{ "pre-issuance-request-list.btn-accept" | globalize }}
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="app__more-btn-wrp">
          <button
            class="app__btn-secondary"
            v-if="!pageableLoadCompleted && filteredRequests.length !== 0"
            @click="nextPageLoader"
          >
            {{ "pre-issuance-request-list.btn-more" | globalize }}
          </button>
        </div>
      </div>

      <template v-else>
        <div class="app-list__li-like">
          <template v-if="isLoading">
            <p>
              {{ "pre-issuance-request-list.loading" | globalize }}
            </p>
          </template>

          <template v-else>
            <p>
              {{ "pre-issuance-request-list.fail-load" | globalize }}
            </p>
          </template>
        </div>
      </template>
    </div>
    <!--/ Request List -->
  </div>
</template>

<script>
import InputField from '@comcom/fields/InputField'

import localize from '@/utils/localize'
import { verbozify } from '@/utils/verbozify'

import apiHelper from '@/apiHelper'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { CreatePreIssuanceRequest } from '@/apiHelper/responseHandlers/requests/CreatePreIssuanceRequest'
import { Bus } from '@/utils/bus'

export default {
  components: { InputField },

  props: {
    asset: {
      type: String,
      default: 'All',
    },

    availableAmount: {
      type: Number,
      default: 0,
    },
  },

  data () {
    return {
      loadNewPage: false,
      pageableLoadCompleted: false,
      requestSelected: false,
      isLoading: false,

      pages: {},
      requests: [],
      rejectReason: '',
      currentRequest: {},
    }
  },

  computed: {
    buttonDisabled () {
      return this.$store.getters.showLoader
    },

    filteredRequests () {
      const filteredByType = this.requests
        .filter(request => request instanceof CreatePreIssuanceRequest)

      return this.asset === 'All'
        ? filteredByType
        : filteredByType.filter(request => request.asset() === this.asset)
    },
  },

  watch: {
    asset: function () {
      this.getRequests()
    },
  },

  mounted () {
    this.getRequests()
  },

  methods: {
    verbozify,
    localize,

    async nextPageLoader () {
      this.loadNewPage = true

      try {
        const response = await this.pages.fetchNext(this.$store.getters.keypair)

        if (response.data.length > 0) {
          const mappedRequests = apiHelper.requests.mapRequests(response.data)
          this.requests = this.requests.concat(mappedRequests)
          this.pages = response
          return
        }

        if (response.data.length < 10) {
          this.pageableLoadCompleted = true
        }

        this.loadNewPage = false
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        this.loadNewPage = false
        this.pageableLoadCompleted = true
      }
    },

    clear () {
      this.currentRequest = {}
      this.rejectReason = ''
      this.requestSelected = false
      this.$store.commit('CLOSE_LOADER')
    },

    parseStatus (accepted) {
      if (accepted === null) return 'pre-issuance-request-list.pending'
      return accepted ? 'pre-issuance-request-list.accepted'
        : 'pre-issuance-request-list.rejected'
    },

    async getRequests () {
      this.isLoading = true
      let response
      try {
        response = await apiHelper.requests.getPreissuanceRequests(this.asset)
        this.requests = []
        this.requests = response.records
        this.pages = response
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
      return response
    },

    setReject (r) {
      this.currentRequest = r
      this.requestSelected = true
    },

    async reject (request) {
      if (!this.rejectReason) {
        ErrorHandler.process(request, 'pre-issuance-request-list.enter-reject')
        return
      }

      this.$store.commit('OPEN_LOADER')

      try {
        await request.reject(this.rejectReason, true)

        this.clear()
        Bus.success('pre-issuance-request-list.rejected-transaction-submitted')

        await this.getRequests()
      } catch (error) {
        this.clear()
        ErrorHandler.process(error)
      }
    },

    async fulfill (request) {
      this.$store.commit('OPEN_LOADER')

      try {
        await request.fulfill()

        this.$store.commit('CLOSE_LOADER')
        Bus.success('pre-issuance-request-list.fulfill-transaction-submitted')
        this.$emit('need-to-update')

        await this.getRequests()
      } catch (error) {
        this.clear()
        ErrorHandler.process(error)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.info-block {
  margin-bottom: 25px;
  max-width: 1000px;
}

.preissuance-request-list__table {
  border-spacing: 0;
  width: 100%;

  th {
    font-weight: normal;
    text-align: left;
  }
}

.preissuance-request-list__td-actions-wrp {
  display: inline-flex;
  align-items: center;
  width: 100%;

  & > .app__btn {
    min-width: 0;
    max-width: 12rem;

    &:not(:first-child) {
      margin-left: .8rem;
    }
  }
}

h2.preissuance-request-list__reject-heading {
  margin: 0 0 4rem 0;
}

.preissuance-request-list__form-row.app__form-row {
  max-width: 40rem;
}

.preissuance-request-list__reject-hint {
  margin: 0 0 3rem 0;
}
</style>
