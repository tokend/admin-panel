<template>
  <div class="login">
    <div
      class="login__block app__block"
      v-if="state === 'login'"
    >
      <h2 class="login__heading">
        Sign In
      </h2>

      <form
        @submit.prevent="login"
        :id="`${_uid}-login-form`"
      >
        <div class="app__form-row">
          <input-field
            class="app__form-field"
            id="login-field"
            v-model.trim="credentials.username"
            label="Username"
            name="username"
          />
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="password"
            v-model.trim="credentials.password"
            label="Password"
            name="password"
          />
        </div>

        <div class="app__form-actions">
          <button
            class="app__btn"
            :disabled="buttonsDisabled"
          >
            Sign in
          </button>
        </div>
      </form>

      <template v-if="seedLoginEnabled">
        <p class="login__alt-action">
          <span> Also you can </span>
          <router-link :to="{ name: 'seed-login' }">
            sign in with seed
          </router-link>
        </p>
      </template>
    </div>

    <div
      class="login__block app__block"
      v-else-if="state === 'tfa'"
    >
      <g-auth @tfa-done="redirect"></g-auth>
    </div>

    <template v-if="buildVersion">
      <p class="login__version">
        {{ buildVersion | formatVersion}}
        {{ 'c5499e2c914fae0846fc84c46736dcf23dfacb91' | formatVersion}}
      </p>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

import store from '@/store/index'
import GAuth from '../../settings/GAuth.vue'

import InputField from '@comcom/fields/InputField'
import config from '@/config'

export default {
  name: 'login',
  components: { GAuth, InputField },

  data () {
    return {
      state: 'login',
      tfaDone: false,
      loginParams: {},

      credentials: {
        username: '',
        password: ''
      },
      error: '',

      unsubscribe: null,

      buildVersion: config.BUILD_VERSION
    }
  },

  computed: {
    buttonsDisabled () {
      return this.$store.getters.showLoader
    },
    seedLoginEnabled () {
      return config.FEATURES.SEED_AUTH
    }
  },

  created () {
    this.tfaDone = false
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (this.$store.getters.tfaInitiator !== 'login') {
        return
      }

      switch (mutation.type) {
        case 'TFA_FORM_DONE': {
          if (this.tfaDone) return
          this.tfaDone = true
          return this.continueLogin()
        }
        case 'TFA_FORM_RESEND': {
          this.wantResend = true
          this.login()
          break
        }
        case 'TFA_FORM_CLOSE': {
          this.refresh()
          break
        }
      }
    })
  },

  beforeDestroy () {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },

  mounted () {
    const input = document.querySelector('#login-field input')
    if (input) input.focus()
  },

  methods: {
    login () {
      if (!this.validate()) return

      this.$store.commit('OPEN_LOADER')

      const params = {
        username: this.credentials.username.toLowerCase(),
        password: this.credentials.password
      }

      return Vue.auth.login(params)
        .then(r => {
          this.$store.commit('CLOSE_LOADER')
          if (!r.ok) {
            this.credentials.password = ''
            this.$store.dispatch('SET_ERROR', r.message)
            return
          }

          if (r.enabledTFA) {
            this.loginParams = r.loginParams
            this.loginParams.username = this.credentials.username.toLowerCase().trim()
            return this.showTfaForm(r.token)
          }
          this.state = 'tfa'
        }).catch(err => {
          console.error(err)
          this.$store.commit('CLOSE_LOADER')
        })
    },

    continueLogin () {
      this.$store.commit('OPEN_LOADER')
      return Vue.auth.continueLogin(this.loginParams)
        .then(r => {
          this.$store.commit('CLOSE_LOADER')
          if (!r.ok) {
            this.$store.dispatch('SET_ERROR', r.message)
          }
          this.redirect()
        }).catch(err => {
          console.error(err)
          this.$store.commit('CLOSE_LOADER')
        })
    },

    redirect () {
      this.state = 'done'
      this.$store.dispatch('LOG_IN')
      setTimeout(() => this.$router.push({ name: 'users' }), 1000)
    },

    refresh () {
      this.loginParams = {}
      this.credentials.username = ''
      this.credentials.password = ''
      this.state = 'login'
    },

    showTfaForm (token) {
      this.tfaDone = false

      this.$store.commit('OPEN_MODAL')
      this.$store.commit('REQUIRE_TFA', {
        token: token,
        initiator: 'login'
      })
    },

    validate () {
      this.error = ''
      if (this.credentials.username === '') {
        store.dispatch('SET_ERROR', 'Username should not be empty')
        return false
      }
      if (this.credentials.password === '') {
        store.dispatch('SET_ERROR', 'Password should not be empty')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.login__block.app__block {
  padding: 5.5rem 4rem 3.5rem;
  max-width: 41rem;
  margin: 0 auto;
}

.login__block--wider.app__block {
  max-width: 54rem;
}

.login__heading {
  margin-bottom: 5rem;
}

.login__alt-action {
  margin-top: 1.2rem;
  font-size: 1.6rem;
}

.login__version {
  font-size: 1.2rem;
  color: $color-text-secondary;
  margin: 1.2rem 0 2.4rem;
  text-align: center;
}
</style>
