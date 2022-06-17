<template>
  <div class="roles-and-rules">
    <user-header>
      <router-link :to="vueRoutes.rolesAndRulesIndex" slot="nav">
        {{ 'roles-and-rules.link-roles-and-rules' | globalize }}
      </router-link>
    </user-header>
    <div class="app__user-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import UserHeader from '@/components/User/components/UserHeader'
import { vueRoutes } from '@/router/router'

export default {
  components: { UserHeader },
  data () {
    return {
      vueRoutes,
    }
  },
}
</script>
