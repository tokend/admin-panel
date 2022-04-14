<template>
  <div class="roles-and-rules">
    <user-header>
      <router-link :to="{ name: 'rolesAndRules.index' }" slot="nav">
        {{ "roles-and-rules.link-roles-and-rules" | globalize }}
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import UserHeader from '@/components/User/components/UserHeader'

export default {
  components: { UserHeader },
}
</script>
