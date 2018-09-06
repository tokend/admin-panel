<template>
  <span class="date-formatter">
    {{formatDate(date, format)}}
  </span>
</template>

<script>
import { formatDate } from '@/utils/formatters'
export default {
  props: ['date', 'format'],

  methods: {
    formatDate
  }
}
</script>

<style scoped>

</style>
