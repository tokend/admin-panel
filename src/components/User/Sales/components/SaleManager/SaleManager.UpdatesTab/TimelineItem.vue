<template>
  <div class="timeline-item">
    <h2 class="timeline-item__title">{{ title }}</h2>
    <date-formatter
      :date="date" 
      format="DD MMM YYYY HH:mm:ss"
      class="timeline-item__date" />
    <p class="timeline-item__message" v-html="linkify(message)"></p>
  </div>
</template>

<script>
  import { DateFormatter } from '@comcom/formatters'
  export default {
    name: 'UpdatesTimeline-item',
    components: {
      DateFormatter
    },

    props: ['title', 'message', 'date'],
    methods: {
      linkify (text) {
        /*eslint-disable*/
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
        /*eslint-enable*/
        return text.replace(urlRegex, (url) => '<a href="' + url + '" target="_blank">' + url + '</a>')
      }
    }
  }
</script>

<style lang="scss" scoped>

  .timeline-item__date {
    font-weight: bold;
  }

  .timeline-item__title {
    margin-bottom: 0.75rem;
  }

  .timeline-item {
    margin-bottom: 2rem;
  }

</style>
