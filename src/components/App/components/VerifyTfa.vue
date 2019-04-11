<template>
  <div class="verify-tfa" v-if="isRequired">
    <div class="verify-tfa__block app__block">
      <h2 class="verify-tfa__heading">
        2FA Required
      </h2>

      <p class="verify-tfa__text text">
        Enter your verification code to proceed.
      </p>

      <form class="verify-tfa__form" id="verify-tfa-form" @submit.prevent="verifyTFACode">
        <div class="app__form-row">
          <input-field class="app__form-field"
                       :disabled="submitButtonDisabled"
                       v-model.trim="verificationCode"
                       label="Verification Code"
                       autofocus
          />
        </div>

        <div class="verify-tfa__form-actions app__form-actions">
          <button class="app__btn-secondary app__btn-secondary--danger" type="button" @click="close()">
            Cancel
          </button>
          <button class="verify-tfa__btn-wide app__btn"
                  form="verify-tfa-form"
                  :disabled="submitButtonDisabled"
                  type="submit"
          >
            Submit
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { InputField } from '@comcom/fields'

export default {
  name: 'verify-tfa',
  components: { InputField },

  data () {
    return {
      submitButtonDisabled: false,
      verificationCode: ''
    }
  },

  computed: {
    isRequired () {
      return this.$store.getters.tfaIsRequired
    }
  },

  methods: {
    verifyTFACode () {
      if (this.verificationCode === '') {
        this.$store.dispatch('SET_ERROR', 'Enter a verification code')
        return false
      }
      this.submitButtonDisabled = true
      return Vue.api.tfa.verifyTfaCode(this.verificationCode, this.$store.getters.tfaToken)
        .then(() => {
          this.submitButtonDisabled = false
          this.verificationCode = ''
          this.$store.commit('TFA_FORM_DONE')
          this.$store.dispatch('CLOSE_TFA')
        }).catch(err => {
          console.error(err)
          this.submitButtonDisabled = false
          this.verificationCode = ''

          if (err.status !== 400) {
            this.$store.dispatch('SET_ERROR', 'Verification failed')
          } else {
            this.$store.dispatch('SET_ERROR', 'Verification code mismatched')
            this.$store.commit('TFA_FORM_FALSE')
          }
        })
    },

    requestNew () {
      this.verificationCode = ''
      this.$store.commit('TFA_FORM_RESEND')
    },

    close () {
      this.verificationCode = ''
      this.$store.dispatch('CLOSE_TFA')
    }
  }
}
</script>

<style lang="scss" scoped>
.verify-tfa {
  position: fixed;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.verify-tfa__block {
  width: 100%;
  max-width: 35rem;
}

.verify-tfa__btn-wide {
  flex: 1.75;
}

.verify-tfa__heading,
.verify-tfa__form {
  margin-bottom: 2rem;
}

.verify-tfa__text {
  margin-bottom: 2rem;
}
</style>
