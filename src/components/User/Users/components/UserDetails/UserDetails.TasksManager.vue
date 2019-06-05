<template>
  <div class="user-details-task-manager">
    <h3 class="user-details-task-manager__title">
      Manage tasks (advanced)
    </h3>

    <h4 class="user-details-task-manager__section-heading">
      Current request tasks
    </h4>

    <div class="user-details-task-manager__section-content">
      <p>Pending tasks: {{ request.pendingTasks }}</p>
      <p>All tasks: {{ request.allTasks }}</p>
    </div>

    <h4 class="user-details-task-manager__section-heading">
      Tasks to add
    </h4>

    <div class="user-details-task-manager__section-content">
      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="`Submit auto verification request (${CHANGE_ROLE_TASKS.submitAutoVerification})`"
        :cb-value="CHANGE_ROLE_TASKS.submitAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="`Complete auto verification request (${CHANGE_ROLE_TASKS.completeAutoVerification})`"
        :cb-value="CHANGE_ROLE_TASKS.completeAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="`Manual review required (${CHANGE_ROLE_TASKS.manualReviewRequired})`"
        :cb-value="CHANGE_ROLE_TASKS.manualReviewRequired"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="`Default (${CHANGE_ROLE_TASKS.default})`"
        :cb-value="CHANGE_ROLE_TASKS.default"
        :disabled="isPending"
      />
    </div>

    <h4 class="user-details-task-manager__section-heading">
      Tasks to remove
    </h4>

    <div class="user-details-task-manager__section-content">
      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="`Submit auto verification request (${CHANGE_ROLE_TASKS.submitAutoVerification})`"
        :cb-value="CHANGE_ROLE_TASKS.submitAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="`Complete auto verification request (${CHANGE_ROLE_TASKS.completeAutoVerification})`"
        :cb-value="CHANGE_ROLE_TASKS.completeAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="`Manual review required (${CHANGE_ROLE_TASKS.manualReviewRequired})`"
        :cb-value="CHANGE_ROLE_TASKS.manualReviewRequired"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="`Default (${CHANGE_ROLE_TASKS.default})`"
        :cb-value="CHANGE_ROLE_TASKS.default"
        :disabled="isPending"
      />
    </div>
  </div>
</template>

<script>
import { TickField } from '@comcom/fields'

import config from '@/config'

import { ChangeRoleRequest } from '@/api/responseHandlers/requests/ChangeRoleRequest'

const EVENTS = {
  input: 'input',
}

export default {
  name: 'user-details-tasks-manager',
  components: { TickField },

  props: {
    request: {
      type: ChangeRoleRequest,
      default: () => new ChangeRoleRequest({}),
    },
    value: {
      type: Object,
      required: true,
    },
    isPending: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      tasks: {},
      CHANGE_ROLE_TASKS: config.CHANGE_ROLE_TASKS,
    }
  },

  watch: {
    tasks: {
      handler: function (value) {
        this.$emit(EVENTS.input, this.tasks)
      },
      deep: true,
    },

    value () {
      this.setTasks()
    },
  },

  created () {
    this.setTasks()
  },

  methods: {
    setTasks () {
      if (this.value.toAdd || this.value.toRemove) {
        this.tasks = this.value
      } else {
        this.tasks = {
          toAdd: 0,
          toRemove: this.request.pendingTasks,
        }
      }
    },
  },
}
</script>

<style scoped>
.user-details-task-manager__title {
  margin-bottom: 1.5rem;
}

.user-details-task-manager__section-heading {
  margin-bottom: 1rem;
}

.user-details-task-manager__section-content {
  margin-bottom: 2rem;
}
</style>
