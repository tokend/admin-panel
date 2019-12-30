<template>
  <div class="poll-requests-index">
    <h2>Browse poll requests</h2>

    <div class="poll-requests-index__list-wrp">
      <poll-request-list />
    </div>
  </div>
</template>

<script>
import PollRequestList from './components/PollRequestList'

export default {
  name: 'poll-requests-index',

  components: { PollRequestList },
}
</script>

<style>
</style>
