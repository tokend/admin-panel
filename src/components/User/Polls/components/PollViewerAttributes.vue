<template>
  <div class="poll-viewer-attributes">
    <div class="poll-viewer-attributes__key-value-wrp">
      <label class="data-caption">
        {{ "poll-viewer-attributes.label-poll-question" | globalize }}
      </label>

      <p class="poll-viewer-attributes__question">
        {{ poll.creatorDetails.question }}
      </p>

      <ul class="key-value-list">
        <li
          v-for="item in poll.creatorDetails.choices"
          :key="item.number"
        >
          <span>
            {{ "poll-viewer-attributes.answer" | globalize({
              number: item.number
            })
            }}
          </span>
          <span>
            {{ item.description }}
          </span>
        </li>
      </ul>

      <label class="data-caption">
        {{ "poll-viewer-attributes.label-poll-details" | globalize }}
      </label>

      <ul class="key-value-list">
        <li>
          <span>{{ "poll-viewer-attributes.status" | globalize }}</span>
          <span>
            <template v-if="poll.pollState.value === POLL_STATES.open">
              {{ "poll-viewer-attributes.open" | globalize }}
            </template>

            <template v-else-if="poll.pollState.value === POLL_STATES.passed">
              {{ "poll-viewer-attributes.passed" | globalize }}
            </template>

            <template v-else-if="poll.pollState.value === POLL_STATES.passed">
              {{ "poll-viewer-attributes.failed" | globalize }}
            </template>

            <template v-else-if="poll.pollState.value === POLL_STATES.canceled">
              {{ "poll-viewer-attributes.canceled" | globalize }}
            </template>
          </span>
        </li>

        <li>
          <span>
            {{ "poll-viewer-attributes.number-of-choise" | globalize }}
          </span>
          <span>{{ poll.numberOfChoices }}</span>
        </li>

        <li>
          <span>{{ "poll-viewer-attributes.start-time" | globalize }}</span>
          <span>{{ poll.startTime | formatDate }}</span>
        </li>

        <li>
          <span>{{ "poll-viewer-attributes.end-time" | globalize }}</span>
          <span>{{ poll.endTime | formatDate }}</span>
        </li>

        <li>
          <span>
            {{ "poll-viewer-attributes.permission-type" | globalize }}
            {{ poll.permissionType | pollTypeToString }}
          </span>
        </li>

        <li>
          <span>
            {{ "poll-viewer-attributes.result-provider" | globalize }}
          </span>
          <email-getter
            :account-id="poll.resultProvider.id"
            is-titled
          />
        </li>

        <li>
          <span>
            <!-- eslint-disable-next-line max-len -->
            {{ "poll-viewer-attributes.vote-confirmation-required" | globalize }}
          </span>
          <span>
            <template>
              {{ poll.voteConfirmationRequired | yesNoFilter }}
            </template>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'

import { POLL_STATES } from '@/constants/poll-states'

export default {
  components: {
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
