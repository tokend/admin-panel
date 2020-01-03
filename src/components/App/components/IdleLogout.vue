<template>
  <div class="idle-logout" v-if="showIdleForm">
    <div class="idle-logout__block app__block">
      <div class="idle-logout__content-wrp">
        <h2>{{ "idle-logout.header" | globalize }}</h2>
        <!--eslint-disable-->
        <p 
          class="text"
          v-html="$options.filters.globalize('idle-logout.text-long-inct')"  
        />
        <!--eslint-enable-->
        <div class="idle-logout__actions">
          <button class="app__btn" @click="extendSession">
            {{ "idle-logout.btn-cont" | globalize }}
          </button>
          <button class="app__btn-secondary" @click="endSession">
            {{ "idle-logout.btn-log-out" | globalize }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'idle-logout',

  data () {
    return {
      timeLeft: null,
      warnEndTimestamp: null,
      countdownInterval: null,
    }
  },

  computed: {
    showIdleForm () {
      return this.$store.getters.showIdleForm
    },
  },
  showTimeLeft () {
    return this.timeLeft || '...'
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

  methods: {
    initTimer () {
      const warnInterval = this.$store.getters.forceLogoutDelay
      this.warnEndTimestamp = moment()
        .add(warnInterval, 'seconds')
        .unix()
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
    },
  },
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
