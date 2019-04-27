<template>
  <div>
    <router-link
      :to="{ name: 'users.index' }"
      class="users-show__back-btn"
    >
      <span class="users-show__back-btn-inner">
        <mdi-chevron-left-icon />
      </span>
      Back
    </router-link>
    <div class="users-show__details-wrp">
      <user-details
        :id="id"
        @reviewed="$emit(reviewed)"
      />
    </div>

    <div class="users-show__list-wrp">
      <user-op-list :id="id" />
    </div>
  </div>
</template>

<script>
import 'mdi-vue/ChevronLeftIcon'
import UserOpList from './UserOpList'
import UserDetails from './UserDetails'

export default {
  components: {
    UserOpList,
    UserDetails
  },
  props: ['id']

}
</script>

<style lang="scss">
@import "../../../../assets/scss/colors";

.users-show__back-btn {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: bold;
  color: $color-text;
  text-decoration: none;
}

.users-show__back-btn-inner {
  $dimension: 3.5rem;

  background: $color-content-bg;
  border-radius: 50%;
  box-shadow: 0 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  height: $dimension;
  margin-right: 10px;
  position: relative;
  transition: 0.2s;
  width: $dimension;

  &:hover {
    box-shadow: 0 2px 6.6px 0.6px rgba(170, 170, 170, 0.72);
  }

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.users-show__details-wrp {
  max-width: 104rem;
  margin-bottom: 7rem;
}
</style>
