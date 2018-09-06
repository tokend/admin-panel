<template>
  <div class="closed-participants">
    <h2 class="data-caption">Closed deals</h2>

    <template v-if="isLoaded && list.length">
      <table class="closed-participants__table">
        <thead>
          <tr>
            <th>Investor</th>
            <th>Invested at</th>
            <th>{{sale.baseAsset}} acquired</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in list" :key="index">
            <td><email-getter :address="item.accountId" /></td>
            <td><date-formatter :date="item.createdAt" format="DD MMM YYYY HH:mm:ss" /></td>
            <td>{{item.balance}}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else-if="isLoaded && !list.length">
      <p class="text">
        No investments yet.
      </p>
    </template>

    <template v-else-if="isFailed">
      <p class="text danger">
        An error occurred. Please try again later.
      </p>
    </template>

    <template v-else>
      Loading...
    </template>
  </div>
</template>

<script>
import api from '@/api'
import { DateFormatter } from '@comcom/formatters'
import { EmailGetter } from '@comcom/getters'
export default {
  data () {
    return {
      list: [],
      isLoaded: false,
      isFailed: false
    }
  },

  components: {
    DateFormatter,
    EmailGetter
  },

  props: ['sale'],

  created () {
    this.getList(this.sale)
  },

  methods: {
    async getList ({ baseAsset }) {
      try {
        const response = await api.assets.getHolders(baseAsset)
        this.list = response.data
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
$side-padding: 0.8rem;

.closed-participants__table {
  width: calc(100% + #{$side-padding} * 2);
  margin: 0 -$side-padding 0 -$side-padding;
  font-size: 1.6rem;
  border-collapse: collapse;

  & > thead > tr > th,
  & > tbody > tr > td {
    &:nth-child(1),
    &:nth-child(2) {
      text-align: left;
    }
    &:nth-child(3),
    &:nth-child(4) {
      text-align: right;
    }

    padding: 0.5rem 0;

    &:first-child {
      padding-left: $side-padding;
    }

    &:last-child {
      padding-right: $side-padding;
    }
  }

  & > tbody > tr:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
}
</style>
