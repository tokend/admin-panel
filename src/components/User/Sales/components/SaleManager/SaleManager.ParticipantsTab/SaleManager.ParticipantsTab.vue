<template>
  <div class="sale-manager-participants-tab">
    <div class="sale-manager-participants-tab__pending-wrp">
      <participants :sale="sale" />
    </div>
  </div>
</template>

<script>
import Participants from './Participants'

export default {
  components: {
    Participants,
  },

  props: {
    sale: { type: Object, required: true },
  },
}
</script>

<style lang="scss">
</style>
