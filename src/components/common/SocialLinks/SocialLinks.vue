<template>
  <div class="socials">
    <p class="socials__link-group" v-for="link in socials" :key="link">
      <span class="socials__ico-wrp">
        <template v-if="/facebook|fb\./.test(link)">
          <mdi-facebook-box-icon class="socials__ico socials__ico--facebook" />
        </template>
        <template v-if="/linkedin/.test(link)">
          <mdi-linkedin-box-icon class="socials__ico socials__ico--linkedin" />
        </template>
        <template v-if="/twitter/.test(link)">
          <mdi-twitter-box-icon class="socials__ico socials__ico--twitter" />
        </template>
      </span>
      <a class="socials__link" :href="link" target="_blank" rel="noopener">
        {{ link }}
      </a>
    </p>
  </div>
</template>

<script>
import 'mdi-vue/FacebookBoxIcon'
import 'mdi-vue/LinkedinBoxIcon'
import 'mdi-vue/TwitterBoxIcon'
export default {
  data () {
    return {
      socials: []
    }
  },

  props: ['links'],

  created () {
    this.getSocials()
  },

  methods: {
    getSocials () {
      if (typeof this.links === 'string') {
        this.socials = JSON.parse(this.links).parsedArray
      } else {
        this.socials = this.links
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

$color-facebook: #3b5999;
$color-linkedin: #0077B5;
$color-twitter: #55acee;

.socials__link-group {
  line-height: 1.5;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  & + & {
    margin-top: .8rem;
  }

  & > .socials__ico-wrp,
  & > .socials__link {
    vertical-align: middle;
  }
}

.socials__link {
  color: $color-text;
  &:hover {
    opacity: 0.8;
  }
}

.socials__ico-wrp {
  display: inline-block;
  width: 2.4rem;
  height: 2.4rem;
}

.socials__ico {
  width: 100%;
  height: 100%;

  &--facebook {
    fill: $color-facebook;
  }

  &--linkedin {
    fill: $color-linkedin;
  }

  &--twitter {
    fill:$color-twitter;
  }
}
</style>
