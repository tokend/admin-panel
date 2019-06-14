<template>
  <div class="poll-viewer-voters">
    <template v-if="voters.length">
      <table class="poll-viewer-voters__table">
        <thead>
          <tr>
            <th>Voter</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in voters"
            :key="index"
          >
            <td>
              <email-getter :account-id="item.voter.id" />
            </td>
            <td>{{ getChoiceText(item.voteData) }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else>
      <p class="text">
        No votes yet.
      </p>
    </template>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import _get from 'lodash/get'

export default {
  components: {
    EmailGetter,
  },

  props: {
    poll: { type: Object, required: true },
  },

  computed: {
    voters () {
      return this.poll.participation.votes
    },
  },

  methods: {
    getChoiceText (choiceData) {
      const choiceNumber = (choiceData || {}).singleChoice
      const choice = _get(this.poll, 'creatorDetails.choices', [])
        .find(i => i.number === choiceNumber)

      return choice.description
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/colors';

$side-padding: 0.8rem;

.poll-viewer-voters__table {
  width: calc(100% + #{$side-padding} * 2);
  margin: 0 (-$side-padding) 0 (-$side-padding);
  font-size: 1.6rem;
  border-collapse: collapse;

  & > thead > tr > th {
    color: $color-text-secondary;
    font-weight: normal;
  }

  & > thead > tr > th,
  & > tbody > tr > td {
    text-align: left;
    padding: 0.4rem;
    vertical-align: top;

    &:first-child {
      padding-left: $side-padding;
    }

    &:last-child {
      padding-right: $side-padding;
    }
  }

  & > tbody > tr:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
}
</style>
