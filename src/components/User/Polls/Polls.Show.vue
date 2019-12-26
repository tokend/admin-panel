<template>
  <div class="polls-show">
    <div class="polls-show__viewer-wrp">
      <poll-viewer :id="id" />
    </div>
  </div>
</template>

<script>
import PollViewer from './components/PollViewer'

export default {
  components: {
    PollViewer,
  },

  props: {
    id: { type: String, required: true },
  },
}
</script>
