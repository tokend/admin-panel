<template>
  <vue-markdown class="markdown-formatter"
    :source="source"
    :prerender="prerender"
    :anchor-attributes="{ target: '_blank' }"
  />
</template>

<script>
import VueMarkdown from 'vue-markdown'
export default {
  components: {
    VueMarkdown
  },

  props: [
    // proxies
    'source'
  ],

  methods: {
    prerender (str) {
      str = str || ''
      const re = /<br>\s*<\/br>|<br\s*\/>|<br>/gi
      const newLineSequence = '&nbsp;  \n'
      return str.replace(re, newLineSequence)
    }
  }
}
</script>

<style lang="scss">
.markdown-formatter {
  font-size: 1.6em;

  p, ul, ol, li {
    font-size: 1em;
    line-height: 1.5;
  }

  p {
    margin: 1em 0;
  }

  ul {
    display: block;
    margin: 0 0 1em;
    padding: 0 0 0 4em;

    & > li {
      list-style-type: disc;
    }
  }

  ol {
    display: block;
    margin: 0 0 1em;
    padding: 0 0 0 4em;

    & > li {
      list-style-type: decimal;
    }
  }

  h1 {
    display: block;
    font-size: 2em;
    margin: 0.67em 0;
    font-weight: 300;
  }

  h2 {
    display: block;
    font-size: 1.5em;
    margin: 0.83em 0;
    font-weight: 300;
  }

  h3 {
    display: block;
    font-size: 1.17em;
    margin: 1em 0;
    font-weight: bold;
  }

  h4 {
    display: block;
    font-size: 1em;
    margin: 1.33em 0;
    font-weight: bold;
  }

  h5 {
    display: block;
    font-size: .83em;
    margin: 1.67em 0;
    font-weight: bold;
  }

  h6 {
    display: block;
    font-size: .67em;
    margin: 2.33em 0;
    font-weight: bold;
  }
}
</style>
