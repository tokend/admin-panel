<template>
  <div class="roles">
    <user-header>
      <router-link
        :to="{ name: 'roles.account' }"
        slot="nav"
      >
        {{ "roles.link-account" | globalize }}
      </router-link>

      <router-link
        :to="{ name: 'roles.signer' }"
        slot="nav"
      >
        {{ "roles.link-signer" | globalize }}
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
  name: 'roles',

  components: { UserHeader },
}
</script>
