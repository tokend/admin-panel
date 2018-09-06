<template>
  <div class="users-show">
    <button class="users-show__back-btn" @click="back">
      <span class="users-show__back-btn-inner">
        <mdi-chevron-left-icon/>
      </span>
      Back
    </button>
    <template v-if="view.mode === VIEW_MODES_VERBOSE.user">
      <div class="users-show__details-wrp">
        <user-details :id="id"/>
      </div>

      <div class="users-show__list-wrp">
        <user-op-list :id="id" @op-select="toggleViewMode"/>
      </div>
    </template>
    <template v-if="view.mode === VIEW_MODES_VERBOSE.operation">
      <op-details :id="view.operationId" :user-id="id"/>
    </template>
  </div>
</template>

<script>
import UserOpList from './components/UserOpList'
import UserDetails from './components/UserDetails'
import OpDetails from '@/components/User/Operations/Operations.Show.vue'

import 'mdi-vue/ChevronLeftIcon'

const VIEW_MODES_VERBOSE = {
  user: 'user',
  operation: 'operation'
}

export default {
  components: {
    UserOpList,
    UserDetails,
    OpDetails
  },

  props: ['id'],

  data: _ => ({
    view: {
      mode: VIEW_MODES_VERBOSE.user,
      operationId: null
    },
    VIEW_MODES_VERBOSE
  }),

  methods: {
    toggleViewMode (id) {
      if (id) {
        this.view.mode = VIEW_MODES_VERBOSE.operation
        this.view.operationId = id
        return
      }
      this.view.mode = VIEW_MODES_VERBOSE.user
      this.view.operationId = null
    },
    back () {
      if (this.view.mode === VIEW_MODES_VERBOSE.user) {
        this.$emit('back')
        return
      }
      this.view.mode = VIEW_MODES_VERBOSE.user
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.users-show__back-btn {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.users-show__back-btn-inner {
  $dimension: 3.5rem;

  background: $color-content-bg;
  border-radius: 50%;
  box-shadow: 0 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  height: $dimension;
  margin-right: 10px;
  position: relative;
  transition: .2s;
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
