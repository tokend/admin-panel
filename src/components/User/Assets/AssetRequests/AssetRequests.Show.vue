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
      <div class="asset-requests-show__row">
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.asset-logo" | globalize }}
        </span>
        <template
          v-if="safeGet(
            assetRequest, 'operationDetails.creatorDetails.logo.key'
          )"
        >
          <img-getter
            class="asset-requests-show__asset-logo"
            :file-key="assetRequest.operationDetails.creatorDetails.logo.key"
            alt="Asset logo"
          />
        </template>
        <template v-else>
          &mdash;
        </template>
      </div>
      <div class="asset-requests-show__row">
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.asset-name" | globalize }}
        </span>
        <span
          class="asset-requests-show__value"
          :title="assetRequest.operationDetails.creatorDetails.name"
        >
          {{ assetRequest.operationDetails.creatorDetails.name || '—' }}
        </span>
      </div>

      <div class="asset-requests-show__row">
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.asset-code" | globalize }}
        </span>
        <span class="asset-requests-show__value">
          {{ assetRequest.code || '—' }}
        </span>
      </div>

      <div
        class="asset-requests-show__row"
        v-if="assetRequest.type !== ASSET_REQUEST_TYPES.updateAsset"
      >
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.max-issuance" | globalize }}
        </span>
        <span
          class="asset-requests-show__value"
          :title="maxAmount"
        >
          {{ maxAmount }}
        </span>
      </div>

      <div
        class="asset-requests-show__row"
        v-if="assetRequest.type !== ASSET_REQUEST_TYPES.updateAsset"
      >
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.issued-amount" | globalize }}
        </span>
        <span class="asset-requests-show__value">
          {{ assetRequest.issuedAmount | formatMoney }}
        </span>
      </div>

      <div
        class="asset-requests-show__row"
        v-if="assetRequest.type !== ASSET_REQUEST_TYPES.updateAsset"
      >
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.pre-signer" | globalize }}
        </span>
        <email-getter
          v-if="assetRequest.signer"
          class="asset-requests-show__value"
          :account-id="assetRequest.signer"
          is-titled
        />
        <span
          v-else
          class="asset-requests-show__value"
          :title="assetRequest.signer"
        >
          —
        </span>
      </div>

      <div
        class="asset-requests-show__row"
        v-if="assetRequest.type !== ASSET_REQUEST_TYPES.updateAsset"
      >
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.request-type" | globalize }}
        </span>
        <span class="asset-requests-show__value">
          {{ assetRequest.assetType | assetTypeToString }}
        </span>
      </div>

      <template v-if="assetRequest.policies">
        <div class="asset-requests-show__row asset-requests-show__row--policy">
          <span class="asset-requests-show__key">
            {{ "asset-requests-show.policies" | globalize }}
          </span>
          <div class="asset-requests-show__policies-wrapper">
            <template v-for="(policy, key) in ASSET_POLICIES">
              <!-- eslint-disable max-len -->
              <span
                :key="key"
                class="asset-requests-show__key asset-requests-show__key--informative"
                v-if="assetRequest.policies & policy"
              >
                {{ policy | assetPoliciesFilter }}
              </span>
              <!-- eslint-enable max-len -->
            </template>
          </div>
        </div>
      </template>

      <div class="asset-requests-show__row">
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.terms" | globalize }}
        </span>
        <span class="asset-requests-show__value">
          <template
            v-if="safeGet(
              assetRequest, 'operationDetails.creatorDetails.terms.key'
            )"
            :mime-type="safeGet(
              assetRequest,
              'operationDetails.details.terms.mimeType'
            )"
          >
            <user-doc-link-getter
              :file-key="assetRequest.operationDetails.creatorDetails.terms.key"
            >
              {{ "asset-requests-show.opn-file" | globalize }}
            </user-doc-link-getter>
          </template>
          <template v-else>
            &mdash;
          </template>
        </span>
      </div>

      <template v-if="assetRequest.stellarAssetCode">
        <div
          class="asset-requests-show__row"
        >
          <span class="asset-requests-show__key">
            {{ "asset-requests-show.stellar-asset-code" | globalize }}
          </span>
          <span class="asset-requests-show__value">
            {{ assetRequest.stellarAssetCode }}
          </span>
        </div>

        <div
          class="asset-requests-show__row"
        >
          <span class="asset-requests-show__key">
            {{ "asset-requests-show.stellar-asset-type" | globalize }}
          </span>
          <span class="asset-requests-show__value">
            {{ assetRequest.stellarAssetType | stellarAssetTypesFilter }}
          </span>
        </div>

        <div
          class="asset-requests-show__row"
        >
          <span class="asset-requests-show__key">
            {{ "asset-requests-show.stellar-withdraw" | globalize }}
          </span>
          <span class="asset-requests-show__value">
            {{ assetRequest.stellarWithdraw | yesNoFilter }}
          </span>
        </div>

        <div
          class="asset-requests-show__row"
        >
          <span class="asset-requests-show__key">
            {{ "asset-requests-show.stellar-deposit" | globalize }}
          </span>
          <span class="asset-requests-show__value">
            {{ assetRequest.stellarDeposit | yesNoFilter }}
          </span>
        </div>
      </template>

      <div class="asset-requests-show__row">
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.creation-data" | globalize }}
        </span>
        <span>
          {{ assetRequest.creationDate | formatDate }}
        </span>
      </div>

      <div class="asset-requests-show__row">
        <span class="asset-requests-show__key">
          {{ "asset-requests-show.update-data" | globalize }}
        </span>
        <span>
          {{ assetRequest.updateDate | formatDate }}
        </span>
      </div>

      <!-- eslint-disable-next-line max-len -->
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

      <!-- eslint-disable-next-line max-len -->
      <template v-if="assetRequest.stateI === REQUEST_STATES.rejected.stateI">
        <div class="asset-requests-show__reject-reason-wrp">
          <text-field
            :label="'asset-requests-show.lbl-reject-reason' | globalize"
            :value="assetRequest.rejectReason"
            :readonly="true"
          />
        </div>
      </template>

      <!-- eslint-disable max-len -->
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
    <!-- eslint-enable max-len -->

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

import { ImgGetter, EmailGetter, UserDocLinkGetter } from '@comcom/getters'

import { confirmAction } from '@/js/modals/confirmation_message'

import { verbozify } from '@/utils/verbozify'
import safeGet from 'lodash/get'

import { AssetRequest } from '@/apiHelper/responseHandlers/requests/AssetRequest'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import {
  ASSET_POLICIES,
  ASSET_REQUEST_TYPES,
  REQUEST_STATES,
} from '@/constants'

import { api } from '@/api'

import { formatMoney } from '@/components/App/filters/formatMoney'

// TODO: extract to AssetRequestForm
export default {
  components: {
    AssetRequestRejectForm,
    TextField,
    ImgGetter,
    EmailGetter,
    UserDocLinkGetter,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      assetRequest: {},
      isRejecting: false,
      isPending: false,
      isInitializing: false,
      isInitFailed: false,
      ASSET_POLICIES,
      ASSET_REQUEST_TYPES,
      REQUEST_STATES,
    }
  },

  computed: {
    maxAmount () {
      return this.assetRequest.maxAmount
        ? formatMoney(this.assetRequest.maxAmount)
        : '—'
    },
  },

  async created () {
    this.isInitializing = true

    try {
      const { data } = await api.getWithSignature(`/v3/requests/${this.id}`, {
        include: ['request_details'],
      })
      this.assetRequest = new AssetRequest(data)
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

.asset-requests-show__asset-logo {
  max-width: 16rem;
  max-height: 16rem;
}

.asset-requests-show__policies-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
