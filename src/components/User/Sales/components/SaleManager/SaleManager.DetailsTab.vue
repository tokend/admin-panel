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
                {{ "sale-manager-details-tab.pending-issuance" | globalize }}
              </span>
              <asset-amount-formatter :amount="asset.maxIssuanceAmount" />
            </li>
            <li>
              <span>
                {{ "sale-manager-details-tab.pending-issuance" | globalize }}
              </span>
              <asset-amount-formatter :amount="asset.pendingIssuance" />
            </li>
            <li>
              <span>{{ "sale-manager-details-tab.issued" | globalize }}</span>
              <asset-amount-formatter :amount="asset.issued" />
            </li>
            <li>
              <!-- eslint-disable-next-line max-len -->
              <span>{{ "sale-manager-details-tab.available-for-issuance" | globalize }}</span>
              <asset-amount-formatter :amount="asset.availableForIssuance" />
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
                <span>{{ stellarAssetType }}</span>
              </li>
              <li>
                <span>
                  {{ "sale-manager-details-tab.stellar-withdraw" | globalize }}
                </span>
                <span v-if="asset.details.stellar.withdraw">
                  {{ "sale-manager-details-tab.yes" | globalize }}
                </span>
                <span v-else>
                  {{ "sale-manager-details-tab.no" | globalize }}
                </span>
              </li>
              <li>
                <span>
                  {{ "sale-manager-details-tab.stellar-deposit" | globalize }}
                </span>
                <span v-if="asset.details.stellar.deposit">
                  {{ "sale-manager-details-tab.yes" | globalize }}
                </span>
                <span v-else>
                  {{ "sale-manager-details-tab.no" | globalize }}
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
              {{ LOCALIZED_SALE_TYPES[sale.saleType.value + ''] || '&mdash;' }}
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
            <span v-if="isSaleWhitelisted">
              {{ "sale-manager-details-tab.yes" | globalize }}
            </span>
            <span v-else>
              {{ "sale-manager-details-tab.no" | globalize }}
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
            {{ item.asset.id }} progress
          </label>
          <li>
            <span>
              {{ "sale-manager-details-tab.price-per-sale" | globalize({
                assetId: sale.baseAsset.id
              })
              }}
            </span>
            <asset-amount-formatter :amount="item.price" />
          </li>
          <li>
            <span>
              {{ "sale-manager-details-tab.current-cap" | globalize }}
            </span>
            <asset-amount-formatter :amount="item.currentCap" />
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
            <asset-amount-formatter :amount="item.totalCurrentCap" />
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
            <asset-amount-formatter :amount="item.hardCap" />
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
            <asset-amount-formatter
              :amount="sale.defaultQuoteAsset.currentCap"
              :asset="sale.defaultQuoteAsset.asset.id"
            />
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.soft-cap" | globalize }}</span>
            <asset-amount-formatter
              :amount="sale.defaultQuoteAsset.softCap"
              :asset="sale.defaultQuoteAsset.asset.id"
            />
          </li>
          <li>
            <span>{{ "sale-manager-details-tab.hard-cap" | globalize }}</span>
            <asset-amount-formatter
              :amount="sale.defaultQuoteAsset.hardCap"
              :asset="sale.defaultQuoteAsset.asset.id"
            />
          </li>
          <li>
            <span>
              {{ "sale-manager-details-tab.max-amoubt-to-sold" | globalize({
                assetId: sale.baseAsset.id
              })
              }}
            </span>
            <asset-amount-formatter
              :amount="sale.baseHardCap"
              :asset="sale.baseAsset.id"
            />
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
  AssetAmountFormatter,
  AssetPoliciesFormatter,
} from '@comcom/formatters'

import { SALE_STATES, SALE_DEFINITION_TYPES, LOCALIZED_SALE_TYPES } from '@/constants'
import { api } from '@/api'
import get from 'lodash/get'

const STELLAR_TYPES = {
  creditAlphanum4: 'credit_alphanum4',
  creditAlphanum12: 'credit_alphanum12',
  native: 'native',
}

export default {
  components: {
    AssetAmountFormatter,
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
      LOCALIZED_SALE_TYPES,
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

    stellarAssetType () {
      let label

      switch (this.asset.details.stellar.assetType) {
        case STELLAR_TYPES.creditAlphanum4:
          label = 'Alphanumeric 4'
          break

        case STELLAR_TYPES.creditAlphanum12:
          label = 'Alphanumeric 12'
          break

        case STELLAR_TYPES.native:
          label = 'Native'
          break

        default:
          label = '[UNKNOWN_STELLAR_ASSET_TYPE]'
          break
      }

      return label
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
