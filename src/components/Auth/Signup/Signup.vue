<template>
  <div class="signup" v-if="state !== 'logged-in'">
    <!-- Signup block -->
    <div class="signup__block app__block" v-if="state === 'signup'">
      <h2 class="signup__heading">
        {{ "sign-up.header" | globalize }}
      </h2>

      <form @submit.prevent="submit" novalidate>
        <div class="app__form-row">
          <div class="app__form-field">
            <input-field
              label="Username"
              v-model="form.username"
              @blur="touchField('form.username')"
              :error-message="
                getFieldErrorMessage('form.username', {
                  minLength: USERNAME_MIN_LENGTH
                })
              "
              :disabled="formMixin.isDisabled"
            />
          </div>
        </div>

        <div class="app__form-row">
          <div class="app__form-field">
            <input-field
              label="Password"
              type="password"
              v-model="form.password"
              @blur="touchField('form.password')"
              :error-message="getFieldErrorMessage('form.password')"
              :disabled="formMixin.isDisabled"
            />
          </div>
        </div>

        <div class="app__form-row">
          <div class="app__form-field">
            <input-field
              label="Password confirmation"
              type="password"
              v-model="form.confirmPassword"
              @blur="touchField('form.confirmPassword')"
              :error-message="getFieldErrorMessage('form.confirmPassword')"
              :disabled="formMixin.isDisabled"
            />
          </div>
        </div>

        <div class="app__form-row">
          <div class="app__form-field">
            <input-field
              label="Save this seed"
              v-model="form.seed"
              @blur="touchField('form.seed')"
              :error-message="getFieldErrorMessage('form.seed')"
              :disabled="formMixin.isDisabled"
            />
          </div>
        </div>

        <div class="app__form-actions">
          <button class="app__btn" :disabled="formMixin.isDisabled">
            {{ "sign-up.header-button" | globalize }}
          </button>
        </div>
      </form>
    </div>
    <!-- /Signup block-->

    <!-- Confirm Section -->
    <div class="signup__block app__block" v-else-if="state === 'submit'">
      <h2 class="signup__heading">
        {{ "sign-up.header" | globalize }}
      </h2>

      <p class="text">
        {{ "sign-up.app-block-text" | globalize }}
      </p>

      <br class="text small">

      <p class="text small">
        {{ "sign-up.app-block-text-small" | globalize }}
      </p>

      <br class="text">

      <div class="signup__qr-wrap">
        <qrcode
          :size="240"
          foreground="#3f4244"
          :value="form.publicKey" />
        <p class="signup__account-id small">
          {{ form.publicKey }}
        </p>
      </div>
    </div>
    <!-- /Confirm Section -->

    <!-- TFA Section -->
    <div class="signup__block app__block" v-if="state === 'tfa'">
      <g-auth @tfa-done="login" />
    </div>
    <!-- /TFA Section -->
  </div>
</template>

<script>
import Vue from 'vue'
import Qrcode from 'qrcode.vue'

import FormMixin from '@/mixins/form.mixin'
import {
  required,
  minLength,
  password,
  seed,
  sameAs,
  alphaNum,
} from '@/validators'

import StellarWallet from 'tokend-wallet-js-sdk'

import { base } from '@tokend/js-sdk'
import { api } from '@/api'
import config from '@/config'

import GAuth from '../../settings/GAuth.vue'

import { ErrorHandler } from '@/utils/ErrorHandler'

const USERNAME_MIN_LENGTH = 3

export default {
  name: 'sign-up',
  components: { GAuth, Qrcode },
  mixins: [FormMixin],

  data () {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        seed: '',
        publicKey: '',
        keypair: {},
      },
      state: 'signup',
      USERNAME_MIN_LENGTH,
    }
  },

  validations () {
    return {
      form: {
        username: {
          required,
          minLength: minLength(USERNAME_MIN_LENGTH),
          alphaNum,
        },
        password: { required, password },
        confirmPassword: {
          required,
          password,
          sameAsPassword: sameAs(function () {
            return this.form.password
          }),
        },
        seed: { required, seed },
      },
    }
  },

  created () {
    this.form.seed = base.Keypair.random().secret()
  },

  methods: {
    async isSigner () {
      try {
        const endpoint = `/v3/accounts/${config.MASTER_ACCOUNT}/signers`
        const { data } = await api.get(endpoint)
        const isSignerExists = data.find(
          item => item.id === this.form.publicKey
        )

        if (!isSignerExists) {
          setTimeout(this.isSigner, 5000)
          return
        }
      } catch (e) {
        ErrorHandler.processWithoutFeedback(e)
        setTimeout(this.isSigner, 5000)
        return
      }
      await this.createWallet()
    },

    async createWallet () {
      let walletCreated = false
      try {
        await Vue.auth.createWallet(this.form)
        walletCreated = true

        const res = await Vue.auth.login(this.form)

        if (!res.ok || res.enabledTFA) {
          ErrorHandler.process(
            'Can not automatically log into the system. Try to log yourself'
          )
          this.state = 'signup'
          return
        }

        this.state = 'tfa'
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)

        if (!walletCreated) {
          ErrorHandler.process(
            'You are not registered, try again to register with the secret key later'
          )
          this.state = 'signup'
        }
      }
    },

    login () {
      this.state = 'logged-in'
      this.$store.dispatch('LOG_IN')
      setTimeout(() => this.$router.push({ name: 'users' }), 1000)
    },

    async getUniqueCredentials (credential, errorText) {
      let response
      try {
        response = await StellarWallet.getUniqueCredentials({
          server: Vue.params.KEY_SERVER_ADMIN,
          key: credential.toLowerCase(),
        })
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        throw new Error('Server error')
      }

      if (response.status === 409) {
        throw new Error(errorText)
      }
    },

    async submit () {
      if (!this.isFormValid()) return

      this.form.keypair = base.Keypair.fromSecret(this.form.seed)
      this.form.publicKey = this.form.keypair.accountId()

      this.disableForm()
      this.$store.commit('OPEN_LOADER')
      try {
        await this.checkCredentials()
        this.$store.commit('CLOSE_LOADER')

        this.state = 'submit'
        await this.isSigner()
      } catch (err) {
        ErrorHandler.process(err)
        this.$store.commit('CLOSE_LOADER')
      }
      this.enableForm()
    },

    async checkCredentials () {
      await this.getUniqueCredentials(
        this.form.username,
        'Username already exist. Please select another'
      )
      await this.getUniqueCredentials(
        this.form.publicKey,
        'Account already exists'
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.signup__block.app__block {
  padding: 5.5rem 4rem 3.5rem;
  max-width: 41rem;
  margin: 0 auto;
}

.signup__heading {
  margin-bottom: 5rem;
}

.signup__qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signup__account-id {
  margin-top: 1rem;
  text-align: center;
  word-wrap: break-word;
  width: 100%;
  user-select: all;
}
</style>
