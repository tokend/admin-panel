<template>
  <div class="signup" v-if="state !== 'logged-in'">

    <!-- Signup block -->
    <div class="signup__block app__block" v-if="state === 'signup'">
      <h2 class="signup__heading">
        Sign Up
      </h2>

      <form @submit.prevent="submit">
        <div class="app__form-row">
          <div class="app__form-field">
            <input-field label="Username"
              v-model="credentials.username"
            />
            <span v-show="formErrors.username.error" class="small danger">
              {{formErrors.username.message}}
            </span>
          </div>
        </div>

        <div class="app__form-row">
          <div class="app__form-field">
            <input-field label="Password"
              type="password"
              v-model="credentials.password"
            />
            <span v-show="formErrors.password.error" class="small danger">
              {{formErrors.password.message}}
            </span>
          </div>
        </div>

        <div class="app__form-row">
          <div class="app__form-field">
            <input-field label="Password confirmation"
              type="password"
              v-model="credentials.confirmPassword"
            />
            <span v-show="formErrors.confirmPassword.error" class="small danger">
              {{formErrors.confirmPassword.message}}
            </span>
          </div>
        </div>

        <div class="app__form-row">
          <div class="app__form-field">
            <input-field label="Save this seed"
              v-model="credentials.seed"
            />
            <span v-show="formErrors.seed.error" class="small danger">
              {{ formErrors.seed.message}}
            </span>
          </div>
        </div>

        <div class="app__form-actions">
          <button class="app__btn" :disabled="buttonDisabled">
            Sign Up
          </button>
        </div>
      </form>
    </div>
    <!-- /Signup block-->

    <!-- Confirm Section -->
    <div class="signup__block app__block" v-else-if="state === 'submit'">
      <h2 class="signup__heading">
        Sign Up
      </h2>

      <p class="text">
        Ask an existing administrator to register the following account ID.<br>
      </p>

      <br class="text small">

      <p class="text small">
        <em>Important:</em> Do not reload the page!
        You’ll be redirected automatically once your account is created
      </p>

      <br class="text">

      <div class="signup__qr-wrap">
        <qrcode :size="240" foreground="#3f4244" :value="credentials.publicKey"></qrcode>
        <p class="signup__account-id small">
          {{credentials.publicKey}}
        </p>
      </div>
    </div>
    <!-- /Confirm Section -->

    <!-- TFA Section -->
    <div class="signup__block app__block" v-if="state === 'tfa'">
      <g-auth @tfa-done="login"></g-auth>
    </div>
    <!-- /TFA Section -->
  </div>
</template>

<script>
import Vue from 'vue'
import Qrcode from 'qrcode.vue'
import StellarWallet from 'tokend-wallet-js-sdk'
import { Sdk } from '@/sdk'
import { ApiCallerFactory } from '@/api-caller-factory'
import config from '@/config'
import GAuth from '../../settings/GAuth.vue'
import { ErrorHandler } from '@/utils/ErrorHandler'

import InputField from '@comcom/fields/InputField'

export default {
  name: 'sign-up',
  components: { GAuth, Qrcode, InputField },
  data () {
    return {
      credentials: {
        username: '',
        password: '',
        confirmPassword: '',
        publicKey: '',
        seed: '',
        keypair: {}
      },
      userNameValidatorRegExp: /^\w+$/,

      formErrors: {
        seed: { error: false, message: '' },
        username: { error: false, message: '' },
        password: { error: false, message: '' },
        confirmPassword: { error: false, message: '' }
      },
      state: 'signup'
    }
  },

  created () {
    this.credentials.seed = Sdk.base.Keypair.random().secret()
  },

  methods: {
    async isSigner () {
      try {
        const { data } = await ApiCallerFactory
          .createPublicCallerInstance()
          .get(`/v3/accounts/${config.MASTER_ACCOUNT}/signers`)
        const isSignerExists = data
          .find(item => item.id === this.credentials.publicKey)

        if (!isSignerExists) {
          setTimeout(this.isSigner, 5000)
          return
        }
      } catch (e) {
        ErrorHandler.processWithoutFeedback(e)
        setTimeout(this.isSigner, 5000)
        return
      }
      return this.createWallet()
    },

    createWallet () {
      let walletCreated = false
      return Vue.auth.createWallet(this.credentials)
        .then(() => {
          walletCreated = true
          return Vue.auth.login(this.credentials)
        }).then(res => {
          if (!res.ok || res.enabledTFA) {
            ErrorHandler.process('Can not automatically log into the system. Try to log yourself')
            this.state = 'signup'
            return
          }

          this.state = 'tfa'
        }).catch((err) => {
          ErrorHandler.processWithoutFeedback(err)
          if (!walletCreated) {
            ErrorHandler.process('You are not registered, try again to register with the secret key later')
            this.state = 'signup'
          }
        })
    },

    login () {
      this.state = 'logged-in'
      this.$store.dispatch('LOG_IN')
      setTimeout(() => this.$router.push({ name: 'users' }), 1000)
    },

    getUniqueCredentials (credential, errorText) {
      return StellarWallet.getUniqueCredentials({
        server: Vue.params.KEY_SERVER_ADMIN,
        key: credential.toLowerCase()
      }).then((success) => {
        if (success.status === 409) {
          return { success: false, error: errorText }
        } else if (success.status === 200) {
          return { success: true }
        }
      }).catch(err => {
        ErrorHandler.processWithoutFeedback(err)
        return { success: false, error: 'Server error' }
      })
    },

    submit () {
      this.credentials.keypair = Sdk.base.Keypair.fromSecret(this.credentials.seed)
      this.credentials.publicKey = this.credentials.keypair.accountId()
      this.$store.commit('OPEN_LOADER')
      this.validate().then((data) => {
        this.$store.commit('CLOSE_LOADER')
        if (data) {
          this.state = 'submit'
          this.isSigner()
        }
      }).catch(err => {
        ErrorHandler.processWithoutFeedback(err)
        this.$store.commit('CLOSE_LOADER')
      })
    },

    validate () {
      let valid = true
      this.formErrors = {
        seed: { error: false, message: '' },
        username: { error: false, message: '' },
        password: { error: false, message: '' },
        confirmPassword: { error: false, message: '' }
      }

      if (this.credentials.username === '') {
        this.formErrors.username = { error: true, message: 'Enter username' }
        valid = false
      }
      if (this.credentials.username.length < 3) {
        this.formErrors.username = {
          error: true,
          message: 'Use at least 3 characters for username'
        }
        valid = false
      }
      if (!this.userNameValidatorRegExp.test(this.credentials.username)) {
        this.formErrors.username = {
          error: true,
          message: 'Only alphaumeric values allowed (A-Z, a-z, 0-9, _)'
        }
        valid = false
      }
      if (this.credentials.password === '') {
        this.formErrors.password = { error: true, message: 'Enter password' }
        valid = false
      }
      if (this.credentials.confirmPassword === '') {
        this.formErrors.confirmPassword = {
          error: true,
          message: 'Enter the same password again'
        }
        valid = false
      }
      if (this.credentials.password.length < 8) {
        this.formErrors.password = {
          error: true,
          message: 'Use at least 8 characters for password'
        }
        valid = false
      }
      if (this.credentials.password !== this.credentials.confirmPassword) {
        this.formErrors.confirmPassword = {
          error: true,
          message: 'Enter the same password again'
        }
        valid = false
      }

      const usernamePromise = this.getUniqueCredentials(this.credentials.username, 'Username already exist. Please select another')
      const accountPromise = this.getUniqueCredentials(this.credentials.publicKey, 'Account already exist')

      return Promise.all([accountPromise, usernamePromise]).then((data) => {
        if (!this.formErrors.seed.error) {
          if (!data[0].success) {
            this.formErrors.seed = { error: true, message: 'Account is already exist' }
            valid = false
          }
        }
        if (!this.formErrors.username.error) {
          if (!data[1].success) {
            this.formErrors.username = { error: true, message: 'Username already exist. Please select another' }
            valid = false
          }
        }

        return valid
      })
    }
  }
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
