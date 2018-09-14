<template>
  <div class="sale-rm-details-tab">
    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">Request details</label>
        <ul class="key-value-list">
          <li>
            <span>Requestor</span>
            <email-getter :address="request.sale.requestor" is-titled />
          </li>
          <li>
            <span>Request state</span>
            <request-state-formatter :state="request.sale.requestState" is-colored/>
          </li>

          <li>
            <span>Requested at</span>
            <date-formatter :date="request.sale.createdAt" format="DD MMM YYYY HH:mm:ss" />
          </li>
        </ul>

        <template v-if="request.sale.rejectReason">
          <label class="data-caption danger">Reject reason</label>
          <p class="text">
            {{request.sale.rejectReason}}
          </p>
        </template>
      </div>

      <div class="sale-rm-details-tab__row-item"></div>
    </div>

    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">Investment token details</label>
        <ul class="key-value-list">
          <li>
            <span>Name</span>
            <span>
              <template v-if="safeGet(request, 'token.name')">
                {{request.token.name}}
              </template>
              <template v-else>
                &mdash;
              </template>
            </span>
          </li>
          <li>
            <span>Code</span>
            <span>{{request.token.code}}</span>
          </li>
          <li>
            <span>Initial preissued amount</span>
            <asset-amount-formatter :amount="request.token.maxIssuanceAmount" />
          </li>
          <li>
            <span>Max issuance amount</span>
            <asset-amount-formatter :amount="request.token.maxIssuanceAmount" />
          </li>
          <li>
            <span>Preissuance signer</span>
            <email-getter :address="request.token.preissuedAssetSigner" is-titled />
          </li>
          <li>
            <span>Policies</span>
            <asset-policies-formatter :policies="request.token.policies" />
          </li>
          <li>
            <span>Terms</span>
            <span>
              <template v-if="safeGet(request, 'token.terms.key')">
                <doc-link-getter :file-key="request.token.terms.key">Open file</doc-link-getter>
              </template>

              <template v-else>
                (No document)
              </template>
            </span>
          </li>
        </ul>
      </div>

      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">Token logo</label>
        <template v-if="safeGet(request, 'token.logo.key')">
          <img-getter class="sale-rm-details-tab__token-logo"
            :file-key="request.token.logo.key"
            alt="Token logo"
          />
        </template>
        <template v-else>
          <p>(No logo yet)</p>
        </template>
      </div>
    </div>

    <div class="sale-rm-details-tab__row">
      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">Fund details</label>
        <ul class="key-value-list">
          <li>
            <span>Name</span>
            <span>
              <template v-if="safeGet(request, 'sale.details.name')">
                {{request.sale.details.name}}
              </template>
              <template v-else>
                (Not provided yet)
              </template>
            </span>
          </li>
          <li>
            <span>Start time</span>
            <date-formatter :date="request.sale.startTime" format="DD MMM YYYY HH:mm:ss" />
          </li>
          <li>
            <span>End time</span>
            <date-formatter :date="request.sale.endTime" format="DD MMM YYYY HH:mm:ss" />
          </li>
          <li>
            <span>Soft cap</span>
            <asset-amount-formatter :amount="request.sale.softCap" :asset="request.sale.defaultQuoteAsset" />
          </li>
          <li>
            <span>Hard cap</span>
            <asset-amount-formatter :amount="request.sale.hardCap" :asset="request.sale.defaultQuoteAsset" />
          </li>

          <label class="data-caption">Prices (per token) </label>
          <li v-for="(item, index) in request.sale.quoteAssets" :key="index">
            <span>{{item.quoteAsset}}</span>
            <span>{{item.price}}</span>
          </li>
        </ul>

        <label class="data-caption">Short description</label>
        <p class="text">
          <template v-if="safeGet(request, 'sale.details.shortDescription')">
            {{request.sale.details.shortDescription}}
          </template>
          <template v-else>
            (Not provided yet)
          </template>
        </p>
      </div>

      <div class="sale-rm-details-tab__row-item">
        <label class="data-caption">Fund logo</label>
        <template v-if="safeGet(request, 'sale.details.logo.key')">
          <img-getter class="sale-rm-details-tab__sale-logo"
            :file-key="request.sale.details.logo.key"
            alt="Fund logo"
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
  RequestStateFormatter
} from '@comcom/formatters'
import get from 'lodash/get'

export default {
  props: ['request'],

  components: {
    EmailGetter,
    ImgGetter,
    DocLinkGetter,
    AssetAmountFormatter,
    DateFormatter,
    AssetPoliciesFormatter,
    RequestStateFormatter
  },

  methods: {
    safeGet: get
  }
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

  & + & {
    margin-left: 4rem;
  }
}

.sale-rm-details-tab__token-logo,
.sale-rm-details-tab__sale-logo {
  margin-top: 0.5rem;
}

.sale-rm-details-tab__token-logo {
  max-width: 6.4rem;
  max-height: 6.4rem;
}

.sale-rm-details-tab__sale-logo {
  max-width: 20rem;
  max-height: 20rem;
}
</style>
