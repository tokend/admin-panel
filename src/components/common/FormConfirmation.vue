<template>
  <transition name="form-confirmation__transition">
    <div class="form-confirmation">
      <p class="form-confirmation__msg">
        {{ message }}
      </p>

      <div class="form-confirmation__btns">
        <button
          class="form-confirmation__cancel-btn app__btn-secondary"
          type="button"
          @click.prevent="emitCancel"
          :disabled="isPending || isDisabled"
        >
          {{ cancelButtonText }}
        </button>

        <button
          type="submit"
          class="form-confirmation__ok-btn app__btn"
          @click.prevent="emitOk"
          :disabled="isPending || isDisabled"
        >
          <template v-if="!isPending">
            {{ okButtonText }}
          </template>

          <template v-else>
            {{ 'Processing…' }}
          </template>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
const CONFIRMATION_DISABLED_TIME = 1000

export default {
  props: {
    message: {
      type: String,
      default: 'Please, recheck the form before confirmation',
    },
    okButtonText: {
      type: String,
      default: 'Confirm',
    },
    cancelButtonText: {
      type: String,
      default: 'Cancel',
    },
    isPending: {
      type: Boolean,
      default: false,
    },
    okEvent: {
      type: String,
      default: 'ok',
    },
    cancelEvent: {
      type: String,
      default: 'cancel',
    },
  },
  data: _ => ({
    isDisabled: false,
  }),
  created () {
    this.isDisabled = true

    setTimeout(() => {
      this.isDisabled = false
    }, CONFIRMATION_DISABLED_TIME)
  },
  methods: {
    emitOk () {
      this.$emit(this.okEvent)
    },
    emitCancel () {
      this.$emit(this.cancelEvent)
    },
  },
}
</script>

<style lang="scss" scoped>
.form-confirmation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex: 1;
}

.form-confirmation__msg {
  font-size: 1.6rem;
  line-height: 1.25;
  padding-right: 1.6rem;
}

.form-confirmation__btns {
  display: flex;
  max-width: 25rem;
  margin-left: auto;
}

.form-confirmation__ok-btn,
.form-confirmation__cancel-btn {
  flex: 0.5;

  &:not(:first-child) {
    margin-left: 0.5rem;
  }
}

.form-confirmation__transition-enter-active {
  animation: form-confirmation__transition-keyframes 0.2s ease-in-out;
}

.form-confirmation__transition-leave-active {
  display: none;
  animation: form-confirmation__transition-keyframes 0s ease-in-out reverse;
}

@keyframes form-confirmation__transition-keyframes {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
