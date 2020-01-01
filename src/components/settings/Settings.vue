<template>
  <div class="settings">
    <user-header>
      <router-link :to="{ name: 'settings' }" slot="nav">
        {{ "settings.settings-link" | globalize }}
      </router-link>
    </user-header>

    <div class="app__user-container">
      <div class="app__block">
        <h2>{{ "settings.settings" | globalize }}</h2>

        <div class="settings__row">
          <span>{{ "settings.2fa" | globalize }} </span>
          <span>
            <template
              v-if="!(isTfaPending || hasGAuth)"
              class="info-block__data"
            >
              <router-link :to="{ name: 'settings.tfa' }">
                {{ "settings.link-change" | globalize }}
              </router-link>
            </template>
            <template class="info-block__data" v-else>
              <strong>{{ "settings.enabled" | globalize }}</strong>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tfa from '@/apiHelper/tfa'
import UserHeader from '@/components/User/components/UserHeader'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  name: 'security',
  components: { UserHeader },

  data () {
    return {
      hasGAuth: false,
      showTfa: false,
      showPass: false,
      isTfaPending: true,
    }
  },

  async created () {
    try {
      const response = await tfa.getTfaBackends()

      if (response.backends && response.backends.length > 0) {
        response.backends.forEach(b => {
          if (b.priority === 10) {
            this.hasGAuth = true
          }
        })
      }
      this.isTfaPending = false
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  },
}
</script>

<style lang="scss" scoped>
.settings__row {
  display: flex;
  max-width: 40rem;
  justify-content: space-between;
}
</style>
