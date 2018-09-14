<template>
  <header class="user-header">
    <nav class="user-header__nav">
      <slot name="nav"/>
    </nav>

    <user-account-widget/>
  </header>
</template>

<script>
import UserAccountWidget from './UserAccountWidget'
export default {
  components: { UserAccountWidget }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
.user-header {
  height: 5rem;
  background-color: $color-header-bg;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);
  display: flex;
  justify-content: space-between;
  padding: 0 3rem;
}

.user-header__nav {
  height: 100%;

  & > a {
    display: inline-block;
    height: 100%;
    text-decoration: none;
    color: $color-text-inverse;
    border-bottom: 2px solid transparent;
    display: inline-flex;
    align-items: center;

    & + a {
      margin-left: 6rem;
    }

    &.router-link-exact-active {
      border-color: $color-text-inverse;
    }

    &:hover {
      opacity: .8;
    }
  }
}
</style>
