<template>
    <div>
        <!-- Reject Form -->
        <div class="flex-column info-block" v-if="requestSelected">
            <h2 class="preissuance-request-list__reject-heading">
              Reject
            </h2>

            <p class="preissuance-request-list__reject-hint">
              Input reject reason and submit rejection
            </p>

            <div class="preissuance-request-list__form-row app__form-row">
              <input-field class="app__form-field"
                v-model="rejectReason"
                label="Reject reason"
              />
            </div>

            <div class="preissuance-request-list__form-actions app__form-actions">
              <button class="app__btn app__btn--danger"
                @click="reject(currentRequest)"
                :disabled="buttonDisabled">
                Submit rejection
              </button>
              <button class="app__btn-secondary"
                @click="requestSelected = false"
                :disabled="buttonDisabled">
                Cancel
              </button>
            </div>
        </div>
        <!--/ Reject Form -->

        <!-- Request List -->
        <div v-show="!requestSelected">
            <div class="full-width preissuance-request-list" v-if="requestsLoaded">
                <table class="preissuance-request-list__table">

                    <thead>
                      <tr>
                        <th><span class="secondary">Amount</span></th>
                        <th><span class="secondary">Asset</span></th>
                        <th><span class="secondary">Status</span></th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="request in filteredRequests" :key="request.id">
                        <td><span>{{ localize(request.amount()) }}</span></td>
                        <td><span>{{ request.asset() }}</span></td>
                        <td><span>{{ verbozify(request.state) }}</span></td>

                        <td>
                          <div class="preissuance-request-list__td-actions-wrp">
                            <button class="app__btn app__btn--small app__btn--danger"
                              @click="setReject(request)"
                              :disabled="request.state !== 'pending'">
                              Reject
                            </button>

                            <button class="app__btn app__btn--small"
                              @click="fulfill(request)"
                              :disabled="buttonDisabled || request.state !== 'pending'">
                              <!--TODO: here button is being disabled if '!hasIssuances', resolve wtf -->
                              Accept
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                </table>

                <div class="app__more-btn-wrp">
                    <button class="app__btn-secondary"
                        v-if="!pageableLoadCompleted && filteredRequests.length !== 0"
                        @click="nextPageLoader" >
                        More
                    </button>
                </div>
            </div>

            <p class="loading" v-else>
              Loading<span class="loading__dot">.</span><span class="loading__dot">.</span><span class="loading__dot">.</span>
            </p>
        </div>
        <!--/ Request List -->

    </div>
</template>

<script>
import moment from 'moment'
import api from '@/api'
import errors from '@/errors'
import localize from '@/utils/localize'
import { verbozify } from '@/utils/verbozify'
import InputField from '@comcom/fields/InputField'

import { CreatePreIssuanceRequest } from '@/api/responseHandlers/requests/CreatePreIssuanceRequest'

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
      requestsLoaded: false,

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

    hasIssuances () {
      return this.availableAmount > 0
    },

    filteredRequests () {
      const filteredByType = this.requests.filter(request => request instanceof CreatePreIssuanceRequest)
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
      return this.pages.next(this.$store.getters.keypair).then((response) => {
        if (response.records.length > 0) {
          this.requests = this.requests.concat(response.records)
          this.pages = response
          return
        }
        if (response.records.length < this.$store.getters.pageLimit) {
          this.pageableLoadCompleted = true
        }
        this.loadNewPage = false
      }).catch((err) => {
        console.error(err)
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

    getRequests () {
      return api.requests.getPreissuanceRequests(this.asset)
        .then(r => {
          this.requests = []
          this.requests = r.records
          this.pages = r
          this.requestsLoaded = true
        })
    },

    setReject (r) {
      this.currentRequest = r
      this.requestSelected = true
    },

    reject (request) {
      if (!this.rejectReason) {
        this.$store.dispatch('SET_ERROR', 'Enter reject reason before continue')
        return
      }

      this.$store.commit('OPEN_LOADER')
      return request.reject(this.rejectReason, true).then(r => {
        this.clear()
        this.$store.dispatch('SET_INFO', 'Pending transaction for rejected request submitted')
        return this.getRequests()
      }).catch(err => {
        console.error('error', err)
        this.clear()
        const message = errors.tryParseError(err) || 'Rejection tx failed'
        this.$store.dispatch('SET_ERROR', message)
      })
    },

    fulfill (request) {
      // TODO: resolve why do we need this and what the fuck is availalble amount
      // if (parseInt(request.amount) > this.availableAmount) {
      //   this.$store.dispatch('SET_ERROR', 'Not enough pre-issued coins for fulfill this request')
      //   return
      // }

      this.$store.commit('OPEN_LOADER')
      return request.fulfill()
        .then(() => {
          this.$store.commit('CLOSE_LOADER')
          this.$store.dispatch('SET_INFO', 'Pending transaction for fulfill request submitted')
          this.$emit('need-to-update')
          return this.getRequests()
        }).catch(err => {
          console.error('error', err)
          this.clear()
          const message = errors.tryParseError(err) || 'Issuance tx failed'
          this.$store.dispatch('SET_ERROR', message)
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

.info-block__input {
  min-width: 320px;
}

.info-block__row-item {
  margin-bottom: 15px;
}

.inline-btn,
.info-block__input {
  margin-left: 15px;
  margin-right: 15px;
}

.select__btn {
  padding-top: 15px;
}

.preissuance-request-list__table {
  border-spacing: 0;
  width: 100%;

  .accountId {
    max-width: 160px;
  }

  th {
    font-weight: normal;
    text-align: left;
  }
}

.exchange-id {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preissuance-request-list__td-actions-wrp {
  display: flex;
  align-items: center;
}

h2.preissuance-request-list__reject-heading {
  margin: 0 0 4rem 0;
}

.preissuance-request-list__form-row.app__form-row {
  max-width: 40rem;
}

.preissuance-request-list__form-actions.app__form-actions {
  & > .app__btn,
  & > .app__btn-secondary {
    max-width: 20rem;
  }
}

.preissuance-request-list__reject-hint {
  margin: 0 0 3rem 0;
}
</style>
