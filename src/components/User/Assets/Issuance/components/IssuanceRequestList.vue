<template>
  <div class="issuance-rl">
    <div class="issuance-rl__filters-wrp">
      <div class="issuance-rl__filters">
        <select-field
          class="issuance-rl__filter app-list-filters__field"
          label="State"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending">
            Pending
          </option>
          <option :value="REQUEST_STATES.approved">
            Approved
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected">
            Permanently rejected
          </option>
        </select-field>
        <select-field
          class="issuance-rl__filter app-list-filters__field"
          label="Asset"
          v-model="filters.asset"
        >
          <option
            v-for="asset in assets"
            :value="asset"
            :key="`issuance-request-list-${asset}`"
          >
            {{ asset }}
          </option>
        </select-field>
      </div>
    </div>

    <div class="issuance-rl__request-counter-wrapper">
      <p class="issuance-rl__request-counter">
        Pending requests: {{ listCounter.pending }}
      </p>
      <p class="issuance-rl__request-counter">
        Fullfilled requests: {{ listCounter.approved }}
      </p>
    </div>
    <div class="issuance-rl__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header issuance-rl__li-header">
            <span class="app-list__cell">
              Value
            </span>

            <span class="app-list__cell">
              Date
            </span>

            <span class="app-list__cell">
              Requestor
            </span>
          </div>
          <li
            v-for="item in list"
            :key="item.id"
            class="issuance-rl__li">
            <router-link
              class="issuance-rl__li-a"
              :to="{ name: 'assets.issuance.props', params: { id: item.id } }"
            >
              <span
                class="app-list__cell app-list__cell--important"
                :title="`${localize(item.amount)} ${item.asset}`"
              >
                {{ localize(item.details.createIssuance.amount) }}
                {{ item.details.createIssuance.asset }}
              </span>

              <span
                class="app-list__cell app-list__cell--wrap"
                :title="item.createdAt">
                {{ item.createdAt | dateTime }}
              </span>

              <span
                class="app-list__cell"
                :title="item.requestor">
                {{ item.requestor }}
              </span>
            </router-link>
          </li>
        </ul>
      </template>

      <template v-else>
        <div class="app-list">
          <div class="app-list__li-like app-list__li--no-shadow">
            <p>{{ isLoaded ? 'Nothing here yet' : 'Loading...' }}</p>
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

export default {
  mixins: [IssuanceMixin],
}
</script>

<style scoped lang="scss">
  @import "./issuance";
</style>
