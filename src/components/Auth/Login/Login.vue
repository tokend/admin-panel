<template>
  <div class="login">
    <div class="login__block app__block" v-if="state === 'login'">
      <h2 class="login__heading">
        {{ "login.header" | globalize }}
      </h2>

      <form
        @submit.prevent="login"
        :id="`${_uid}-login-form`"
        novalidate>
        <div class="app__form-row">
          <input-field
            class="app__form-field"
            id="login-field"
            v-model.trim="form.username"
            label="Username"
            name="username"
            @blur="touchField('form.username')"
            :error-message="getFieldErrorMessage('form.username')"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="password"
            v-model.trim="form.password"
            label="Password"
            name="password"
            @blur="touchField('form.password')"
            :error-message="getFieldErrorMessage('form.password')"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="app__form-actions">
          <button class="app__btn" :disabled="formMixin.isDisabled">
            {{ "login.label" | globalize }}
          </button>
        </div>
      </form>

      <template v-if="seedLoginEnabled">
        <p class="login__alt-action">
          <span> {{ "login.also-you-can" | globalize }} </span>
          <router-link :to="{ name: 'seed-login' }">
            {{ "login.seed-log-en-link" | globalize }}
          </router-link>
        </p>
      </template>
    </div>

    <div class="login__block app__block" v-else-if="state === 'tfa'">
      <g-auth @tfa-done="redirect" />
    </div>

    <template v-if="buildVersion">
      <p class="login__version">
        {{ buildVersion | formatVersion }}
      </p>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

import GAuth from '../../settings/GAuth.vue'

import FormMixin from '@/mixins/form.mixin'
import config from '@/config'

import { ErrorHandler } from '@/utils/ErrorHandler'

import { required } from '@/validators'

export default {
  name: 'login',
  components: { GAuth },
  mixins: [FormMixin],

  data () {
    return {
      state: 'login',
      tfaDone: false,
      loginParams: {},

      form: {
        username: '',
        password: '',
      },
      error: '',
      unsubscribe: null,
      buildVersion: config.BUILD_VERSION,
    }
  },

  validations () {
    return {
      form: {
        username: { required },
        password: { required },
      },
    }
  },

  computed: {
    seedLoginEnabled () {
      return config.FEATURES.SEED_AUTH
    },
  },

  async created () {
    this.tfaDone = false
    this.unsubscribe = this.$store.subscribe(async mutation => {
      if (this.$store.getters.tfaInitiator !== 'login') {
        return
      }

      switch (mutation.type) {
        case 'TFA_FORM_DONE': {
          if (this.tfaDone) break

          this.tfaDone = true
          await this.continueLogin()
          break
        }
        case 'TFA_FORM_RESEND': {
          this.wantResend = true
          await this.login()
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

  methods: {
    async login () {
      if (!this.isFormValid()) return

      this.disableForm()
      this.$store.commit('OPEN_LOADER')

      const params = {
        username: this.form.username.toLowerCase(),
        password: this.form.password,
      }

      try {
        const response = await Vue.auth.login(params)
        this.enableForm()
        this.$store.commit('CLOSE_LOADER')

        if (!response.ok) {
          this.form.password = ''
          ErrorHandler.process(response.message)
          return
        }

        if (response.enabledTFA) {
          this.loginParams = response.loginParams
          this.loginParams.username = this.form.username.toLowerCase().trim()

          return this.showTfaForm(response.token)
        }
        this.state = 'tfa'
      } catch (err) {
        ErrorHandler.process(err)
        this.$store.commit('CLOSE_LOADER')
      }
    },

    async continueLogin () {
      this.$store.commit('OPEN_LOADER')

      try {
        const response = await Vue.auth.continueLogin(this.loginParams)
        this.$store.commit('CLOSE_LOADER')

        if (!response.ok) {
          ErrorHandler.process(response.message)
        }

        this.redirect()
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        this.$store.commit('CLOSE_LOADER')
      }
    },

    redirect () {
      this.state = 'done'
      this.$store.dispatch('LOG_IN')
      setTimeout(() => this.$router.push({ name: 'users' }), 1000)
    },

    refresh () {
      this.loginParams = {}
      this.form.username = ''
      this.form.password = ''
      this.state = 'login'
    },

    showTfaForm (tfaToken) {
      this.tfaDone = false

      this.$store.commit('OPEN_MODAL')
      this.$store.commit('REQUIRE_TFA', {
        tfaToken,
        initiator: 'login',
      })
    },
  },
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
