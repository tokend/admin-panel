<template>
  <div class="fees-index">
    <h2>
      Fee management
    </h2>

    <div class="fees-index__list-wrp">
      <fee-list/>
    </div>
  </div>
</template>

<script>
import FeeList from './components/FeeList'
export default {
  components: { FeeList }
}
</script>

<style scoped>

</style>
