<template>
  <div class="rules">
    <user-header>
      <router-link
        :to="{ name: 'rules.account' }"
        slot="nav"
      >
        {{ "rules.link-account" | globalize }}
      </router-link>

      <router-link
        :to="{ name: 'rules.signer' }"
        slot="nav"
      >
        {{ "rules.link-signer" | globalize }}
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
  name: 'rules',

  components: { UserHeader },
}
</script>
