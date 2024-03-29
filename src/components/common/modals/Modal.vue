<template>
  <div class="modal" @click="onClick">
    <div
      class="modal__content"
      :style="{ maxWidth: maxWidth, minWidth: minWidth }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    minWidth: { type: String, default: '' },
    maxWidth: { type: String, default: '' },
  },

  created () {
    document.addEventListener('keydown', this.onDocumentKeyDown, false)
  },

  destroyed () {
    document.removeEventListener('keydown', this.onDocumentKeyDown, false)
  },

  methods: {
    onClick (event) {
      let isContentClicked
      try {
        const path = event.path || (event.composedPath && event.composedPath())
        isContentClicked = path
          .map(item => {
            return item.className
          })
          .includes('modal__content')
      } catch (error) { // older browsers
        isContentClicked = event.target.className === 'modal__content'
      }

      if (!isContentClicked) {
        this.emitCloseRequest()
      }
    },

    onDocumentKeyDown (event) {
      const keyCode = event.which || event.keyCode

      if (keyCode === 27) { // esc key
        this.emitCloseRequest()
      }
    },

    emitCloseRequest () {
      this.$emit('close-request')
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 800;
  animation: modal__a-fade-in 0.2s;
  background: rgba(0, 0, 0, 0.5);
}

@keyframes modal__a-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal__content {
  width: 100%;
  max-width: 100%;
  overflow: auto;
  border-radius: 0.3rem;
  background-color: $color-content-bg;
  box-shadow: 0px 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  padding: 4rem;
  max-height: 85vh;
}
</style>
