<template>
  <div class="polls">
    <user-header>
      <router-link
        :to="{ name: 'polls.index' }"
        slot="nav"
      >
        {{ "polls.link-polls" | globalize }}
      </router-link>

      <router-link
        :to="{ name: 'polls.requests' }"
        slot="nav"
      >
        {{ "polls.link-poll-requests" | globalize }}
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
  name: 'polls',

  components: { UserHeader },
}
</script>
