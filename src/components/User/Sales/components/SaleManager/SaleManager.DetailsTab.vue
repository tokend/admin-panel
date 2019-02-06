<template>
  <div class="sale-manager-details-tab">
    <div class="sale-manager-details-tab__row">
      <template v-if="isTokenLoaded">
        <div class="sale-manager-details-tab__row-item">
          <ul class="key-value-list">
            <label class="data-caption">Token details</label>
            <li>
              <span>Name</span>
              <span>{{ token.details.name || '&mdash;' }}</span>
            </li>
            <li>
              <span>Code</span>
              <span>{{ token.code }}</span>
            </li>
            <li>
              <span>Owner</span>
              <email-getter
                :address="token.owner"
                is-titled
              />
            </li>
            <li>
              <span>Preissued asset signer</span>
              <email-getter
                :address="token.preissuedAssetSigner"
                is-titled
              />
            </li>
            <li>
              <span>Max issuance amount</span>
              <asset-amount-formatter :amount="token.maxIssuanceAmount" />
            </li>
            <li>
              <span>Pending issuance</span>
              <asset-amount-formatter :amount="token.pendingIssuance" />
            </li>
            <li>
              <span>Issued</span>
              <asset-amount-formatter :amount="token.issued" />
            </li>
            <li>
              <span>Available for issuance</span>
              <asset-amount-formatter :amount="token.availableForIssuance" />
            </li>
            <li>
              <span>Policies</span>
              <asset-policies-formatter :policies="token.policies" />
            </li>
            <li>
              <span>Terms</span>
              <span>
                <template v-if="token.details.terms && token.details.terms.key">
                  <doc-link-getter :file-key="token.details.terms.key">
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
          <label class="data-caption">Token logo</label>
          <template v-if="token.details.logo && token.details.logo.key">
            <img-getter
              class="sale-manager-details-tab__token-logo"
              :file-key="token.details.logo.key"
              alt="Token logo"
            />
          </template>
          <template v-else>
            (No logo)
          </template>
        </div>
      </template>

      <template v-else-if="isTokenFailed">
        <p class="text danger">
          An error occurred while fetching token. Please try again later.
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
          <label class="data-caption">Fund details</label>
          <li>
            <span>Name</span>
            <span>{{ sale.details.name || '&mdash;' }}</span>
          </li>
          <li>
            <span>State</span>
            <span>
              <template v-if="sale.state.value === SALE_STATES.open">
                Open
              </template>
              <template v-else-if="sale.state.value === SALE_STATES.closed">
                Closed
              </template>
              <template v-else-if="sale.state.value === SALE_STATES.cancelled">
                Cancelled
              </template>
            </span>
          </li>
          <li>
            <span>Owner</span>
            <email-getter
              :address="sale.ownerId"
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
          v-for="(item, index) in sale.quoteAssets.quoteAssets"
          :key="index"
        >
          <span>
            <!-- to padding of label.data-caption -->
          </span>
          <label class="data-caption">{{ item.asset }} progress</label>
          <li>
            <span>Price (per {{ sale.baseAsset }})</span>
            <asset-amount-formatter :amount="item.price" />
          </li>
          <li>
            <span>Current cap</span>
            <asset-amount-formatter :amount="item.currentCap" />
          </li>
          <li>
            <!-- eslint-disable-next-line max-len -->
            <span :title="`Current cap + current caps of the other acceptable assets in the ${item.asset} equivalent`">Total current cap</span>
            <asset-amount-formatter :amount="item.totalCurrentCap" />
          </li>
          <li>
            <!-- eslint-disable-next-line max-len -->
            <span :title="`Hard cap of the fund in the ${item.asset} equivalent`">Hard cap</span>
            <asset-amount-formatter :amount="item.hardCap" />
          </li>
        </ul>

        <ul class="key-value-list">
          <span>
            <!-- to padding of label.data-caption -->
          </span>
          <label class="data-caption">Total progress</label>
          <li>
            <span>Tokens sold</span>
            <asset-amount-formatter
              :amount="sale.baseCurrentCap"
              :asset="sale.baseAsset"
            />
          </li>
          <li>
            <span>Current cap</span>
            <asset-amount-formatter
              :amount="sale.currentCap"
              :asset="sale.defaultQuoteAsset"
            />
          </li>
          <li>
            <span>Soft cap</span>
            <asset-amount-formatter
              :amount="sale.softCap"
              :asset="sale.defaultQuoteAsset"
            />
          </li>
          <li>
            <span>Hard cap</span>
            <asset-amount-formatter
              :amount="sale.hardCap"
              :asset="sale.defaultQuoteAsset"
            />
          </li>
        </ul>

        <label class="data-caption">Short description</label>
        <p class="text">{{ sale.details.shortDescription }}</p>
      </div>

      <div class="sale-manager-details-tab__row-item">
        <label class="data-caption">Fund logo</label>
        <template v-if="sale.details.logo && sale.details.logo.key">
          <img-getter
            class="sale-manager-details-tab__sale-logo"
            :file-key="sale.details.logo.key"
            alt="Fund logo"
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
import { Sdk } from '@/sdk'
import { EmailGetter, ImgGetter, DocLinkGetter } from '@comcom/getters'
import {
  AssetAmountFormatter,
  DateFormatter,
  AssetPoliciesFormatter
} from '@comcom/formatters'
import { SALE_STATES } from '@/constants'

export default {
  components: {
    AssetAmountFormatter,
    DateFormatter,
    AssetPoliciesFormatter,
    EmailGetter,
    ImgGetter,
    DocLinkGetter
  },

  props: {
    sale: { type: Object, required: true }
  },

  data () {
    return {
      SALE_STATES,
      token: {},
      isTokenLoaded: false,
      isTokenFailed: false
    }
  },

  created () {
    this.getToken(this.sale)
  },

  methods: {
    async getToken ({ baseAsset }) {
      try {
        const { data } = await Sdk.horizon.assets.get(baseAsset)
        this.token = data
        this.isTokenLoaded = true
      } catch (error) {
        this.isTokenFailed = true
      }
    }
  }
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

.sale-manager-details-tab__token-logo,
.sale-manager-details-tab__sale-logo {
  margin-top: 0.5rem;
}

.sale-manager-details-tab__token-logo {
  max-width: 6.4rem;
  max-height: 6.4rem;
}

.sale-manager-details-tab__sale-logo {
  max-width: 20rem;
  max-height: 20rem;
}
</style>
