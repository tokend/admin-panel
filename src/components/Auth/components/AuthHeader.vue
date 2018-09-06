<template>
  <header class="auth-header">
    <div class="auth-header__container app__container">
      <div class="auth-header__header-group">
        <span class="auth-header__admin-logo">TokenD</span>
        <span class="auth-header__admin-badge">ADMIN PANEL</span>
      </div>

      <div class="auth-header__header-group">
        <nav class="auth-header__nav">
          <li class="auth-header__nav-li auth-header__nav-li--emphasis">
            <router-link :to="{name: 'signup' }">Sign Up</router-link>
          </li>

          <li class="auth-header__nav-li">
            <router-link :to="{name: 'login' }">Sign In</router-link>
          </li>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import config from '@/config'
import 'mdi-vue/OpenInNewIcon'
export default {
  data () {
    return {
      config
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.auth-header {
  background-color: $deep-blue;
  height: 8rem;
}

.auth-header__admin-logo {
  color: #fff;
  font-size: 20px;
  margin-right: 20px;
}

.auth-header__container.app__container {
  max-width: 100rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-header__logo {
  width: 11rem;
  height: auto;
}

.auth-header__nav {
  display: flex;
  align-items: center;
}

.auth-header__nav-li {
  & > a {
    color: $color-text-white;
    text-decoration: none;
    font-size: 1.6rem;
    line-height: 3.4rem;
    display: inline-flex;
    align-items: center;
    padding: 0 2.5rem;

    &:hover {
      background-color: rgba(#fff, .2);
    }

    & > .mdi-icon {
      fill: rgba($color: $color-text-white, $alpha: 0.5);
      width: 1.4rem;
      height: 1.4rem;
      margin-left: .7rem;
      vertical-align: middle;
    }
  }

  &--emphasis {
    margin: 0 2rem;

    & > a {
      display: inline-block;
      line-height: 3.4rem;
      min-width: 11rem;
      padding: 0 2.5rem;
      text-align: center;
    }
  }
}

.auth-header__header-group {
  display: flex;
  flex: 1;
  align-items: center;

  &:last-of-type {
    justify-content: flex-end;
  }
}

.auth-header__admin-badge {
  display: inline-block;
  color: $color-text-white;
  font-size: 1.2rem;
  align-self: flex-end;
  opacity: .5;
  letter-spacing: .08rem;
}
</style>
