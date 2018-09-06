<template>
  <div class="issuance-rl">
    <div class="issuance-rl__filters-wrp">
      <div class="app-list-filters">
        <select-field class="issuance-rl__filter app-list-filters__field"
          label="State" v-model="filters.state">
          <option :value="REQUEST_STATES.pending">Pending</option>
          <option :value="REQUEST_STATES.approved">Approved</option>
          <option :value="REQUEST_STATES.permanentlyRejected">Permanently rejected</option>
        </select-field>

        <select-field class="issuance-rl__filter app-list-filters__field"
          label="Asset" v-model="filters.asset">
          <option  v-for="asset in assets" :value="asset">{{ asset }}</option>
        </select-field>
      </div>
    </div>

    <div class="issuance-rl__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty -->
            </span>

            <span class="app-list__cell">
              Reference
            </span>

            <span class="app-list__cell">
              Receiver
            </span>

            <span class="app-list__cell">
              Detail
            </span>

            <span class="app-list__cell app-list__cell--right">
              <!-- empty -->
            </span>

          </div>
          <li class="app-list__li app-list__li--v-center" v-for="item in list.data" :key="item.id">
            <span class="app-list__cell app-list__cell--important"
              :title="`${localize(item.amount)} ${item.asset}`">
              {{localize(item.amount)}} {{item.asset}}
            </span>

            <span class="app-list__cell app-list__cell--wrap"
              :title="item.reference || 'No reference'">
              {{item.reference || '—'}}
            </span>

            <span class="app-list__cell"
              :title="item.receiver">
              {{item.receiver}}
            </span>

            <span class="app-list__cell">
              <email-getter :balance="item.receiver" is-titled />
            </span>

            <span class="app-list__cell app-list__cell--right app-list__cell--actions">
              <button class="app__btn app__btn--small"
                @click="fulfill(item)"
                :disabled="isSubmitting || item.requestStateI !== REQUEST_STATES.pending">
                Fulfill
              </button>

              <button class="app__btn app__btn--small app__btn--danger"
                @click="selectForRejection(item)"
                :disabled="isSubmitting || item.requestStateI !== REQUEST_STATES.pending">
                Reject
              </button>
            </span>
          </li>
        </ul>

        <div class="app__more-btn-wrp">
          <button class="app__btn-secondary"
            v-if="!isNoMoreEntries && list.data"
            @click="onMoreButtonClick" >
            More
          </button>
        </div>
      </template>

      <template v-else>
        <div class="app-list">
          <div class="app-list__li-like">
            <p>{{isLoaded ? 'Nothing here yet' : 'Loading...'}}</p>
          </div>
        </div>
      </template>
    </div>

    <modal v-if="itemToReject"
      @close-request="clearRejectionSelection()"
      max-width="40rem">
      <form class="issuance-rl__reject-form" id="issuance-rl-reject-form"
        @submit.prevent="reject(itemToReject) && clearRejectionSelection()">
        <div class="app__form-row">
          <text-field label="Enter reject reason" v-model="rejectForm.reason"/>
        </div>
      </form>

      <div class="issuance-rl__reject-form-actions app__form-actions">
        <button class="app__btn app__btn--danger" form="issuance-rl-reject-form">
          Reject
        </button>
        <button class="app__btn-secondary" @click="clearRejectionSelection">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import api from '@/api'
import localize from '@/utils/localize'
import TextField from '@comcom/fields/TextField'
import SelectField from '@comcom/fields/SelectField'

import { EmailGetter } from '@comcom/getters'
import Modal from '@comcom/modals/Modal'
import Bus from '@/utils/EventBus'
import { REQUEST_STATES, ASSET_POLICIES } from '@/constants'

export default {
  components: {
    Modal,
    TextField,
    SelectField,
    EmailGetter
  },

  data () {
    return {
      REQUEST_STATES,

      list: {},
      assets: [''],
      isNoMoreEntries: false,
      isLoaded: false,
      isRejectionModalShown: false,
      itemToReject: null,
      isSubmitting: false,
      rejectForm: {
        reason: ''
      },
      filters: {
        state: REQUEST_STATES.pending,
        asset: ''
      }
    }
  },

  async created () {
    await this.getAssets()
    Bus.$on('issuance:updateRequestList', _ => this.getList())
    this.getList()
  },

  methods: {
    localize,

    async getAssets () {
      try {
        this.assets = this.assets.concat(
          (await api.assets.getAssets())
            .filter(item => (item.policy & ASSET_POLICIES.baseAsset))
            .sort((assetA, assetB) => assetA.code > assetB.code ? 1 : -1)
            .map(asset => asset.code)
        )
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot get asset list. Please try again later')
      }
    },

    async getList () {
      this.isLoaded = false
      try {
        const filters = { ...this.filters }
        this.list = await api.requests.getIssuanceRequests(filters)
        this.isNoMoreEntries = false
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot load issuance request list.')
      }
      this.isLoaded = true
    },

    async onMoreButtonClick () {
      try {
        const oldLength = this.list.data.length
        this.list = await this.list.concatNext()
        this.isNoMoreEntries = oldLength === this.list.data.length
      } catch (error) {
        error.showMessage('Cannot fetch new entries. Please try again later')
      }
    },

    selectForRejection (item) {
      this.itemToReject = item
      this.rejectForm.reason = ''
    },

    clearRejectionSelection () {
      this.itemToReject = null
    },

    async reject (item) {
      this.isSubmitting = true
      try {
        await api.requests.reject(
          { reason: this.rejectForm.reason, isPermanent: true },
          item
        )
        this.getList()
        this.$store.dispatch('SET_INFO', 'Request rejected succesfully.')
      } catch (error) {
        error.showMessage()
      }
      this.isSubmitting = false
    },

    async fulfill (item) {
      this.isSubmitting = true
      try {
        await api.requests.approve(item)
        Bus.$emit('issuance:updateAssets')
        this.getList()
        this.$store.dispatch('SET_INFO', 'Request fulfilled succesfully.')
      } catch (error) {
        error.showMessage()
      }
      this.isSubmitting = false
    }
  },

  watch: {
    'filters.state' () { this.getList() },
    'filters.asset' () { this.getList() }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../assets/scss/colors";

.issuance-rl__filters-wrp {
  margin-bottom: 4rem;
}

.issuance-rl__filter {
  flex: 0.33;
}

.issuance-rl__reject-form-actions.app__form-actions {
  margin-top: 2rem;
}
</style>
