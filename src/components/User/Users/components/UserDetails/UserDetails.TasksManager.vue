<template>
  <div class="user-details-task-manager">
    <h3 class="user-details-task-manager__title">
      {{ "user-details-tasks-manager.manage-tasks" | globalize }}
    </h3>

    <h4 class="user-details-task-manager__section-heading">
      {{ "user-details-tasks-manager.current-request-tasks" | globalize }}
    </h4>

    <div class="user-details-task-manager__section-content">
      <p>
        {{ "user-details-tasks-manager.pending-tasks" | globalize({
          requestPendingTasks: request.pendingTasks
        })
        }}
      </p>
      <p>
        {{ "user-details-tasks-manager.all-tasks" | globalize({
          requestAllTasks: request.allTasks
        })
        }}
      </p>
    </div>

    <h4 class="user-details-task-manager__section-heading">
      {{ "user-details-tasks-manager.tasks-add" | globalize }}
    </h4>

    <div class="user-details-task-manager__section-content">
      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="'user-details-tasks-manager.lbl-submit-auto-verification' | globalize({
          submitAutoVerification: kvChangeRoleTasks.submitAutoVerification
        })"
        :cb-value="kvChangeRoleTasks.submitAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="'user-details-tasks-manager.lbl-complete-auto-verification' | globalize({
          completeAutoVerification: kvChangeRoleTasks.completeAutoVerification
        })"
        :cb-value="kvChangeRoleTasks.completeAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="'user-details-tasks-manager.lbl-manual-review-required' | globalize({
          manualReviewRequired :kvChangeRoleTasks.manualReviewRequired
        })"
        :cb-value="kvChangeRoleTasks.manualReviewRequired"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <tick-field
        class="app__form-field"
        v-model="tasks.toAdd"
        :label="'user-details-tasks-manager.lbl-default' | globalize({
          default :kvChangeRoleTasks.default
        })"
        :cb-value="kvChangeRoleTasks.default"
        :disabled="isPending"
      />
    </div>

    <h4 class="user-details-task-manager__section-heading">
      {{ "user-details-tasks-manager.tasks-remove" | globalize }}
    </h4>

    <div class="user-details-task-manager__section-content">
      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="'user-details-tasks-manager.lbl-submit-auto-verification-request' | globalize({
          submitAutoVerification: kvChangeRoleTasks.submitAutoVerification
        })"
        :cb-value="kvChangeRoleTasks.submitAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="'user-details-tasks-manager.lbl-submit-complete-verification-request' | globalize({
          completeAutoVerification: kvChangeRoleTasks.completeAutoVerification
        })"
        :cb-value="kvChangeRoleTasks.completeAutoVerification"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <!--eslint-disable max-len-->
      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="'user-details-tasks-manager.lbl-manual-review-required' | globalize({
          manualReviewRequired :kvChangeRoleTasks.manualReviewRequired
        })"
        :cb-value="kvChangeRoleTasks.manualReviewRequired"
        :disabled="isPending"
      />
      <!--eslint-enable max-len-->

      <tick-field
        class="app__form-field"
        v-model="tasks.toRemove"
        :label="'user-details-tasks-manager.lbl-default' | globalize({
          default :kvChangeRoleTasks.default
        })"
        :cb-value="kvChangeRoleTasks.default"
        :disabled="isPending"
      />
    </div>
  </div>
</template>

<script>
import { TickField } from '@comcom/fields'

import { ChangeRoleRequest } from '@/apiHelper/responseHandlers/requests/ChangeRoleRequest'
import { mapGetters } from 'vuex'

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
    }
  },

  computed: {
    ...mapGetters([
      'kvChangeRoleTasks',
    ]),
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
