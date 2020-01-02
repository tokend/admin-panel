<template>
  <div class="issuance-rl">
    <div class="issuance-rl__filters-wrp">
      <div class="issuance-rl__filters">
        <select-field
          class="issuance-rl__filter app-list-filters__field"
          :label="'issuance-history.lbl-asset' | globalize"
          v-model="filters.asset"
        >
          <option
            v-for="asset in assets"
            :value="asset"
            :key="asset">
            {{ asset }}
          </option>
        </select-field>
      </div>
    </div>

    <div class="issuance-rl__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header issuance-rl__li-header">
            <span class="app-list__cell issuance-rl__id-max-width">
              {{ "issuance-history.id" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "issuance-history.value" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "issuance-history.requestor" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "issuance-history.receiver" | globalize }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ "issuance-history.date" | globalize }}
            </span>
          </div>
          <li
            v-for="item in list"
            :key="item.id"
            class="issuance-rl__li">
            <span
              class="app-list__cell issuance-rl__id-max-width"
              :title="item.id"
            >
              {{ item.id }}
            </span>

            <!-- eslint-disable max-len -->
            <span
              class="app-list__cell app-list__cell--right app-list__cell--important"
              :title="
                `${localize(item.requestDetails.amount)} ${
                  item.requestDetails.asset.id
                }`
              "
            >
              {{ localize(item.requestDetails.amount) }}
              {{ item.requestDetails.asset.id }}
            </span>
            <!-- eslint-enable max-len -->

            <span
              class="app-list__cell app-list__cell--right "
              :title="item.requestor.id"
            >
              <email-getter :account-id="item.requestor.id" />
            </span>

            <span
              class="app-list__cell app-list__cell--right "
              :title="item.requestDetails.receiver.id"
            >
              <email-getter :balance-id="item.requestDetails.receiver.id" />
            </span>

            <span
              class="app-list__cell app-list__cell--right  app-list__cell--wrap"
              :title="item.createdAt"
            >
              {{ item.createdAt | dateTime }}
            </span>
          </li>
        </ul>
      </template>

      <template v-else>
        <div class="app-list">
          <div class="app-list__li-like app-list__li--no-shadow">
            <p v-if="isLoaded">
              {{ "issuance-history.fail-load" | globalize }}
            </p>
            <p v-else>
              {{ "Issuanceissuance-historyHistory.loading" | globalize }}
            </p>
          </div>
        </div>
      </template>

      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="getList"
          @first-page-load="setList"
          @next-page-load="extendList"
          ref="collectionLoaderBtn"
        />
      </div>
    </div>
  </div>
</template>

<script>
import IssuanceMixin from './issuance.mixin'
import { EmailGetter } from '@comcom/getters'
import { Bus } from '@/utils/bus'

export default {
  components: { EmailGetter },
  mixins: [IssuanceMixin],

  async created () {
    Bus.$on('issuance:updateRequestList', _ => {
      this.reloadCollectionLoader()
    })
  },
}
</script>

<style scoped lang="scss">
@import "./issuance";

.issuance-rl__id--max-width {
  max-width: 111px;
}
</style>
