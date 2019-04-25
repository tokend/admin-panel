<template>
  <span class="date-formatter">
    {{ formatDate(date, format) }}
  </span>
</template>

<script>
import { formatDate } from '@/utils/formatters'
export default {
  props: {
    date: { type: String, required: true },
    format: { type: String, required: true },
  },

  methods: {
    formatDate,
  },
}
</script>

<style scoped>

</style>
