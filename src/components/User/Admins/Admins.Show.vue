<template>
  <div class="admins-show">
    <div class="admins-show__manager-wrp">
      <admin-manager :id="id" />
    </div>
  </div>
</template>

<script>
import AdminManager from './components/AdminManager'
export default {

  components: {
    AdminManager,
  },
  props: ['id'],
}
</script>

<style scoped>

</style>
