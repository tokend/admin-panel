<template>
  <header class="auth-header">
    <div class="auth-header__container app__container">
      <!-- eslint-disable-next-line max-len -->
      <div
        class="auth-header__header-group auth-header__header-group--vertical"
      >
        <span class="auth-header__admin-logo">
          {{ "auth-header.admin-logo" | globalize }}
        </span>
        <span class="auth-header__admin-badge">
          {{ "auth-header.admin-panel" | globalize }}
        </span>
      </div>

      <div class="auth-header__header-group">
        <nav class="auth-header__nav">
          <li class="auth-header__nav-li">
            <router-link :to="{ name: 'signup' }">
              {{ "auth-header.sign-up" | globalize }}
            </router-link>
          </li>

          <li class="auth-header__nav-li">
            <router-link :to="{ name: 'login' }">
              {{ "auth-header.sign-in" | globalize }}
            </router-link>
          </li>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import config from '@/config'

export default {
  data () {
    return {
      config,
    }
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.auth-header {
  background-color: $color-header-bg;
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
    color: $color-text-inverse;
    text-decoration: none;
    font-size: 1.6rem;
    line-height: 3.4rem;
    display: inline-flex;
    align-items: center;
    padding: 0 1.5rem;

    &:hover {
      background-color: rgba(#fff, 0.2);
    }

    & > .mdi-icon {
      fill: rgba($color: $color-text-inverse, $alpha: 0.5);
      width: 1.4rem;
      height: 1.4rem;
      margin-left: 0.7rem;
      vertical-align: middle;
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

  &--vertical {
    flex-direction: column;
    align-items: flex-start;
  }
}

.auth-header__admin-badge {
  display: inline-block;
  color: $color-text-inverse;
  font-size: 1.2rem;
  align-self: flex-start;
  opacity: 0.5;
  letter-spacing: 0.08rem;
}
</style>
