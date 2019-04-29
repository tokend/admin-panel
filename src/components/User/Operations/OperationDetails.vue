<template>
  <div>
    <router-link
      :to="{ name: 'users.userDetails' }"
      class="users-show__back-btn"
    >
      <span class="users-show__back-btn-inner">
        <mdi-chevron-left-icon />
      </span>
      Back
    </router-link>
    <div class="operation-details">
      <div class="app__block">
        <h2>Operation details</h2>
        <div class="operation-details__op-details-wrp">
          <details-reader :details="operation" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'mdi-vue/ChevronLeftIcon'
import DetailsReader from '../../common/details/DetailsReader'

export default {
  components: {
    DetailsReader
  },
  data: _ => ({
    userId: null,
    operation: {},
    operationId: null
  }),
  created () {
    window.scroll(0, 0)
    this.userId = this.$route.params.id
    this.operation = this.$route.params.operation
  }
}
</script>

<style lang="scss">
@import "../../../assets/scss/colors";

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
</style>
