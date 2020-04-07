<template>
  <div class="sale-rm-details-tab">
    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          {{ "sale-request-manager-details-tab.label" | globalize }}
        </label>
        <ul class="key-value-list">
          <li>
            <span>
              {{ "sale-request-manager-details-tab.requestor" | globalize }}
            </span>
            <email-getter
              :account-id="request.sale.requestor.id"
              is-titled
            />
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.request-state" | globalize }}
            </span>
            <span>
              {{ request.sale.stateI | globalizeRequestStateI }}
            </span>
          </li>

          <li>
            <span>
              {{ "sale-request-manager-details-tab.requested-at" | globalize }}
            </span>
            <span>
              {{ request.sale.createdAt | formatDate }}
            </span>
          </li>
        </ul>

        <template v-if="request.sale.rejectReason">
          <label class="data-caption danger">
            {{ "sale-request-manager-details-tab.reject-reason" | globalize }}
          </label>
          <p class="text">
            {{ request.sale.rejectReason }}
          </p>
        </template>
      </div>

      <div class="sale-rm-details-tab__row-item" />
    </div>

    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          {{ "sale-request-manager-details-tab.asset-details" | globalize }}
        </label>
        <ul class="key-value-list">
          <li>
            <span>
              {{ "sale-request-manager-details-tab.name" | globalize }}
            </span>
            <span>
              <template v-if="safeGet(request, 'asset.details.name')">
                {{ request.asset.details.name }}
              </template>
              <template v-else>
                &mdash;
              </template>
            </span>
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.code" | globalize }}
            </span>
            <span>{{ request.asset.id }}</span>
          </li>
          <li>
            <span>
              <!-- eslint-disable-next-line max-len -->
              {{ "sale-request-manager-details-tab.initial-preissued-amount" | globalize }}
            </span>
            <span :title="request.asset.maxIssuanceAmount | formatMoney">
              {{ request.asset.maxIssuanceAmount | formatMoney }}
            </span>
          </li>
          <li>
            <span>
              <!-- eslint-disable-next-line max-len -->
              {{ "sale-request-manager-details-tab.max-issuance-amount" | globalize }}
            </span>
            <span :title="request.asset.maxIssuanceAmount | formatMoney">
              {{ request.asset.maxIssuanceAmount | formatMoney }}
            </span>
          </li>
          <li>
            <span>
              <!-- eslint-disable-next-line max-len -->
              {{ "sale-request-manager-details-tab.preissuance-signer" | globalize }}
            </span>
            <email-getter
              :account-id="request.asset.preIssuanceAssetSigner"
              is-titled
            />
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.policies" | globalize }}
            </span>
            <asset-policies-formatter
              :policy-mask="request.asset.policies.value"
            />
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.terms" | globalize }}
            </span>
            <span>
              <template v-if="safeGet(request, 'asset.details.terms.key')">
                <doc-link-getter :file-key="request.asset.details.terms.key">
                  {{ "sale-request-manager-details-tab.open-file" | globalize }}
                </doc-link-getter>
              </template>

              <template v-else>
                {{ "sale-request-manager-details-tab.no-document" | globalize }}
              </template>
            </span>
          </li>
          <template v-if="safeGet(request, 'asset.details.stellar.assetCode')">
            <li>
              <span>
                <!-- eslint-disable-next-line max-len -->
                {{ "sale-request-manager-details-tab.stellar-asset-code" | globalize }}
              </span>
              <span>{{ request.asset.details.stellar.assetCode }}</span>
            </li>
            <li>
              <!-- eslint-disable-next-line max-len -->
              <span>{{ "sale-request-manager-details-tab.stellar-asset-type" | globalize }}</span>
              <span>
                {{ request.asset.details.stellar.assetType
                  | stellarAssetTypesFilter }}
              </span>
            </li>
            <li>
              <!-- eslint-disable-next-line max-len -->
              <span>{{ "sale-request-manager-details-tab.stellar-withdraw" | globalize }}</span>
              <span>
                {{ request.asset.details.stellar.withdraw | yesNoFilter }}
              </span>
            </li>
            <li>
              <!-- eslint-disable-next-line max-len -->
              <span>{{ "sale-request-manager-details-tab.stellar-deposit" | globalize }}</span>
              <span>
                {{ request.asset.details.stellar.deposit | yesNoFilter }}
              </span>
            </li>
          </template>
        </ul>
      </div>

      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          {{ "sale-request-manager-details-tab.asset-logo" | globalize }}
        </label>
        <template v-if="safeGet(request, 'asset.details.logo.key')">
          <img-getter
            class="sale-rm-details-tab__asset-logo"
            :file-key="request.asset.details.logo.key"
            alt="Asset logo"
          />
        </template>
        <template v-else>
          <p>{{ "sale-request-manager-details-tab.no-logo" | globalize }}</p>
        </template>
      </div>
    </div>

    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          {{ "sale-request-manager-details-tab.sale-details" | globalize }}
        </label>
        <ul class="key-value-list">
          <li>
            <span>
              {{ "sale-request-manager-details-tab.name" | globalize }}
            </span>
            <span>
              <template v-if="safeGet(saleDetails, 'creatorDetails.name')">
                {{ saleDetails.creatorDetails.name }}
              </template>
              <template v-else>
                <!-- eslint-disable-next-line max-len -->
                {{ "sale-request-manager-details-tab.not-provided-yet" | globalize }}
              </template>
            </span>
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.type" | globalize }}
            </span>
            <span>
              {{ safeGet(saleDetails, 'saleType.value')
                | localizedSaleTypesFilter }}
            </span>
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.whitelisted" | globalize }}
            </span>
            <span>{{ isSaleWhitelisted | yesNoFilter }}</span>
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.start-time" | globalize }}
            </span>
            <span>
              {{ saleDetails.startTime | formatDate }}
            </span>
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.end-time" | globalize }}
            </span>
            <span>
              {{ saleDetails.endTime | formatDate }}
            </span>
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.soft-cap" | globalize }}
            </span>
            <!-- eslint-disable -->
            <span :title="formatSaleCap(saleDetails.softCap) | formatMoney">
              {{ formatSaleCap(saleDetails.softCap) | formatMoney }}
            </span>
            <!-- eslint-enable -->
          </li>
          <li>
            <span>
              {{ "sale-request-manager-details-tab.hard-cap" | globalize }}
            </span>
            <!-- eslint-disable -->
            <span :title="formatSaleCap(saleDetails.hardCap) | formatMoney">
              {{ formatSaleCap(saleDetails.hardCap) | formatMoney }}
            </span>
            <!-- eslint-enable -->
          </li>
          <li>
            <span>
              <!-- eslint-disable-next-line max-len -->
              {{ "sale-request-manager-details-tab.max-amount-sold" | globalize({
                saleDetailsBaseAssetId :saleDetails.baseAsset.id
              })
              }}
            </span>
            <span :title="formatbaseAssetForHardCap | formatMoney">
              {{ formatbaseAssetForHardCap | formatMoney }}
            </span>
          </li>
        </ul>

        <label class="data-caption">
          {{ "sale-request-manager-details-tab.short-description" | globalize }}
        </label>
        <p
          class="text sale-rm-details-tab__short-description"
          :title="safeGet(saleDetails, 'creatorDetails.shortDescription')"
        >
          <template
            v-if="safeGet(saleDetails, 'creatorDetails.shortDescription')"
          >
            {{ saleDetails.creatorDetails.shortDescription }}
          </template>
          <template v-else>
            <!-- eslint-disable-next-line max-len -->
            {{ "sale-request-manager-details-tab.not-provided-yet" | globalize }}
          </template>
        </p>
      </div>

      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          {{ "sale-request-manager-details-tab.sale-logo" | globalize }}
        </label>
        <template v-if="safeGet(saleDetails, 'creatorDetails.logo.key')">
          <img-getter
            class="sale-rm-details-tab__sale-logo"
            :file-key="saleDetails.creatorDetails.logo.key"
            alt="Sale logo"
          />
        </template>
        <template v-else>
          <p>
            {{ "sale-request-manager-details-tab.no-logo" | globalize }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { EmailGetter, ImgGetter, DocLinkGetter } from '@comcom/getters'
import { AssetPoliciesFormatter } from '@comcom/formatters'

import { SALE_DEFINITION_TYPES } from '@/constants'

import get from 'lodash/get'

export default {
  components: {
    EmailGetter,
    ImgGetter,
    DocLinkGetter,
    AssetPoliciesFormatter,
  },

  props: {
    request: { type: Object, required: true },
  },

  computed: {
    saleDetails () {
      return this.request.sale.requestDetails
    },

    isSaleWhitelisted () {
      return this.saleDetails.accessDefinitionType.value ===
        SALE_DEFINITION_TYPES.whitelist
    },

    formatbaseAssetForHardCap () {
      return {
        value: this.saleDetails.baseAssetForHardCap,
        currency: this.saleDetails.baseAsset.id,
      }
    },
  },

  methods: {
    safeGet: get,

    formatSaleCap (cap) {
      return {
        value: cap,
        currency: this.saleDetails.defaultQuoteAsset.id,
      }
    },
  },
}
</script>

<style scoped lang="scss">
.sale-rm-details-tab__row {
  display: flex;

  & + & {
    margin-top: 4rem;
  }
}

.sale-rm-details-tab__row-item {
  flex: 1;
  min-width: 0;

  & + & {
    margin-left: 4rem;
  }
}

.sale-rm-details-tab__asset-logo,
.sale-rm-details-tab__sale-logo {
  margin-top: 0.5rem;
}

.sale-rm-details-tab__asset-logo {
  max-width: 6.4rem;
  max-height: 6.4rem;
}

.sale-rm-details-tab__sale-logo {
  max-width: 20rem;
  max-height: 20rem;
}

.sale-rm-details-tab__short-description {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
