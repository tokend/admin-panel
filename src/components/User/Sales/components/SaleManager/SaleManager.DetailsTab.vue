<template>
  <div class="sale-manager-details-tab">
    <div class="sale-manager-details-tab__row">
      <template v-if="isAssetLoaded">
        <div class="sale-manager-details-tab__row-item">
          <ul class="key-value-list">
            <label class="data-caption">
              {{ "sale-manager-details-tab.label-asset-details" | globalize }}
            </label>
            <li>
              <span>{{ "sale-manager-details-tab.name" | globalize }}</span>
              <span>{{ asset.details.name || '&mdash;' }}</span>
            </li>
            <li>
              <span>{{ "sale-manager-details-tab.code" | globalize }}</span>
              <span>{{ asset.id }}</span>
            </li>
            <li>
              <span>{{ "sale-manager-details-tab.owner" | globalize }}</span>
              <email-getter
                :account-id="asset.owner.id"
                is-titled
              />
            </li>
            <li>
              <span>
                <!-- eslint-disable-next-line max-len -->
                {{ "sale-manager-details-tab.preissued-asset-signer" | globalize }}
              </span>
              <email-getter
                :account-id="asset.preIssuanceAssetSigner"
                is-titled
              />
            </li>
            <li>
              <span>
                {{ "sale-manager-details-tab.max-issuance-amount" | globalize }}
              </span>
              <span :title="asset.maxIssuanceAmount | formatNumber">
                {{ asset.maxIssuanceAmount | formatNumber }}
              </span>
            </li>
            <li>
              <span>
                {{ "sale-manager-details-tab.pending-issuance" | globalize }}
              </span>
              <span :title="asset.pendingIssuance | formatNumber">
                {{ asset.pendingIssuance | formatNumber }}
              </span>
            </li>
            <li>
              <span>{{ "sale-manager-details-tab.issued" | globalize }}</span>
              <span :title="asset.issued">
                {{ asset.issued | formatNumber }}
              </span>
            </li>
            <li>
              <!-- eslint-disable-next-line max-len -->
              <span>{{ "sale-manager-details-tab.available-for-issuance" | globalize }}</span>
              <span :title="asset.availableForIssuance">
                {{ asset.availableForIssuance | formatNumber }}
              </span>
            </li>
            <li>
              <span>{{ "sale-manager-details-tab.policies" | globalize }}</span>
              <asset-policies-formatter :policy-mask="asset.policies.value" />
            </li>
            <li>
              <span>{{ "sale-manager-details-tab.terms" | globalize }}</span>
              <span>
                <template v-if="asset.details.terms && asset.details.terms.key">
                  <doc-link-getter :file-key="asset.details.terms.key">
                    {{ "sale-manager-details-tab.open-file" | globalize }}
                  </doc-link-getter>
                </template>

                <template v-else>
                  {{ "sale-manager-details-tab.no-document" | globalize }}
                </template>
              </span>
            </li>
            <template
              v-if="get(asset, 'details.stellar.assetCode')"
            >
              <li>
                <span>
                  {{ "sale-manager-details-tab.no-document" | globalize }}
                </span>
                <span>{{ asset.details.stellar.assetCode }}</span>
              </li>
              <li>
                <span>
                  <!-- eslint-disable-next-line max-len -->
                  {{ "sale-manager-details-tab.stellar-asset-type" | globalize }}
                </span>
                <span>
                  {{
                    asset.details.stellar.assetType | stellarAssetTypesFilter
                  }}
                </span>
              </li>
              <li>
                <span>
                  {{ "sale-manager-details-tab.stellar-withdraw" | globalize }}
                </span>
                <span>
                  {{ asset.details.stellar.withdraw | yesNoFilter }}
                </span>
              </li>
              <li>
                <span>
                  {{ "sale-manager-details-tab.stellar-deposit" | globalize }}
                </span>
                <span>
                  {{ asset.details.stellar.deposit | yesNoFilter }}
                </span>
              </li>
            </template>
          </ul>
        </div>

        <div class="sale-manager-details-tab__row-item">
          <label class="data-caption">
            {{ "sale-manager-details-tab.asset-logo" | globalize }}
          </label>
          <template v-if="asset.details.logo && asset.details.logo.key">
            <img-getter
              class="sale-manager-details-tab__asset-logo"
              :file-key="asset.details.logo.key"
              alt="Asset logo"
            />
          </template>
          <template v-else>
            {{ "sale-manager-details-tab.no-logo" | globalize }}
          </template>
        </div>
      </template>

      <template v-else-if="isAssetFailed">
        <p class="text danger">
          {{ "sale-manager-details-tab.error-fetch" | globalize }}
        </p>
      </template>

      <template v-else>
        <p class="text">
          {{ "sale-manager-details-tab.loading" | globalize }}
        </p>
      </template>
    </div>

    <div class="sale-manager-details-tab__row">
      <div class="sale-manager-details-tab__row-item">
        <ul class="key-value-list">
          <label class="data-caption">
            {{ "sale-manager-details-tab.sale-details" | globalize }}
          </label>
          <li>
            <span>{{ "sale-manager-details-tab.name" | globalize }}</span>
            <span>{{ sale.details.name || '&mdash;' }}</span>
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.type" | globalize }}</span>
            <span>
              {{ sale.saleType.value | localizedSaleTypesFilter }}
            </span>
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.state" | globalize }}</span>
            <span>
              <template v-if="sale.saleState.value === SALE_STATES.open">
                {{ "sale-manager-details-tab.open" | globalize }}
              </template>
              <template v-else-if="sale.saleState.value === SALE_STATES.closed">
                {{ "sale-manager-details-tab.closed" | globalize }}
              </template>
              <template
                v-else-if="sale.saleState.value === SALE_STATES.cancelled"
              >
                {{ "sale-manager-details-tab.canceled" | globalize }}
              </template>
            </span>
          </li>
          <li>
            <span>
              {{ "sale-manager-details-tab.whitelisted" | globalize }}
            </span>
            <span>
              {{ isSaleWhitelisted | yesNoFilter }}
            </span>
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.owner" | globalize }}</span>
            <email-getter
              :account-id="sale.owner.id"
              is-titled
            />
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.start-time" | globalize }}</span>
            <span>
              {{ sale.startTime | formatDate }}
            </span>
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.end-time" | globalize }}</span>
            <span>
              {{ sale.endTime | formatDate }}
            </span>
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
            {{ "sale-manager-details-tab.progress" | globalize({
              assetId: item.asset.id
            })
            }}
          </label>
          <li>
            <span>
              {{ "sale-manager-details-tab.price-per-sale" | globalize({
                assetId: sale.baseAsset.id
              })
              }}
            </span>
            <span :title="item.price">{{ item.price | formatNumber }}</span>
          </li>
          <li>
            <span>
              {{ "sale-manager-details-tab.current-cap" | globalize }}
            </span>
            <span :title="item.currentCap">
              {{ item.currentCap | formatNumber }}
            </span>
          </li>
          <li>
            <!-- eslint-disable -->
            <span
              :title="'sale-manager-details-tab.title-assets-equivalent' | globalize({
                itemAssetId: item.asset.id
              })"
            >
              {{ "sale-manager-details-tab.total-current-cap" | globalize }}
            </span>
            <!-- eslint-enable -->
            <span :title="item.totalCurrentCap">
              {{ item.totalCurrentCap | formatNumber }}
            </span>
          </li>
          <li>
            <!-- eslint-disable -->
            <span
              :title="'sale-manager-details-tab.title-hard-cup-equivalent' | globalize({
                itemAssetId: item.asset.id
              })"
            >
              {{ "sale-manager-details-tab.hard-cap" | globalize }}
            </span>
            <!-- eslint-enable -->
            <span :title="item.hardCap">{{ item.hardCap | formatNumber }}</span>
          </li>
        </ul>

        <ul class="key-value-list">
          <span>
            <!-- to padding of label.data-caption -->
          </span>
          <label class="data-caption">
            {{ "sale-manager-details-tab.total-progress" | globalize }}
          </label>
          <li>
            <span>
              {{ "sale-manager-details-tab.current-cap" | globalize }}
            </span>
            <!-- eslint-disable -->
            <span :title="formatAssetCap(sale.defaultQuoteAsset.currentCap) | formatMoney">
              {{ formatAssetCap(sale.defaultQuoteAsset.currentCap) | formatMoney }}
            </span>
            <!-- eslint-enable -->
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.soft-cap" | globalize }}</span>
            <!-- eslint-disable-next-line max-len -->
            <span :title="formatAssetCap(sale.defaultQuoteAsset.softCap) | formatMoney">
              {{ formatAssetCap(sale.defaultQuoteAsset.softCap) | formatMoney }}
            </span>
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.hard-cap" | globalize }}</span>
            <!-- eslint-disable-next-line max-len -->
            <span :title="formatAssetCap(sale.defaultQuoteAsset.hardCap) | formatMoney">
              {{ formatAssetCap(sale.defaultQuoteAsset.hardCap) | formatMoney }}
            </span>
          </li>
          <li>
            <span>
              {{ "sale-manager-details-tab.max-amoubt-to-sold" | globalize({
                assetId: sale.baseAsset.id
              })
              }}
            </span>
            <span :title="formatBaseAssetCap | formatMoney">
              {{ formatBaseAssetCap | formatMoney }}
            </span>
          </li>
        </ul>

        <label class="data-caption">
          {{ "sale-manager-details-tab.short-description" | globalize }}
        </label>
        <p class="text">
          {{ sale.details.shortDescription }}
        </p>
      </div>

      <div class="sale-manager-details-tab__row-item">
        <label class="data-caption">
          {{ "sale-manager-details-tab.sale-logo" | globalize }}
        </label>
        <template v-if="sale.details.logo && sale.details.logo.key">
          <img-getter
            class="sale-manager-details-tab__sale-logo"
            :file-key="sale.details.logo.key"
            alt="Sale logo"
          />
        </template>
        <template v-else>
          {{ "sale-manager-details-tab.no-logo" | globalize }}
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { EmailGetter, ImgGetter, DocLinkGetter } from '@comcom/getters'
import {
  AssetPoliciesFormatter,
} from '@comcom/formatters'

import {
  SALE_STATES,
  SALE_DEFINITION_TYPES,
} from '@/constants'
import { api } from '@/api'
import get from 'lodash/get'

export default {
  components: {
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

  computed: {
    isSaleWhitelisted () {
      return this.sale.accessDefinitionType.value ===
        SALE_DEFINITION_TYPES.whitelist
    },
    formatBaseAssetCap () {
      return {
        value: this.sale.baseHardCap,
        currency: this.sale.baseAsset.id,
      }
    },
  },

  async created () {
    await this.getAsset(this.sale)
  },

  methods: {
    get,
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
    formatAssetCap (cap) {
      return {
        value: cap,
        currency: this.sale.defaultQuoteAsset.asset.id,
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
