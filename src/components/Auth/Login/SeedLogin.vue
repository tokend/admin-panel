<template>
  <div class="s-login">
    <div class="s-login__block app__block">
      <h2 class="s-login__heading">
        {{ "seed-login.header" | globalize }}
      </h2>

      <form
        @submit.prevent="seedLogin"
        novalidate
      >
        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="password"
            v-model.trim="form.seed"
            name="seed"
            :label="'seed-login.lbl-seed' | globalize"
            @blur="touchField('form.seed')"
            :error-message="getFieldErrorMessage('form.seed')"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="app__form-actions">
          <button
            class="app__btn"
            :disabled="formMixin.isDisabled"
          >
            {{ "seed-login.btn-sign-in" | globalize }}
          </button>
        </div>
      </form>

      <p class="login__alt-action">
        <router-link :to="{ name: 'auth' }">
          {{ "seed-login.classic-sign-in" | globalize }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import FormMixin from '@/mixins/form.mixin'

import { ErrorHandler } from '@/utils/ErrorHandler'

import { required, seed } from '@/validators'

export default {
  name: 'seed-login',
  mixins: [FormMixin],

  data () {
    return {
      form: {
        seed: '',
        pending: false,
      },
    }
  },

  validations () {
    return {
      form: {
        seed: { required, seed },
      },
    }
  },

  methods: {
    async seedLogin () {
      if (!this.isFormValid()) return

      this.disableForm()
      try {
        await Vue.auth.seedLogin(this.form.seed)
        this.$store.dispatch('LOG_IN')
        setTimeout(() => this.$router.push({ name: 'users' }), 100)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },
  },
}
</script>

<style scoped>
.s-login__block.app__block {
  padding: 5.5rem 4rem 3.5rem;
  max-width: 41rem;
  margin: 0 auto;
}

.s-login__block--wider.app__block {
  max-width: 54rem;
}

.s-login__heading {
  margin-bottom: 5rem;
}

.login__alt-action {
  margin-top: 1.2rem;
  font-size: 1.6rem;
}
</style>
