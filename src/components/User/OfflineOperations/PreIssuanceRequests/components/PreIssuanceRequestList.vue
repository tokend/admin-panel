<template>
  <div>
    <!-- Reject Form -->
    <div
      class="flex-column info-block"
      v-if="requestSelected"
    >
      <h2 class="preissuance-request-list__reject-heading">
        Reject
      </h2>

      <p class="preissuance-request-list__reject-hint">
        Input reject reason and submit rejection
      </p>

      <div class="preissuance-request-list__form-row app__form-row">
        <input-field
          class="app__form-field"
          v-model="rejectReason"
          label="Reject reason"
        />
      </div>

      <div class="preissuance-request-list__form-actions app__form-actions">
        <button
          class="app__btn app__btn--danger"
          @click="reject(currentRequest)"
          :disabled="buttonDisabled"
        >
          Submit rejection
        </button>
        <button
          class="app__btn-secondary"
          @click="requestSelected = false"
          :disabled="buttonDisabled"
        >
          Cancel
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
              <th><span class="secondary">Amount</span></th>
              <th><span class="secondary">Asset</span></th>
              <th><span class="secondary">Status</span></th>
              <th></th>
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
                    Reject
                  </button>

                  <button
                    class="app__btn app__btn--small"
                    @click="fulfill(request)"
                    :disabled="buttonDisabled || request.state !== 'pending'"
                  >
                    Accept
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
            More
          </button>
        </div>
      </div>

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
    <!--/ Request List -->

  </div>
</template>

<script>
import moment from 'moment'
import api from '@/api'
import localize from '@/utils/localize'
import { verbozify } from '@/utils/verbozify'
import InputField from '@comcom/fields/InputField'

import { CreatePreIssuanceRequest } from '@/api/responseHandlers/requests/CreatePreIssuanceRequest'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    InputField
  },

  props: {
    asset: {
      type: String,
      default: 'All'
    },

    availableAmount: {
      type: Number,
      default: 0
    }
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
      currentRequest: {}
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
    }
  },

  mounted () {
    this.getRequests()
  },

  watch: {
    asset: function () {
      this.getRequests()
    }
  },

  methods: {
    verbozify,
    localize,

    nextPageLoader () {
      this.loadNewPage = true
      return this.pages
        .fetchNext(this.$store.getters.keypair)
        .then((response) => {
          if (response.data.length > 0) {
            const mappedRequests = api.requests.mapRequests(response.data)
            this.requests = this.requests.concat(mappedRequests)
            this.pages = response
            return
          }

          if (response.data.length < 10) {
            this.pageableLoadCompleted = true
          }

          this.loadNewPage = false
        }).catch((err) => {
          ErrorHandler.processWithoutFeedback(err)
          this.loadNewPage = false
          this.pageableLoadCompleted = true
        })
    },

    formatDate (date) {
      return moment(date).calendar(null, {
        lastWeek: 'DD MMM LT',
        sameElse: 'DD MMM LT'
      })
    },

    clear () {
      this.currentRequest = {}
      this.rejectReason = ''
      this.requestSelected = false
      this.$store.commit('CLOSE_LOADER')
    },

    parseStatus (accepted) {
      if (accepted === null) return 'Pending'
      return accepted ? 'Accepted' : 'Rejected'
    },

    async getRequests () {
      this.isLoading = true
      let response
      try {
        response = await api.requests.getPreissuanceRequests(this.asset)
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

    reject (request) {
      if (!this.rejectReason) {
        ErrorHandler.process('Enter reject reason before continue')
        return
      }

      this.$store.commit('OPEN_LOADER')
      return request.reject(this.rejectReason, true).then(r => {
        this.clear()
        this.$store.dispatch('SET_INFO', 'Pending transaction for rejected request submitted')
        return this.getRequests()
      }).catch(error => {
        this.clear()
        ErrorHandler.process(error)
      })
    },

    fulfill (request) {
      this.$store.commit('OPEN_LOADER')
      return request.fulfill()
        .then(() => {
          this.$store.commit('CLOSE_LOADER')
          this.$store.dispatch('SET_INFO', 'Pending transaction for fulfill request submitted')
          this.$emit('need-to-update')
          return this.getRequests()
        }).catch(error => {
          this.clear()
          ErrorHandler.process(error)
        })
    }
  }
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
