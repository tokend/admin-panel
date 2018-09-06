<template>
  <div class="no-support-message">
    <div class="msg">
      The browser you're using doesn't support all the needed features. Please consider installing one of the following browsers.
      <div class="browser-icons">
        <span class="download">Download: </span>
        <a href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">
          <img src="../../../assets/ico/chrome-32png.png" alt="" class="browser-icon">
        </a>
        <a href="http://www.opera.com/download" target="_blank">
          <img src="../../../assets/ico/opera32.png" alt="" class="browser-icon">
        </a>
        <a href="https://www.mozilla.org/en-US/firefox/new/" target="_blank">
          <img src="../../../assets/ico/firefox32.png" alt="" class="browser-icon">
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'no-support-message',

  components: {
    // components
  },

  props: [],

  data () {
    return {
      // data
    }
  },

  created () {
    // created
  },

  computed: {
    // computed
  },

  methods: {
    // methods
  }
}
</script>

<style lang="scss" scoped>

  .no-support-message {
    height: 100%;
    left: 0;
    top: 0;
    text-align: center;
    position: fixed;
    width: 100%;

    .msg {
      padding-top: 30px;
    }

    .browser-icons {
      margin-top: 15px;
      text-align: center;

      img {
        height: 16px;
        width: 16px;
      }
    }
  }
</style>
