<template>
  <div class="admins-index">
    <div class="admins-index__heading-row">
      <h2>Admin list</h2>

      <div class="admins-index__actions">
        <router-link
          class="admins-index__create-btn app__btn app__btn--iconed"
          :to="{ name: 'admins.new' }">
          <mdi-plus-icon /> New admin
        </router-link>
      </div>
    </div>

    <div class="admins-index__list-wrap">
      <admin-list />
    </div>
  </div>
</template>

<script>
import 'mdi-vue/PlusIcon'
import AdminList from './components/AdminList'

export default {
  name: 'admins',

  components: {
    AdminList,
  },
}
</script>

<style lang="scss" scoped>
.admins-index__heading-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  align-items: center;

  &:not(:first-of-type) {
    margin-top: 5.5rem;
  }

  & > h2 {
    margin-bottom: 0;
  }
}

.admins-index__actions {
  flex: 1;
  max-width: 17rem;
}

.admins-index__create-btn {
  font-weight: 600;
  text-decoration: none;

  &.app__btn {
    padding: 0.9rem;
  }

  & > svg {
    margin-left: -1rem;
    margin-right: 0.7rem;
  }
}
</style>
