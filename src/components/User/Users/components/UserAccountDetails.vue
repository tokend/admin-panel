<template>
  <div>
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
.users-show__details-wrp {
  max-width: 104rem;
  margin-bottom: 7rem;
}
</style>
