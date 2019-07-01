<template>
  <div class="poll-requests-show">
    <h2>Review poll request</h2>

    <div class="poll-requests-show__manager-wrp">
      <poll-request-view :id="id" />
    </div>
  </div>
</template>

<script>
import PollRequestView from './components/PollRequestView'

export default {
  name: 'poll-requests-show',

  components: {
    PollRequestView,
  },

  props: {
    id: { type: String, required: true },
  },
}
</script>
