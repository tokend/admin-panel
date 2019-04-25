<template>
  <div class="operation-counterparty">
    {{ counterparty }}
  </div>
</template>
<script>
export default {
  props: {
    operation: { type: Object, required: true },
  },

  data: _ => ({
    counterparty: 'counterparty',
    noCounterpartyStr: '-',
  }),

  created () {
    this.counterparty = this.getCounterparty(this.operation)
  },

  methods: {
    getCounterparty (operation) {
      if (operation.receiverAccount) {
        return operation.receiverAccount
      } else if (operation.accountTo) {
        return operation.accountTo
      } else {
        return this.noCounterpartyStr
      }
    },
  },
}
</script>
<style scoped lang="scss">
  .operation-counterparty {
    width: 100%;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
