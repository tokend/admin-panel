<template>
  <div class="asset-requests-show app__block">
    <template v-if="isInitializing">
      <p class="text">
        {{ "asset-requests-show.loading" | globalize }}
      </p>
    </template>

    <template v-else-if="isInitFailed">
      <p class="text danger">
        {{ "asset-requests-show.fail-load" | globalize }}
      </p>
    </template>

    <div
      class="asset-requests-show"
      v-else-if="assetRequest.id && !isRejecting"
    >
      <h2>
        <template v-if="assetRequest.type === ASSET_REQUEST_TYPES.createAsset">
          {{ "asset-requests-show.asset-creation-request" | globalize }}
        </template>

        <template
          v-else-if="assetRequest.type === ASSET_REQUEST_TYPES.updateAsset"
        >
          {{ "asset-requests-show.asset-update-request" | globalize }}
        </template>

        <template v-else>
          {{ "asset-requests-show.asset-request" | globalize }}
        </template>
      </h2>
      <incoming-asset-request
        :asset-request="assetRequest"
        :is-update-request="
          assetRequest.type === ASSET_REQUEST_TYPES.updateAsset
        "
      />

      <template
        v-if="assetRequest.type === ASSET_REQUEST_TYPES.updateAsset"
      >
        <h2 class="asset-requests-show__previous-approved-request-title">
          <template>
            {{ "asset-requests-show.previous-approved-request" | globalize }}
          </template>
        </h2>
        <incoming-asset-request
          :asset-request="approvedAssetRequest"
          :is-update-request="
            assetRequest.type === ASSET_REQUEST_TYPES.updateAsset
          "
        />
      </template>
      <template v-if="assetRequest.stateI !== REQUEST_STATES.pending.stateI">
        <div class="asset-requests-show__row">
          <span class="asset-requests-show__key">
            {{ "asset-requests-show.request-state" | globalize }}
          </span>

          <span class="asset-requests-show__value">
            {{ verbozify(assetRequest.state) }}
          </span>
        </div>
      </template>

      <template v-if="assetRequest.stateI === REQUEST_STATES.rejected.stateI">
        <div class="asset-requests-show__reject-reason-wrp">
          <text-field
            :label="'asset-requests-show.lbl-reject-reason' | globalize"
            :value="assetRequest.rejectReason"
            :readonly="true"
          />
        </div>
      </template>

      <div
        class="asset-requests-show__buttons"
        v-if="assetRequest.stateI === REQUEST_STATES.pending.stateI"
      >
        <button
          class="app__btn"
          :disabled="isPending"
          @click="fulfill"
        >
          {{ "asset-requests-show.btn-fulfill" | globalize }}
        </button>

        <button
          class="app__btn-secondary"
          :disabled="isPending"
          @click="isRejecting = true"
        >
          {{ "asset-requests-show.btn-reject" | globalize }}
        </button>
      </div>
    </div>

    <asset-request-reject-form
      @close="isRejecting = false"
      :asset-request="assetRequest"
      v-else-if="isRejecting"
    />
  </div>
</template>

<script>
import TextField from '@comcom/fields/TextField'
import AssetRequestRejectForm from './components/AssetRequestRejectForm'
import IncomingAssetRequest from './IncomingAssetRequest'

import { confirmAction } from '@/js/modals/confirmation_message'

import localize from '@/utils/localize'
import { verbozify } from '@/utils/verbozify'
import safeGet from 'lodash/get'

import { AssetRequest } from '@/apiHelper/responseHandlers/requests/AssetRequest'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import {
  ASSET_REQUEST_TYPES,
  REQUEST_STATES,
} from '@/constants'

import { api } from '@/api'

// TODO: extract to AssetRequestForm
export default {
  components: {
    AssetRequestRejectForm,
    TextField,
    IncomingAssetRequest,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      assetRequest: {},
      approvedAssetRequest: {},
      isRejecting: false,
      isPending: false,
      isInitializing: false,
      isInitFailed: false,
      ASSET_REQUEST_TYPES,
      REQUEST_STATES,
      isUpdateRequest: false,
      reference: '',
    }
  },

  async created () {
    this.isInitializing = true
    try {
      const createAssetRequests =
        await api.getWithSignature('/v3/create_asset_requests', {
          include: ['request_details'],
        })
      const updateAssetRequests =
        await api.getWithSignature('/v3/update_asset_requests', {
          include: ['request_details'],
        })
      const allAssetRequests =
        createAssetRequests.data.concat(updateAssetRequests.data)
      allAssetRequests.find(item => {
        if (item.id === this.id) { this.reference = item.reference }
      })
      const currentAssetRequests =
        allAssetRequests.filter(item => item.reference === this.reference)
      this.assetRequest =
        new AssetRequest(currentAssetRequests[currentAssetRequests.length - 1])
      if (!this.assetRequest) {
        this.isInitFailed = true
      }
      if (this.assetRequest.type === this.ASSET_REQUEST_TYPES.updateAsset) {
        this.approvedAssetRequest =
          new AssetRequest(
            currentAssetRequests[currentAssetRequests.length - 2]
          )
        if (!this.approvedAssetRequest) {
          this.isInitFailed = true
        }
      }
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
      this.isInitFailed = true
    }
    this.isInitializing = false
  },

  methods: {
    verbozify,
    safeGet,

    async fulfill () {
      this.isPending = true
      if (await confirmAction()) {
        try {
          await this.assetRequest.fulfill()
          Bus.success('asset-requests-show.asset-created')
          this.$router.push({ name: 'assets' })
        } catch (error) {
          ErrorHandler.process(error)
        }
      }
      this.isPending = false
    },

    localizeAmount: localize,
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.asset-requests-show {
  max-width: 64rem;
}

.asset-requests-show__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.asset-requests-show__key {
  &--informative {
    color: $color-info;
    text-align: right;

    &:before {
      content: "\2713";
    }
  }
}

.asset-requests-show__value {
  max-width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}

.asset-requests-show__buttons {
  display: flex;
  margin-top: 4.5rem;

  & > button {
    flex: 0.33;
  }

  button:first-child {
    margin-right: 1rem;
  }
}

.asset-requests-show__reject-reason-wrp {
  margin-top: 2rem;
}

.asset-requests-show__previous-approved-request-title {
  padding-top: 4rem;
}
</style>
