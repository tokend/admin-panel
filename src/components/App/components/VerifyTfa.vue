<template>
  <div class="verify-tfa" v-if="isRequired">
    <div class="verify-tfa__block app__block">
      <h2 class="verify-tfa__heading">
        2FA Required
      </h2>

      <p class="verify-tfa__text text">
        Enter your verification code to proceed.
      </p>

      <form
        class="verify-tfa__form"
        id="verify-tfa-form"
        @submit.prevent="verifyTFACode"
        novalidate
      >
        <div class="app__form-row">
          <input-field
            class="app__form-field"
            v-model.trim="form.verificationCode"
            label="Verification Code"
            autofocus
            @blur="touchField('form.verificationCode')"
            :error-message="getFieldErrorMessage('form.verificationCode')"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="verify-tfa__form-actions app__form-actions">
          <button
            class="app__btn-secondary app__btn-secondary--danger"
            type="button"
            @click="close()"
            :disabled="formMixin.isDisabled"
          >
            Cancel
          </button>

          <button
            class="verify-tfa__btn-wide app__btn"
            form="verify-tfa-form"
            :disabled="formMixin.isDisabled"
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
import { ErrorHandler } from '@/utils/ErrorHandler'

import FormMixin from '@/mixins/form.mixin'
import { required } from '@/validators'

export default {
  name: 'verify-tfa',
  mixins: [FormMixin],

  data () {
    return {
      form: {
        verificationCode: '',
      },
    }
  },

  validations () {
    return {
      form: {
        verificationCode: { required },
      },
    }
  },

  computed: {
    isRequired () {
      return this.$store.getters.tfaIsRequired
    },
  },

  methods: {
    async verifyTFACode () {
      if (!this.isFormValid()) {
        return
      }

      this.disableForm()
      try {
        await Vue.api.tfa.verifyTfaCode(
          this.form.verificationCode,
          this.$store.getters.tfaToken
        )

        this.enableForm()
        this.clearFields()

        this.$store.commit('TFA_FORM_DONE')
        this.$store.dispatch('CLOSE_TFA')
      } catch (err) {
        this.enableForm()
        this.clearFields()

        if (err.status !== 400) {
          ErrorHandler.process('Verification failed')
        } else {
          ErrorHandler.process('Verification code mismatched')
          this.$store.commit('TFA_FORM_FALSE')
        }
      }
    },

    requestNew () {
      this.clearFields()
      this.$store.commit('TFA_FORM_RESEND')
    },

    close () {
      this.clearFields()
      this.$store.dispatch('CLOSE_TFA')
    },
  },
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
