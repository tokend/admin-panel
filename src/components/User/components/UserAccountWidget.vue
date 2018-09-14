<template>
  <div class="user-account-widget">
    <button class="user-account-widget__btn" @click="togglePane()">
      <span class="user-account-widget__btn-content">
        <span class="user-account-widget__initials">
          {{initials}}
        </span>

        <p class="user-account-widget__name">
          {{fullName}}
        </p>

        <span class="user-account-widget__expand-art"></span>
      </span>
    </button>

    <div class="user-account-widget__pane" v-if="isPaneShown">
      <ul class="user-account-widget__action-list">
        <li class="user-account-widget__action-list-item">
          <button class="user-account-widget__action-btn" @click="signOut()">
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getters } from '@store/types'

export default {
  data () {
    return {
      isPaneShown: false
    }
  },
  computed: {
    ...mapGetters({
      user: getters.GET_USER
    }),
    initials () {
      return `${this.user.name.charAt(0).toUpperCase()}`
    },
    fullName () {
      return `${this.user.name}`
    }
  },
  methods: {
    togglePane () {
      this.isPaneShown = !this.isPaneShown
    },
    signOut () {
      this.$store.dispatch('LOG_OUT')
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.user-account-widget {
  color: $color-text-inverse;
  display: inline-block;
  position: relative;
  height: 100%;
}

.user-account-widget__btn {
  text-align: initial;
  border: none;
  background: none;
  height: 100%;
}

.user-account-widget__btn-content {
  display: inline-flex;
  align-items: center;
}

.user-account-widget__initials {
  display: inline-block;
  border: 2px solid $color-text-inverse;
  border-radius: 50%;
  padding: 0.4rem;
  margin-right: 0.7rem;
  line-height: 1.1;
  height: 3rem;
  width: 3rem;
  text-align: center;
}

.user-account-widget__name {
  margin-right: 0.7rem;
}

.user-account-widget__expand-art {
  width: 1rem;
  height: 0.5rem;
  position: relative;
  display: inline-block;

  &:after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border: 0.5rem solid;
    border-color: $color-text-inverse transparent transparent transparent;
  }
}

.user-account-widget__pane {
  background-color: $color-content-bg;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 12rem;
  padding: 0.5rem 0;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);
}

.user-account-widget__action-btn {
  border: none;
  background: none;
  height: 4rem;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: $color-sub-nav-hover;
  }
}

.user-account-widget__action-list-item {
  color: $color-text;
}
</style>
