<template>
  <div class="g-auth">
    <h2 class="g-auth__heading">
      {{ "g-auth.header" | globalize }}
    </h2>

    <p class="text">
      {{ "g-auth.need-set-up-2fa" | globalize }}
    </p>
    <p class="text">
      {{ "g-auth.install-g-auth" | globalize }}
    </p>
    <br class="text small">
    <p class="g-auth__app-links">
      <a
        target="_blank"
        href="https://itunes.apple.com/app/google-authenticator/id388497605?mt=8"
      >
        <i class="mdi mdi-apple g-auth__icon" />
        <span>{{ "g-auth.ios" | globalize }}</span>
      </a>
      <a
        target="_blank"
        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
      >
        <i class="mdi mdi-android g-auth__icon" />
        <span>{{ "g-auth.android" | globalize }}</span>
      </a>
    </p>

    <br class="text">
    <p class="text">
      {{ "g-auth.scan-qr" | globalize }}
    </p>
    <br class="text small">
    <div class="g-auth__qr-wrap">
      <qrcode
        class="g-auth__qr"
        :size="240"
        foreground="#3f4244"
        :value="gAuthLink"
      />
      <p class="g-auth__secret">
        {{ secret }}
      </p>
      <br class="text">
    </div>
    <button
      class="app__btn"
      :disabled="buttonDisabled"
      @click="enableGAuth">
      {{ "g-auth.btn-enable" | globalize }}
    </button>
  </div>
</template>

<script>
import tfa from '@/apiHelper/tfa'
import Qrcode from 'qrcode.vue'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

export default {
  components: { Qrcode },

  data () {
    return {
      ready: false,
      submitButtonDisabled: false,
      gAuthLink: '',
      secret: '',
      id: '',
    }
  },

  computed: {
    buttonDisabled () {
      return this.$store.getters.showLoader
    },
  },

  async created () {
    let isDone = false
    this.$store.subscribe(mutation => {
      if (this.$store.getters.tfaInitiator !== 'g_auth') {
        return
      }

      switch (mutation.type) {
        case 'TFA_FORM_DONE':
          if (isDone) break
          isDone = true
          this.enableGAuth()
          break
        case 'TFA_FORM_CLOSE':
          this.clear()
          break
      }
    })

    await this.addGAuth()
  },

  methods: {
    clear () {
      this.credentials.phone = ''
      this.credentials.password = ''
      this.wantResend = false
    },

    async addGAuth () {
      this.$store.commit('OPEN_LOADER')

      try {
        const response = await tfa.addGAuth()

        this.gAuthLink = response.details.secret
        this.secret = response.details.secret_seed
        this.id = response.id

        this.$store.commit('CLOSE_LOADER')
      } catch (err) {
        this.$store.commit('CLOSE_LOADER')

        if (err.status === 409) {
          ErrorHandler.process(err, 'g-auth.tfa-already-created"')
        } else {
          ErrorHandler.process(err, 'g-auth.unable-add-tfa')
        }
      }
    },

    async enableGAuth () {
      this.$store.commit('OPEN_LOADER')

      try {
        await tfa.enableGAuth(this.id)

        this.$store.commit('CLOSE_LOADER')
        Bus.success('g-auth.two-factor-auth-enabled')

        this.$emit('tfa-done')
      } catch (err) {
        this.$store.commit('CLOSE_LOADER')

        if (err.response.status === 403 && err.response.data.extras) {
          return this.showTfaForm(err.response.data.extras.token)
        } else {
          ErrorHandler.process(err, 'g-auth.error')
        }
      }
    },

    showTfaForm (tfaToken) {
      if (this.wantResend) return

      this.$store.commit('OPEN_MODAL')
      this.$store.commit('REQUIRE_TFA', {
        tfaToken,
        phone: '',
        initiator: 'g_auth',
      })
      this.submitButtonDisabled = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.g-auth {
  width: 100%;
}

.g-auth__heading {
  margin-bottom: 5rem;
}

.g-auth__app-links {
  & > a {
    display: inline-block;
  }

  & > a + a {
    margin-left: 1.8rem;
  }

  & > a > i {
    margin-right: 0.5rem;
  }

  & > a > span,
  & > a > i {
    vertical-align: middle;
  }
}

.g-auth__qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.g-auth__secret {
  margin-top: 1rem;
  font-size: 2rem;
  align-self: stretch;
  text-align: center;
}

.g-auth__icon {
  font-size: 2.4rem;
  color: $color-text;
}
</style>
