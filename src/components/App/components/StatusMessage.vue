<template>
    <div v-if="message.text" class="status-modal" @click="close()">
        <p :class="'status-message status-message--' + message.type">
            {{ message.text }}
        </p>
    </div>
</template>

<script>
import store from '@store'

export default {
  name: 'status-message',
  computed: {
    message () {
      return store.getters.message
    }
  },
  methods: {
    close () {
      store.commit('CLEAN_MESSAGE')
    }
  }
}
</script>

<style lang="scss" scoped>
$brand-red: #cc6666;
$brand-blue: #6699cc;
$brand-porcelain: #f4f3f2;

.status-modal {
  position: fixed;
  z-index: 999;
  width: 100%;
  padding-top: 100px;
  margin: auto;
}

.status-message {
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  text-align: center;
  padding: 20px 40px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;

  &--info {
    color: $brand-porcelain;
    background-color: $brand-blue;
  }

  &--error {
    color: $brand-porcelain;
    background-color: $brand-red;
  }
}
</style>
