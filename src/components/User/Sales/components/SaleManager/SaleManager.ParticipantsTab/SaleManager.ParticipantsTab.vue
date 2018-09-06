<template>
  <div class="sale-manager-participants-tab">
    <div class="sale-manager-participants-tab__pending-wrp">
      <pending-participants :sale="sale" />
    </div>

    <div class="sale-manager-participants-tab__closed-wrp">
      <closed-participants :sale="sale" />
    </div>
  </div>
</template>

<script>
import PendingParticipants from './PendingParticipants'
import ClosedParticipants from './ClosedParticipants'
export default {
  components: {
    PendingParticipants,
    ClosedParticipants
  },

  props: ['sale']
}
</script>

<style scoped lang="scss">
.sale-manager-participants-tab__pending-wrp {
  margin-bottom: 6rem;
}
</style>
