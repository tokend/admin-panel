<template>
  <div class="issuance-rl">
    <div class="issuance-rl__filters-wrp">
      <div class="issuance-rl__filters">
        <select-field class="issuance-rl__filter app-list-filters__field"
                      label="Asset" v-model="filters.asset">
          <option v-for="asset in assets" :value="asset">{{ asset }}</option>
        </select-field>
      </div>
    </div>

    <div class="issuance-rl__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header issuance-rl__li-header">
            <span class="app-list__cell issuance-rl__id-max-width">
              ID
            </span>
            <span class="app-list__cell">
              Value
            </span>
            <span class="app-list__cell">
              Requestor
            </span>
            <span class="app-list__cell">
             Receiver
            </span>
            <span class="app-list__cell">
              Date
            </span>

          </div>
          <li v-for="item in list.data" :key="item.id" class="issuance-rl__li">
            <span class="app-list__cell issuance-rl__id-max-width"
                  :title="item.id">
              {{item.id}}
            </span>

            <span class="app-list__cell app-list__cell--important"
                  :title="`${localize(item.amount)} ${item.asset}`">
              {{localize(item.amount)}} {{item.asset}}
            </span>

            <span class="app-list__cell"
                  :title="item.requestor">
              {{item.requestor}}
            </span>

            <span class="app-list__cell"
                  :title="item.receiver">
              {{item.receiver}}
            </span>

            <span class="app-list__cell app-list__cell--wrap"
                  :title="item.createdAt">
              {{item.createdAt | dateTime}}
            </span>
          </li>
        </ul>

        <div class="app__more-btn-wrp">
          <button class="app__btn-secondary"
                  v-if="!isNoMoreEntries && list.data"
                  @click="onMoreButtonClick">
            More
          </button>
        </div>
      </template>

      <template v-else>
        <div class="app-list">
          <div class="app-list__li-like app-list__li--no-shadow">
            <p>{{isLoaded ? 'Nothing here yet' : 'Loading...'}}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import IssuanceMixin from './issuance.mixin'

  export default {
    mixins: [IssuanceMixin]
  }
</script>

<style scoped lang="scss">
  @import "./issuance";

  .issuance-rl__id--max-width {
    max-width: 111px;
  }
</style>
