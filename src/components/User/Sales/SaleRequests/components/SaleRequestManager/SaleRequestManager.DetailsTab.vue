<template>
  <div class="sale-rm-details-tab">
    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          Request details
        </label>
        <ul class="key-value-list">
          <li>
            <span>Requestor</span>
            <email-getter
              :account-id="request.sale.requestor"
              is-titled
            />
          </li>
          <li>
            <span>Request state</span>
            <request-state-formatter
              :state="request.sale.requestState"
              is-colored
            />
          </li>

          <li>
            <span>Requested at</span>
            <date-formatter
              :date="request.sale.createdAt"
              format="DD MMM YYYY HH:mm:ss"
            />
          </li>
        </ul>

        <template v-if="request.sale.rejectReason">
          <label class="data-caption danger">
            Reject reason
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
          Asset details
        </label>
        <ul class="key-value-list">
          <li>
            <span>Name</span>
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
            <span>Code</span>
            <span>{{ request.asset.id }}</span>
          </li>
          <li>
            <span>Initial preissued amount</span>
            <asset-amount-formatter :amount="request.asset.maxIssuanceAmount" />
          </li>
          <li>
            <span>Max issuance amount</span>
            <asset-amount-formatter :amount="request.asset.maxIssuanceAmount" />
          </li>
          <li>
            <span>Preissuance signer</span>
            <email-getter
              :account-id="request.asset.preIssuanceAssetSigner"
              is-titled
            />
          </li>
          <li>
            <span>Policies</span>
            <asset-policies-formatter
              :policy-mask="request.asset.policies.value"
            />
          </li>
          <li>
            <span>Terms</span>
            <span>
              <template v-if="safeGet(request, 'asset.details.terms.key')">
                <doc-link-getter :file-key="request.asset.details.terms.key">
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

      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          Asset logo
        </label>
        <template v-if="safeGet(request, 'asset.details.logo.key')">
          <img-getter
            class="sale-rm-details-tab__asset-logo"
            :file-key="request.asset.details.logo.key"
            alt="Asset logo"
          />
        </template>
        <template v-else>
          <p>(No logo yet)</p>
        </template>
      </div>
    </div>

    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          Sale details
        </label>
        <ul class="key-value-list">
          <li>
            <span>Name</span>
            <span>
              <template v-if="safeGet(saleDetails, 'details.name')">
                {{ saleDetails.details.name }}
              </template>
              <template v-else>
                (Not provided yet)
              </template>
            </span>
          </li>
          <li>
            <span>Start time</span>
            <date-formatter
              :date="saleDetails.startTime"
              format="DD MMM YYYY HH:mm:ss"
            />
          </li>
          <li>
            <span>End time</span>
            <date-formatter
              :date="saleDetails.endTime"
              format="DD MMM YYYY HH:mm:ss"
            />
          </li>
          <li>
            <span>Soft cap</span>
            <asset-amount-formatter
              :amount="saleDetails.softCap"
              :asset="saleDetails.defaultQuoteAsset"
            />
          </li>
          <li>
            <span>Hard cap</span>
            <asset-amount-formatter
              :amount="saleDetails.hardCap"
              :asset="saleDetails.defaultQuoteAsset"
            />
          </li>
          <li>
            <span>Max {{ saleDetails.baseAsset }} amount to be sold</span>
            <asset-amount-formatter
              :amount="saleDetails.baseAssetForHardCap"
              :asset="saleDetails.baseAsset"
            />
          </li>

          <label class="data-caption">
            Prices (per one)
          </label>
          <li
            v-for="(item, index) in saleDetails.quoteAssets"
            :key="index"
          >
            <span>{{ item.quoteAsset }}</span>
            <span>{{ item.price }}</span>
          </li>
        </ul>

        <label class="data-caption">
          Short description
        </label>
        <p
          class="text sale-rm-details-tab__short-description"
          :title="safeGet(saleDetails, 'details.shortDescription')"
        >
          <template v-if="safeGet(saleDetails, 'details.shortDescription')">
            {{ saleDetails.details.shortDescription }}
          </template>
          <template v-else>
            (Not provided yet)
          </template>
        </p>
      </div>

      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">
          Sale logo
        </label>
        <template v-if="safeGet(saleDetails, 'details.logo.key')">
          <img-getter
            class="sale-rm-details-tab__sale-logo"
            :file-key="saleDetails.details.logo.key"
            alt="Sale logo"
          />
        </template>
        <template v-else>
          <p>(No logo yet)</p>
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
  RequestStateFormatter,
} from '@comcom/formatters'

import get from 'lodash/get'

export default {
  components: {
    EmailGetter,
    ImgGetter,
    DocLinkGetter,
    AssetAmountFormatter,
    DateFormatter,
    AssetPoliciesFormatter,
    RequestStateFormatter,
  },

  props: {
    request: { type: Object, required: true },
  },

  computed: {
    saleDetails () {
      return this.request.sale.details[this.request.sale.details.requestType]
    },
  },
  methods: {
    safeGet: get,
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
