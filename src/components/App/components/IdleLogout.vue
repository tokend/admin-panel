<template>
  <div class="idle-logout" v-if="showIdleForm">
    <div class="idle-logout__block app__block">
      <div class="idle-logout__content-wrp">
        <h2> Session Timeout Warning </h2>

        <p class="text">
          The session is about to expire due to long inactivity.<br>
          Click <strong>Continue</strong> to extend the session.<br>
          <br>
          Session expires in {{timeLeft || '...'}}<br>
        </p>

        <div class="idle-logout__actions">
          <button class="app__btn" @click="extendSession">
            Continue
          </button>
          <button class="app__btn-secondary" @click="endSession">
            Log out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'IdleLogout',

  data () {
    return {
      timeLeft: null,
      warnEndTimestamp: null,
      countdownInterval: null
    }
  },

  created () {
    this.$store.subscribe((mutation, state) => {
      switch (mutation.type) {
        case 'SHOW_IDLE_FORM': {
          this.initTimer()
          break
        }
        case 'CLOSE_MODAL': {
          document.body.classList.remove('modal-open')
          break
        }
      }
    })
  },

  computed: {
    showIdleForm () {
      return this.$store.getters.showIdleForm
    }
  },

  methods: {
    initTimer () {
      const warnInterval = this.$store.getters.forceLogoutDelay
      this.warnEndTimestamp = moment().add(warnInterval, 'seconds').unix()
      this.countdownInterval = setInterval(() => {
        const msLeft = moment
          .duration(this.warnEndTimestamp - moment().unix(), 'seconds')
          .asMilliseconds()

        if (msLeft <= 0) {
          this.endSession()
        } else {
          this.timeLeft = moment(msLeft).format('mm:ss')
        }
      }, 1000)
    },

    extendSession () {
      clearInterval(this.countdownInterval)
      this.$store.dispatch('CLOSE_IDLE_FORM')
    },

    endSession () {
      clearInterval(this.countdownInterval)
      this.$store.dispatch('LOG_OUT')
      this.$router.push({ name: 'login' })
      location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.idle-logout {
  position: fixed;
  width: 100%;
  width: 100vw;
  height: 100%;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.idle-logout__block.app__block {
  max-width: 45rem;
}

.idle-logout__actions {
  margin-top: 5rem;
  display: flex;
}
</style>
