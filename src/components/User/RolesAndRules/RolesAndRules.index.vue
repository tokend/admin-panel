<template>
  <div class="roles-and-rules">
    <h2>{{ 'roles-and-rules-index.header' | globalize }}</h2>

    <div>
      <roles-and-rules-manager />
    </div>
  </div>
</template>

<script>
import RolesAndRulesManager from './RolesAndRulesManager'

export default {
  components: {
    RolesAndRulesManager,
  },
}
</script>
