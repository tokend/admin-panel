<template>
  <div class="admins-show">
    <div class="admins-show__manager-wrp">
      <admin-manager :id="id"/>
    </div>
  </div>
</template>

<script>
import AdminManager from './components/AdminManager'
export default {
  props: ['id'],

  components: {
    AdminManager
  }
}
</script>

<style scoped>

</style>
