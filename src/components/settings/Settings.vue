<template>
  <div class="settings">
    <user-header>
      <router-link :to="{ name: 'settings' }" slot="nav">Settings</router-link>
    </user-header>

    <div class="app__user-container">
      <div class="app__block">
        <h2>Settings</h2>

        <div class="settings__row">
          <span>Two-factor Authentication </span>
          <span>
            <template class="info-block__data" v-if="!(isTfaPending || hasGAuth)">
              <router-link :to="{ name: 'settings.tfa' }"> Change </router-link>
            </template>
            <template class="info-block__data" v-else>
              <strong>Enabled</strong>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import tfa from '@/api/tfa'
import GAuth from './GAuth.vue'
import UserHeader from '@/components/User/components/UserHeader'

export default {
  name: 'security',
  components: {
    GAuth,
    UserHeader
  },

  data () {
    return {
      hasGAuth: false,
      showTfa: false,
      showPass: false,
      isTfaPending: true
    }
  },

  created () {
    tfa.getTfaBackends()
      .then(response => {
        if (response.backends && response.backends.length > 0) {
          response.backends.forEach(b => {
            if (b.priority === 10) {
              this.hasGAuth = true
            }
          })
        }
        this.isTfaPending = false
      })
      .catch(err => {
        console.error(err)
      })
  }
}
</script>

<style lang="scss" scoped>
.settings__row {
  display: flex;
  max-width: 40rem;
  justify-content: space-between;
}
</style>
