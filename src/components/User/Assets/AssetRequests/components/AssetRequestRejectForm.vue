<template>
  <div class="trrf">
    <h2>
      Reject {{assetRequest.code}} {{assetRequest.type === 'create_asset' ? 'create' : 'update'}} request
    </h2>

    <form
      @submit.prevent="reject"
      id="trrf-form"
    >
      <div class="app__form-row">
        <text-field
          label="Describe reject reason"
          v-model="rejectReason"
          :disabled="isPending"
          rows="5"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          label="Reject permanently"
          v-model="isPermanentReject"
          :disabled="isPending"
        />
      </div>
    </form>

    <div class="trrf__form-actions app__form-actions">
      <button
        class="app__btn app__btn--danger"
        form="trrf-form"
        :disabled="isPending"
      >
        Reject
      </button>
      <button
        class="app__btn-secondary"
        @click="$emit('close')"
        :disabled="isPending"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
import TextField from '@comcom/fields/TextField'
import TickField from '@comcom/fields/TickField'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    TextField,
    TickField
  },

  props: ['assetRequest'],

  data () {
    return {
      isPending: false,
      rejectReason: '',
      isPermanentReject: false
    }
  },

  methods: {
    async reject () {
      this.isPending = true
      try {
        await this.assetRequest.reject(this.rejectReason, this.isPermanentReject)
        this.$store.dispatch('SET_INFO', 'Request successfully rejected')
        this.$router.push({ name: 'assets' })
      } catch (err) {
        ErrorHandler.process('Failed to reject asset creation')
      }
      this.isPending = false
    }
  }
}
</script>

<style lang="scss" scoped>
.trrf {
  font-size: 1.6rem;

  textarea {
    width: 100%;
  }
}

.trrf__form-actions.app__form-actions {
  margin-top: 3rem;

  & > .app__btn,
  & > .app__btn-secondary {
    flex: 0.33;
  }
}
</style>
