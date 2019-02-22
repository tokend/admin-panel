<template>
  <div class="admins-index">
    <div class="admins-index__heading-row">
      <h2>Admin list</h2>

      <div class="admins-index__actions">
        <router-link class="admins-index__create-btn app__btn app__btn--iconed"
          :to="{ name: 'admins.new' }">
          <mdi-plus-icon/> New admin
        </router-link>
      </div>
    </div>

    <div class="admins-index__list-wrap">
      <admin-list/>
    </div>
  </div>
</template>

<script>
import { Sdk } from '@/sdk'

import 'mdi-vue/PlusIcon'
import AdminList from './components/AdminList'
import InputField from '@comcom/fields/InputField'
import config from '@/config'

import { confirmAction } from '../../../js/modals/confirmation_message'

export default {
  name: 'admins',

  components: {
    AdminList,
    InputField
  },

  data () {
    return {
      thresholds: {
        lowThreshold: 0,
        medThreshold: 0,
        highThreshold: 0
      },
      isThresholdPending: false,
      isThresholdSubmitDisabled: true,
      admins: []
    }
  },

  created () {
    this.getThresholds()
  },

  computed: {
    masterAccount () {
      return this.$store.getters.masterId
    }
  },

  methods: {
    async getThresholds () {
      try {
        const response = await Sdk.horizon.account.get(config.MASTER_ACCOUNT)
        const { thresholds } = response.data
        this.thresholds = thresholds
      } catch (error) {
        console.error(error)
        this.$store.dispatch('SET_ERROR', 'Can’t load thresholds')
      }
    },
    async updateThresholds () {
      if (!await confirmAction()) return

      this.isThresholdPending = true

      try {
        const operation = Sdk.base.SetOptionsBuilder.setOptions({
          lowThreshold: this.thresholds.lowThreshold,
          medThreshold: this.thresholds.medThreshold,
          highThreshold: this.thresholds.highThreshold
        })
        await Sdk.horizon.transactions.submitOperations(operation)
        this.isThresholdPending = false
        this.$store.dispatch('SET_INFO', 'Pending transaction for updating thresholds submitted')
      } catch (error) {
        this.isThresholdPending = false
        console.error(error)
        error.showMessage()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admins-index__heading-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  align-items: center;

  &:not(:first-of-type) {
    margin-top: 5.5rem;
  }

  & > h2 {
    margin-bottom: 0;
  }
}

.admins-index__actions {
  flex: 1;
  max-width: 17rem;
}

.admins-index__create-btn {
  font-weight: 600;
  text-decoration: none;

  &.app__btn {
    padding: 0.9rem;
  }

  & > svg {
    margin-left: -1rem;
    margin-right: 0.7rem;
  }
}

.admins-index__threshold-form-row {
  align-items: stretch;

  & > .app__btn {
    padding: 0;
    flex: 0.75;
  }
}

.admins-index__threshold-hint {
  margin-top: 2rem;
}
</style>
