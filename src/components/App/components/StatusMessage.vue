<template>
  <transition name="status-message__transition">
    <div
      v-if="isShown"
      :class="`status-message status-message--${messageType}`"
    >
      <div class="status-message__icon-wrp">
        <i
          class="mdi status-message__icon"
          :class="[`status-message__icon--${messageType}`, messageIconClass]"
        />
      </div>

      <div class="status-message__payload">
        <h4 class="status-message__title">
          {{ messageTitle }}
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
  </transition>
</template>

<script>
import { Bus } from '@/utils/bus'

const CLOSE_TIMEOUT_MS = 10000
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
    timeoutId: -1,
  }),

  computed: {
    messageTitle () {
      switch (this.messageType) {
        case MESSAGE_TYPES.success:
          return 'Success'
        case MESSAGE_TYPES.error:
          return 'Error'
        case MESSAGE_TYPES.info:
          return 'Notification'
        case MESSAGE_TYPES.warning:
          return 'Warning'
        default:
          return ''
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

  methods: {
    show (messageType, payload) {
      this.messageType = messageType
      this.message = payload
      this.isShown = true

      if (this.timeoutId >= 0) {
        window.clearTimeout(this.timeoutId)
      }

      this.timeoutId = window.setTimeout(_ => {
        this.isShown = false
      }, CLOSE_TIMEOUT_MS)
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
  z-index: 11;
  max-width: 42rem;
  min-width: 32rem;
  display: flex;
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
