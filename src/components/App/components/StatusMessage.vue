<template>
  <transition name="status-message__transition">
    <div
      v-if="isShown"
      :class="`status-message status-message--${messageType}`"
      @mouseenter="stopProgressBar"
      @mouseleave="startProgressBar"
    >
      <div class="status-message__body">
        <div class="status-message__icon-wrp">
          <i
            class="mdi status-message__icon"
            :class="[`status-message__icon--${messageType}`, messageIconClass]"
          />
        </div>

        <div class="status-message__payload">
          <h4 class="status-message__title">
            {{ messageTitle | globalize }}
          </h4>

          <p class="status-message__text">
            {{ message }}
          </p>
        </div>

        <button
          @click="isShown = false"
          class="status-message__close-btn"
        />
      </div>
      <div class="status-message__progress-bar">
        <span
          class="status-message__progress-bar-percentage"
          :style="{ 'width': getInvertedProgressPercents + '%' }"
          :class="`status-message__progress-bar-percentage--${messageType}`"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import { Bus } from '@/utils/bus'
import { MathUtil } from '@/utils/math.util'

const CLOSE_TIMEOUT_MS = 10000
const ONE_HUNDRED_PERCENTS = 100
const MAX_ANIMATION_PROGRESS = 1
const MIN_ANIMATION_PROGRESS = 0
const MESSAGE_TYPES = Object.freeze({
  warning: 'warning',
  success: 'success',
  error: 'error',
  info: 'info',
})

export default {
  name: 'status-message',

  data: _ => ({
    message: '',
    messageType: '',
    messageArgs: {},
    isShown: false,
    animationFrame: -1,
    progressBar: {
      progress: 0,
      paused: false,
    },
  }),

  computed: {
    messageTitle () {
      switch (this.messageType) {
        case MESSAGE_TYPES.success:
          return 'status-message.success'
        case MESSAGE_TYPES.error:
          return 'status-message.error'
        case MESSAGE_TYPES.info:
          return 'status-message.notification'
        case MESSAGE_TYPES.warning:
          return 'status-message.warning'
        default:
          return 'status-message.default'
      }
    },

    messageIconClass () {
      switch (this.messageType) {
        case MESSAGE_TYPES.success:
          return 'mdi-emoticon-cool-outline'
        case MESSAGE_TYPES.error:
          return 'mdi-emoticon-cry-outline'
        case MESSAGE_TYPES.info:
          return 'mdi-information-outline'
        case MESSAGE_TYPES.warning:
          return 'mdi-alert-outline'
        default:
          return ''
      }
    },

    getInvertedProgressPercents () {
      const animationProgressPercents = MathUtil.multiply(
        this.progressBar.progress,
        ONE_HUNDRED_PERCENTS
      )

      const animationProgressPercentsInverted = MathUtil.subtract(
        ONE_HUNDRED_PERCENTS,
        animationProgressPercents
      )
      return animationProgressPercentsInverted
    },
  },

  created () {
    Bus.on(Bus.eventList.success, payload =>
      this.show(MESSAGE_TYPES.success, payload))
    Bus.on(Bus.eventList.warning, payload =>
      this.show(MESSAGE_TYPES.warning, payload))
    Bus.on(Bus.eventList.error, payload =>
      this.show(MESSAGE_TYPES.error, payload))
    Bus.on(Bus.eventList.info, payload =>
      this.show(MESSAGE_TYPES.info, payload))
  },

  destroyed () {
    cancelAnimationFrame(this.animationFrame)
  },

  methods: {
    show (messageType, payload) {
      this.messageType = messageType
      this.message = payload
      cancelAnimationFrame(this.animationFrame)
      this.progressBar.progress = MIN_ANIMATION_PROGRESS
      this.isShown = true
      this.startAnimationTimeout()
    },

    startAnimationTimeout (currentAnimationTime = 0) {
      const animationStartTime = performance.now()
      const calculateAnimationProgress = () => {
        this.animationFrame = requestAnimationFrame((timestamp) => {
          if (this.progressBar.paused) {
            cancelAnimationFrame(this.animationFrame)
            return
          }

          const animationTime = MathUtil.subtract(
            currentAnimationTime,
            animationStartTime
          )
          const animationRuntime = MathUtil.add(
            timestamp,
            animationTime
          )
          const animationProgress = MathUtil.divide(
            animationRuntime,
            CLOSE_TIMEOUT_MS
          )

          if (animationRuntime < CLOSE_TIMEOUT_MS) {
            this.progressBar.progress = animationProgress
            calculateAnimationProgress()
          } else {
            this.progressBar.progress = MAX_ANIMATION_PROGRESS
            cancelAnimationFrame(this.animationFrame)
            this.isShown = false
          }
        })
      }
      calculateAnimationProgress()
    },

    stopProgressBar () {
      this.progressBar.paused = true
    },

    startProgressBar () {
      this.progressBar.paused = false
      const currentAnimationTime = MathUtil.multiply(
        CLOSE_TIMEOUT_MS,
        this.progressBar.progress
      )

      this.startAnimationTimeout(currentAnimationTime)
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

$payload-padding: 2.4rem;
$icon-padding: 2.4rem;

.status-message {
  position: fixed;
  right: 4rem;
  top: 4rem;
  z-index: 1000;
  max-width: 42rem;
  min-width: 32rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.4rem 1rem 0 rgba(0, 0, 0, 0.15);

  &--warning {
    background-color: $color-warning;
  }

  &--success {
    background-color: $color-content-bg;
  }

  &--error {
    background-color: $color-danger;
  }

  &--info {
    background-color: $color-content-bg;
  }
}

.status-message__body {
  display: flex;
}

.status-message__progress-bar {
  position: absolute;
  width: 100%;
  height: 0.5rem;
  bottom: 0;
}

.status-message__progress-bar-percentage {
  position: absolute;
  top: 0;
  left: 0;
  height: 0.5rem;
  width: 100%;
  background-color: $color-success;
  max-width: 100%;

  &--success {
    background-color: $color-success;
  }

  &--error {
    background-color: $color-text-inverse;
  }

  &--info {
    background-color: $color-info;
  }

  &--warning {
    background-color: $color-text-inverse;
  }
}

.status-message__icon-wrp {
  min-width: 4.2rem;
  padding: $icon-padding 1.2rem $icon-padding $icon-padding;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-message__icon {
  display: flex;
  font-size: 3.6rem;

  &--success { color: $color-success; }
  &--error { color: $color-text-inverse; }
  &--info { color: $color-info; }
  &--warning { color: $color-text-inverse; }
}

.status-message__payload {
  padding: $payload-padding $payload-padding $payload-padding 1.2rem;
  flex: 1;
}

.status-message__title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  color: $color-text-inverse;
}

.status-message--success .status-message__title,
.status-message--info .status-message__title {
  color: $color-text;
}

.status-message__text {
  font-size: 1.6rem;
  line-height: 1.25;
  color: $color-text-inverse;
}

.status-message--success .status-message__text,
.status-message--info .status-message__text {
  color: $color-text-secondary;
}

.status-message__close-btn {
  position: relative;
  width: 4rem;
  align-self: stretch;
  background-color: transparent;
  display: block;

  &:hover {
    transition: 0.2s;
    background-color: $color-sub-nav-hover;
  }

  /* cross */
  $cross-stroke-width: 0.2rem;
  $cross-stroke-height: 2rem;

  &:before,
  &:after {
    transition: 0.2s;

    content: '';
    position: absolute;
    height: $cross-stroke-height;
    width: $cross-stroke-width;
    top: $payload-padding - 0.2rem;
    // wait for 10.0.2 stylelint version
    /* stylelint-disable function-calc-no-invalid */
    left: calc(50% - (#{$cross-stroke-width} / 2));
    /* stylelint-enable function-calc-no-invalid */
    background-color: $color-text-inverse;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }

  &:hover:before {
    transform: rotate(225deg);
  }

  &:hover:after {
    transform: rotate(135deg);
  }

  &:hover:after,
  &:hover:before {
    transition: 0.2s;
    // wait for 10.0.2 stylelint version
    /* stylelint-disable function-calc-no-invalid */
    top: calc(50% - (#{$cross-stroke-height} / 2));
    /* stylelint-enable function-calc-no-invalid */
  }
  /* /cross */
}

.status-message--success .status-message__close-btn,
.status-message--info .status-message__close-btn {
  &:before,
  &:after {
    background-color: $color-text-secondary;
  }
}

.status-message__transition-enter-active,
.status-message__transition-leave-active {
  transition: all 0.2s linear;
}

.status-message__transition-enter,
.status-message__transition-leave-to {
  transform: rotateX(90deg);
  opacity: 0;
}
</style>
