<template>
  <div class="g-auth">
    <h2 class="g-auth__heading">Two-factor authentication</h2>

    <p class="text">You have to set up 2FA to proceed.</p>
    <p class="text">Please install Google Authenticator to your device:</p>
    <br class="text small">
    <p class="g-auth__app-links">
      <a target="_blank" href="https://itunes.apple.com/app/google-authenticator/id388497605?mt=8">
        <mdi-apple-icon/><span>iOS</span>
      </a>
      <a target="_blank" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">
        <mdi-android-icon/><span>Android</span>
      </a>
    </p>

    <br class="text">
    <p class="text"> Scan the QR-code or enter the code manually using Google Authenticator </p>
    <br class="text small">
    <div class="g-auth__qr-wrap">
      <qrcode class="g-auth__qr" :size="240" foreground="#3f4244" :value="gAuthLink"></qrcode>
      <p class="g-auth__secret">{{secret}}</p>
      <br class="text">
    </div>
    <button class="app__btn" :disabled="buttonDisabled" @click="enableGAuth()">
      Enable
    </button>
  </div>
</template>

<script>
import Vue from 'vue'
import Qrcode from 'v-qrcode'
import 'mdi-vue/AppleIcon'
import 'mdi-vue/AndroidIcon'

export default {
  components: { Qrcode },

  computed: {
    buttonDisabled () {
      return this.$store.getters.showLoader
    }
  },

  data () {
    return {
      ready: false,
      submitButtonDisabled: false,
      gAuthLink: '',
      secret: '',
      id: ''
    }
  },

  created () {
    let isDone = false
    this.$store.subscribe((mutation) => {
      if (this.$store.getters.tfaInitiator !== 'g_auth') {
        return
      }

      switch (mutation.type) {
        case 'TFA_FORM_DONE': {
          if (isDone) break
          isDone = true
          this.enableGAuth()
          break
        }

        case 'TFA_FORM_CLOSE': {
          this.clear()
          break
        }

      }
    })
    this.addGAuth()
  },

  methods: {
    clear () {
      this.credentials.phone = ''
      this.credentials.password = ''
      this.wantResend = false
    },

    addGAuth () {
      this.$store.commit('OPEN_LOADER')
      return Vue.api.tfa.addGAuth()
        .then(response => {
          this.gAuthLink = response.details.secret
          this.secret = response.details.secret_seed
          this.id = response.id

          this.$store.commit('CLOSE_LOADER')
        }).catch(err => {
          console.error(err)
          this.$store.commit('CLOSE_LOADER')

          if (err.status === 409) {
            this.$store.dispatch('SET_ERROR', 'TFA already created. Just re-login')
          } else {
            this.$store.dispatch('SET_ERROR', 'Unable to add TFA. Try to re-login')
          }
        })
    },

    enableGAuth () {
      this.$store.commit('OPEN_LOADER')
      return Vue.api.tfa.enableGAuth(this.id)
        .then(() => {
          this.$store.commit('CLOSE_LOADER')
          this.$store.dispatch('SET_INFO', 'Two-factor Authentication enabled')

          this.$emit('tfa-done')
        }).catch((err) => {
          this.$store.commit('CLOSE_LOADER')

          if (err.status === 403 && err.extras) {
            return this.showTfaForm(err.extras.token)
          } else {
            this.$store.dispatch('SET_ERROR', 'Something went wrong. Try again later')
          }
        })
    },

    showTfaForm (token) {
      if (this.wantResend) return

      this.$store.commit('OPEN_MODAL')
      this.$store.commit('REQUIRE_TFA', {
        token: token,
        phone: '',
        initiator: 'g_auth'
      })
      this.submitButtonDisabled = false
    }
  }
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

  & > a > svg {
    margin-right: .5rem;
  }

  & > a > span,
  & > a > svg {
    vertical-align: middle;
  }
}

.g-auth__qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.g-auth__secret {
  font-size: 2rem;
  align-self: stretch;
  text-align: center;
}

</style>
