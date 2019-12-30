<template>
  <div class="poll-viewer-attributes">
    <div class="poll-viewer-attributes__key-value-wrp">
      <label class="data-caption">
        Poll question and answers
      </label>

      <p class="poll-viewer-attributes__question">
        {{ poll.creatorDetails.question }}
      </p>

      <ul class="key-value-list">
        <li
          v-for="item in poll.creatorDetails.choices"
          :key="item.number"
        >
          <span>Answer #{{ item.number }}</span>
          <span>
            {{ item.description }}
          </span>
        </li>
      </ul>

      <label class="data-caption">
        Poll details
      </label>

      <ul class="key-value-list">
        <li>
          <span>Status</span>
          <span>
            <template v-if="poll.pollState.value === POLL_STATES.open">
              Open
            </template>

            <template v-else-if="poll.pollState.value === POLL_STATES.passed">
              Passed
            </template>

            <template v-else-if="poll.pollState.value === POLL_STATES.passed">
              Failed
            </template>

            <template v-else-if="poll.pollState.value === POLL_STATES.canceled">
              Canceled
            </template>
          </span>
        </li>

        <li>
          <span>Number of choices</span>
          <span>{{ poll.numberOfChoices }}</span>
        </li>

        <li>
          <span>Start time</span>
          <date-formatter
            :date="poll.startTime"
            format="DD MMM YYYY HH:mm:ss"
          />
        </li>

        <li>
          <span>End time</span>
          <date-formatter
            :date="poll.endTime"
            format="DD MMM YYYY HH:mm:ss"
          />
        </li>

        <li>
          <span>Permission type</span>
          <span>
            {{ poll.permissionType | pollTypeToString }}
          </span>
        </li>

        <li>
          <span>Result provider</span>
          <email-getter
            :account-id="poll.resultProvider.id"
            is-titled
          />
        </li>

        <li>
          <span>Vote confirmation required</span>
          <span>
            <template v-if="poll.voteConfirmationRequired">
              Yes
            </template>
            <template v-else>
              No
            </template>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import { DateFormatter } from '@comcom/formatters'

import { POLL_STATES } from '@/constants/poll-states'

export default {
  components: {
    DateFormatter,
    EmailGetter,
  },

  props: {
    poll: { type: Object, required: true },
  },

  data () {
    return {
      POLL_STATES,
    }
  },
}
</script>

<style scoped lang="scss">
.poll-viewer-attributes__question {
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
  line-height: 1.5;
}
</style>
