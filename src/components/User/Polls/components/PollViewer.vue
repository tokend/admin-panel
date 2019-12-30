<template>
  <div class="poll-viewer">
    <h2>{{ "poll-viewer.header" }}</h2>

    <div class="app__block">
      <template v-if="isLoaded">
        <tabs>
          <tab name="Details">
            <poll-viewer-attributes :poll="poll" />
          </tab>

          <tab name="Voters">
            <poll-viewer-voters :poll="poll" />
          </tab>
        </tabs>
      </template>

      <template v-else-if="isFailed">
        <p class="text danger">
          {{ "poll-viewer.error" }}
        </p>
      </template>

      <template v-else>
        <p class="text">
          {{ "poll-viewer.loading" }}
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { Tabs, Tab } from '@comcom/Tabs'

import PollViewerAttributes from './PollViewerAttributes'
import PollViewerVoters from './PollViewerVoters'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { api } from '@/api'

export default {
  components: {
    Tabs,
    Tab,
    PollViewerAttributes,
    PollViewerVoters,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      poll: {},
      isLoaded: false,
      isFailed: false,
    }
  },

  created () {
    this.getPoll(this.id)
  },

  methods: {
    async getPoll (id) {
      try {
        const { data } = await api.getWithSignature(`/v3/polls/${id}`, {
          include: ['participation', 'participation.votes'],
        })
        this.poll = data
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isFailed = true
      }
    },
  },
}
</script>
