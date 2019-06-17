<template>
  <div class="polls-index">
    <div class="polls-index__list-wrp">
      <poll-list />
    </div>
  </div>
</template>

<script>
import PollList from './components/PollList'

export default {
  components: {
    PollList,
  },
}
</script>
