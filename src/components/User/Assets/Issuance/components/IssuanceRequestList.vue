<template>
  <div class="issuance-rl">
    <div class="issuance-rl__filters-wrp">
      <div class="issuance-rl__filters">
        <select-field
          class="issuance-rl__filter app-list-filters__field"
          :label="'issuance-request-list.lbl-state' | globalize"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending.state">
            {{ "issuance-request-list.pending" | globalize }}
          </option>
          <option :value="REQUEST_STATES.approved.state">
            {{ "issuance-request-list.approved" | globalize }}
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected.state">
            {{ "issuance-request-list.perm-rejected" | globalize }}
          </option>
        </select-field>
        <select-field
          class="issuance-rl__filter app-list-filters__field"
          :label="'issuance-form.lbl-asset' | globalize"
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

    <div class="issuance-rl__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header issuance-rl__li-header">
            <span class="app-list__cell">
              {{ "issuance-request-list.value" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "issuance-request-list.date" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "issuance-request-list.requestor" | globalize }}
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
                :title="
                  // eslint-disable-next-line max-len
                  `${localize(item.requestDetails.amount)} ${item.requestDetails.asset.id}`
                "
              >
                {{ localize(item.requestDetails.amount) }}
                {{ item.requestDetails.asset.id }}
              </span>

              <span
                class="app-list__cell app-list__cell--wrap"
                :title="item.createdAt"
              >
                {{ item.createdAt | dateTime }}
              </span>

              <span
                class="app-list__cell"
                :title="item.requestor.id"
              >
                {{ item.requestor.id }}
              </span>
            </router-link>
          </li>
        </ul>
      </template>

      <template v-else>
        <div class="app-list">
          <div class="app-list__li-like app-list__li--no-shadow">
            <p v-if="isLoaded">
              {{ "issuance-request-list.fail-load" | globalize }}
            </p>
            <p v-else>
              {{ "issuance-request-list.loading" | globalize }}
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

export default {
  mixins: [IssuanceMixin],
}
</script>

<style scoped lang="scss">
@import "./issuance";
</style>
