<template>
    <div class="cover">
        <div class="progress-outer">
            <div class="progress"></div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'loading-screen',
  data () {
    return {
      intervalId: '',
      rotation: 0
    }
  },
  methods: {
    rotate () {
      this.rotation++
    }
  },
  created () {
    this.intervalId = window.setInterval(this.rotate, 10)
  },
  destroyed () {
    window.clearInterval(this.intervalId)
  }
}
</script>

<style lang="scss">
@import "../../../assets/scss/colors";
$brand-seashell: #fff7f2;
$brand-gold: #ff9900;
$deep-blue: #0066cc;

.cover {
  background: rgba(0, 0, 0, 0.3);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100;
}

.progress-outer {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
}

.progress {
  border-radius: 50%;
  border: 2px solid $brand-seashell;
  border-left-color: $color-loader-fill;
  height: 55px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 55px;

  animation: 0.75s spin infinite linear;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
