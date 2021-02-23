<template>
  <div>
    <div class="incoming-asset-request__row">
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.asset-logo" | globalize }}
      </span>
      <template
        v-if="safeGet(
          assetRequest, 'operationDetails.creatorDetails.logo.key'
        )"
      >
        <img-getter
          class="incoming-asset-request__asset-logo"
          :file-key="assetRequest.operationDetails.creatorDetails.logo.key"
          alt="Asset logo"
        />
      </template>
      <template v-else>
        &mdash;
      </template>
    </div>
    <div class="incoming-asset-request__row">
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.asset-name" | globalize }}
      </span>
      <span
        class="incoming-asset-request__value"
        :title="assetRequest.operationDetails.creatorDetails.name"
      >
        {{ assetRequest.operationDetails.creatorDetails.name || '—' }}
      </span>
    </div>

    <div class="incoming-asset-request__row">
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.asset-code" | globalize }}
      </span>
      <span class="incoming-asset-request__value">
        {{ assetRequest.code || '—' }}
      </span>
    </div>

    <div
      class="incoming-asset-request__row"
      v-if="!isUpdateRequest"
    >
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.max-issuance" | globalize }}
      </span>
      <span class="incoming-asset-request__value">
        {{
          assetRequest.maxAmount
            ? assetRequest.maxAmount
            : '—' | formatMoney
        }}
      </span>
    </div>

    <div
      class="incoming-asset-request__row"
      v-if="!isUpdateRequest"
    >
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.issued-amount" | globalize }}
      </span>
      <span class="incoming-asset-request__value">
        {{ assetRequest.issuedAmount | formatMoney }}
      </span>
    </div>

    <div
      class="incoming-asset-request__row"
      v-if="!isUpdateRequest"
    >
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.pre-signer" | globalize }}
      </span>
      <email-getter
        v-if="assetRequest.signer"
        class="incoming-asset-request__value"
        :account-id="assetRequest.signer"
        is-titled
      />
      <span
        v-else
        class="incoming-asset-request__value"
        :title="assetRequest.signer"
      >
        —
      </span>
    </div>

    <div
      class="incoming-asset-request__row"
      v-if="!isUpdateRequest"
    >
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.request-type" | globalize }}
      </span>
      <span class="incoming-asset-request__value">
        {{ assetRequest.assetType | assetTypeToString }}
      </span>
    </div>

    <template v-if="assetRequest.policies">
      <div
        class="incoming-asset-request__rowincoming-asset-request__row--policy"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.policies" | globalize }}
        </span>
        <div class="incoming-asset-request__policies-wrapper">
          <template v-for="(policy, key) in ASSET_POLICIES">
            <!-- eslint-disable max-len -->
            <span
              :key="key"
              class="incoming-asset-request__key incoming-asset-request__key--informative"
              v-if="assetRequest.policies & policy"
            >
              {{ policy | assetPoliciesFilter }}
            </span>
            <!-- eslint-enable max-len -->
          </template>
        </div>
      </div>
    </template>

    <div class="incoming-asset-request__row">
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.terms" | globalize }}
      </span>
      <span class="incoming-asset-request__value">
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
            {{ "incoming-asset-request.opn-file" | globalize }}
          </user-doc-link-getter>
        </template>
        <template v-else>
          &mdash;
        </template>
      </span>
    </div>

    <template v-if="assetRequest.stellarAssetCode">
      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.stellar-asset-code" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.stellarAssetCode }}
        </span>
      </div>

      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.stellar-asset-type" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.stellarAssetType | stellarAssetTypesFilter }}
        </span>
      </div>

      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.stellar-withdraw" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.stellarWithdraw | yesNoFilter }}
        </span>
      </div>

      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.stellar-deposit" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.stellarDeposit | yesNoFilter }}
        </span>
      </div>
    </template>

    <template v-if="assetRequest.erc20AssetAddress">
      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.erc20-asset-address" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.erc20AssetAddress }}
        </span>
      </div>

      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.erc20-withdraw" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.erc20Withdraw | yesNoFilter }}
        </span>
      </div>

      <div
        class="incoming-asset-request__row"
      >
        <span class="incoming-asset-request__key">
          {{ "incoming-asset-request.erc20-deposit" | globalize }}
        </span>
        <span class="incoming-asset-request__value">
          {{ assetRequest.erc20Deposit | yesNoFilter }}
        </span>
      </div>
    </template>

    <div class="incoming-asset-request__row">
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.creation-data" | globalize }}
      </span>
      <span>
        {{ assetRequest.creationDate | formatDate }}
      </span>
    </div>

    <div class="incoming-asset-request__row">
      <span class="incoming-asset-request__key">
        {{ "incoming-asset-request.update-data" | globalize }}
      </span>
      <span>
        {{ assetRequest.updateDate | formatDate }}
      </span>
    </div>
  </div>
</template>

<script>
import { ImgGetter, EmailGetter, UserDocLinkGetter } from '@comcom/getters'

import safeGet from 'lodash/get'

import {
  ASSET_POLICIES,
} from '@/constants'

export default {
  components: {
    ImgGetter,
    EmailGetter,
    UserDocLinkGetter,
  },

  props: {
    assetRequest: { type: Object, required: true },
    isUpdateRequest: { type: Boolean, default: false },
  },

  data () {
    return {
      ASSET_POLICIES,
    }
  },
  methods: {
    safeGet,
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.incoming-asset-request {
  max-width: 64rem;
}

.incoming-asset-request__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.incoming-asset-request__key {
  &--informative {
    color: $color-info;
    text-align: right;

    &:before {
      content: "\2713";
    }
  }
}

.incoming-asset-request__value {
  max-width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}

.incoming-asset-request__buttons {
  display: flex;
  margin-top: 4.5rem;

  & > button {
    flex: 0.33;
  }

  button:first-child {
    margin-right: 1rem;
  }
}

.incoming-asset-request__reject-reason-wrp {
  margin-top: 2rem;
}

.incoming-asset-request__asset-logo {
  max-width: 16rem;
  max-height: 16rem;
}

.incoming-asset-request__policies-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
