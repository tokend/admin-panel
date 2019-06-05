<template>
  <div class="sale-manager-details-tab">
    <div class="sale-manager-details-tab__row">
      <template v-if="isAssetLoaded">
        <div class="sale-manager-details-tab__row-item">
          <ul class="key-value-list">
            <label class="data-caption">
              Asset details
            </label>
            <li>
              <span>Name</span>
              <span>{{ asset.details.name || '&mdash;' }}</span>
            </li>
            <li>
              <span>Code</span>
              <span>{{ asset.id }}</span>
            </li>
            <li>
              <span>Owner</span>
              <email-getter
                :account-id="asset.owner.id"
                is-titled
              />
            </li>
            <li>
              <span>Preissued asset signer</span>
              <email-getter
                :account-id="asset.preIssuanceAssetSigner"
                is-titled
              />
            </li>
            <li>
              <span>Max issuance amount</span>
              <asset-amount-formatter :amount="asset.maxIssuanceAmount" />
            </li>
            <li>
              <span>Pending issuance</span>
              <asset-amount-formatter :amount="asset.pendingIssuance" />
            </li>
            <li>
              <span>Issued</span>
              <asset-amount-formatter :amount="asset.issued" />
            </li>
            <li>
              <span>Available for issuance</span>
              <asset-amount-formatter :amount="asset.availableForIssuance" />
            </li>
            <li>
              <span>Policies</span>
              <asset-policies-formatter :policy-mask="asset.policies.value" />
            </li>
            <li>
              <span>Terms</span>
              <span>
                <template v-if="asset.details.terms && asset.details.terms.key">
                  <doc-link-getter :file-key="asset.details.terms.key">
                    Open file
                  </doc-link-getter>
                </template>

                <template v-else>
                  (No document)
                </template>
              </span>
            </li>
          </ul>
        </div>

        <div class="sale-manager-details-tab__row-item">
          <label class="data-caption">
            Asset logo
          </label>
          <template v-if="asset.details.logo && asset.details.logo.key">
            <img-getter
              class="sale-manager-details-tab__asset-logo"
              :file-key="asset.details.logo.key"
              alt="Asset logo"
            />
          </template>
          <template v-else>
            (No logo)
          </template>
        </div>
      </template>

      <template v-else-if="isAssetFailed">
        <p class="text danger">
          An error occurred while fetching asset. Please try again later.
        </p>
      </template>

      <template v-else>
        <p class="text">
          Loading...
        </p>
      </template>
    </div>

    <div class="sale-manager-details-tab__row">
      <div class="sale-manager-details-tab__row-item">
        <ul class="key-value-list">
          <label class="data-caption">
            Sale details
          </label>
          <li>
            <span>Name</span>
            <span>{{ sale.details.name || '&mdash;' }}</span>
          </li>
          <li>
            <span>State</span>
            <span>
              <template v-if="sale.saleState.value === SALE_STATES.open">
                Open
              </template>
              <template v-else-if="sale.saleState.value === SALE_STATES.closed">
                Closed
              </template>
              <template
                v-else-if="sale.saleState.value === SALE_STATES.cancelled"
              >
                Cancelled
              </template>
            </span>
          </li>
          <li>
            <span>Owner</span>
            <email-getter
              :account-id="sale.owner.id"
              is-titled
            />
          </li>
          <li>
            <span>Start time</span>
            <date-formatter
              :date="sale.startTime"
              format="DD MMM YYYY HH:mm:ss"
            />
          </li>
          <li>
            <span>End time</span>
            <date-formatter
              :date="sale.endTime"
              format="DD MMM YYYY HH:mm:ss"
            />
          </li>
        </ul>

        <ul
          class="key-value-list"
          v-for="(item, index) in sale.quoteAssets"
          :key="index"
        >
          <span>
            <!-- to padding of label.data-caption -->
          </span>
          <label class="data-caption">
            {{ item.asset.id }} progress
          </label>
          <li>
            <span>Price (per {{ sale.baseAsset.id }})</span>
            <asset-amount-formatter :amount="item.price" />
          </li>
          <li>
            <span>Current cap</span>
            <asset-amount-formatter :amount="item.currentCap" />
          </li>
          <li>
            <!-- eslint-disable-next-line max-len -->
            <span :title="`Current cap + current caps of the other acceptable assets in the ${item.asset.id} equivalent`">
              Total current cap
            </span>
            <asset-amount-formatter :amount="item.totalCurrentCap" />
          </li>
          <li>
            <!-- eslint-disable-next-line max-len -->
            <span :title="`Hard cap of the sale in the ${item.asset.id} equivalent`">
              Hard cap
            </span>
            <asset-amount-formatter :amount="item.hardCap" />
          </li>
        </ul>

        <ul class="key-value-list">
          <span>
            <!-- to padding of label.data-caption -->
          </span>
          <label class="data-caption">
            Total progress
          </label>
          <li>
            <span>Assets sold</span>
            <asset-amount-formatter
              :amount="sale.baseCurrentCap"
              :asset="sale.baseAsset.id"
            />
          </li>
          <li>
            <span>Current cap</span>
            <asset-amount-formatter
              :amount="sale.defaultQuoteAsset.currentCap"
              :asset="sale.defaultQuoteAsset.asset.id"
            />
          </li>
          <li>
            <span>Soft cap</span>
            <asset-amount-formatter
              :amount="sale.defaultQuoteAsset.softCap"
              :asset="sale.defaultQuoteAsset.asset.id"
            />
          </li>
          <li>
            <span>Hard cap</span>
            <asset-amount-formatter
              :amount="sale.defaultQuoteAsset.hardCap"
              :asset="sale.defaultQuoteAsset.asset.id"
            />
          </li>
          <li>
            <span>Max {{ sale.baseAsset.id }} amount to be sold</span>
            <asset-amount-formatter
              :amount="sale.baseHardCap"
              :asset="sale.baseAsset.id"
            />
          </li>
        </ul>

        <label class="data-caption">
          Short description
        </label>
        <p class="text">
          {{ sale.details.shortDescription }}
        </p>
      </div>

      <div class="sale-manager-details-tab__row-item">
        <label class="data-caption">
          Sale logo
        </label>
        <template v-if="sale.details.logo && sale.details.logo.key">
          <img-getter
            class="sale-manager-details-tab__sale-logo"
            :file-key="sale.details.logo.key"
            alt="Sale logo"
          />
        </template>
        <template v-else>
          (No logo)
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { EmailGetter, ImgGetter, DocLinkGetter } from '@comcom/getters'
import {
  AssetAmountFormatter,
  DateFormatter,
  AssetPoliciesFormatter,
} from '@comcom/formatters'

import { SALE_STATES } from '@/constants'
import { api } from '@/api'

export default {
  components: {
    AssetAmountFormatter,
    DateFormatter,
    AssetPoliciesFormatter,
    EmailGetter,
    ImgGetter,
    DocLinkGetter,
  },

  props: {
    sale: { type: Object, required: true },
  },

  data () {
    return {
      SALE_STATES,
      asset: {},
      isAssetLoaded: false,
      isAssetFailed: false,
    }
  },

  created () {
    this.getAsset(this.sale)
  },

  methods: {
    async getAsset ({ baseAsset }) {
      try {
        const endpoint = `/v3/assets/${baseAsset.id}`
        const { data } = await api.getWithSignature(endpoint, {
          include: ['owner'],
        })
        this.asset = data
        this.isAssetLoaded = true
      } catch (error) {
        this.isAssetFailed = true
      }
    },
  },
}
</script>

<style scoped lang="scss">
.sale-manager-details-tab__row {
  display: flex;

  & + & {
    margin-top: 4rem;
  }
}

.sale-manager-details-tab__row-item {
  flex: 1;

  & + & {
    margin-left: 4rem;
  }
}

.sale-manager-details-tab__asset-logo,
.sale-manager-details-tab__sale-logo {
  margin-top: 0.5rem;
}

.sale-manager-details-tab__asset-logo {
  max-width: 6.4rem;
  max-height: 6.4rem;
}

.sale-manager-details-tab__sale-logo {
  max-width: 20rem;
  max-height: 20rem;
}
</style>
