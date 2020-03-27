<template>
  <div class="rules-list">
    <template v-if="isLoaded">
      <template v-if="isLoadFailed">
        <p>
          {{ "rules-list.fail-load" | globalize }}
        </p>
      </template>

      <template v-else>
        <template v-if="rules.length">
          <div class="rules-list__table-header">
            <span class="rules-list__li-name-or-id secondary">
              {{ "rules-list.name-or-id" | globalize }}
            </span>

            <span class="rules-list__li-action-name secondary">
              {{ "rules-list.action-name" | globalize }}
            </span>
            <span
              v-if="!isAccountRules"
              class="rules-list__li-is-default secondary"
            >
              {{ "rules-list.is-default" | globalize }}
            </span>

            <span class="rules-list__li-forbids secondary">
              {{ "rules-list.forbids" | globalize }}
            </span>

            <span class="rules-list__li-resource secondary">
              {{ "rules-list.resource-type" | globalize }}
            </span>
          </div>

          <ul class="rules-list__ul">
            <li
              class="rules-list__li"
              v-for="(rule, i) in rules"
              :key="i">
              <router-link
                class="rules-list__li-a"
                :to="{
                  name: getRouteLinkName,
                  params: { rule }
                }"
              >
                <span
                  class="rules-list__li-name-or-id"
                  :title="rule.nameOrId"
                >
                  {{ rule.nameOrId }}
                </span>

                <span
                  class="rules-list__li-action-name"
                  :title="formatAction(rule.actionValue)"
                >
                  {{ formatAction(rule.actionValue) }}
                </span>

                <span
                  v-if="!isAccountRules"
                  class="rules-list__li-is-default"
                  :title="rule.isDefault | yesNoFilter"
                >
                  {{ rule.isDefault | yesNoFilter }}
                </span>

                <span
                  class="rules-list__li-forbids"
                  :title="rule.forbids | yesNoFilter"
                >
                  {{ rule.forbids | yesNoFilter }}
                </span>

                <span
                  class="rules-list__li-resource"
                  :title="rule.resourceType"
                >
                  {{ rule.resourceType }}
                </span>
              </router-link>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="app-list__li-like">
            <p>
              {{ "rules-list.no-data" | globalize }}
            </p>
          </div>
        </template>
      </template>
    </template>
    <template v-else>
      <div class="app-list__li-like">
        <p>
          {{ "rules-list.loading" | globalize }}
        </p>
      </div>
    </template>
    <div class="app__more-btn-wrp app__more-btn-wrp--left">
      <collection-loader
        :first-page-loader="loadRules"
        @first-page-load="setRules"
        @next-page-load="concatRules"
        ref="listCollectionLoader"
      />
    </div>
  </div>
</template>

<script>
import { CollectionLoader } from '@/components/common'

import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { RuleRecord } from '@/js/records/rule.record'
import {
  accountRuleActionsFilter,
  signerRuleActionsFilter,
} from '@/components/App/filters/filters'

export default {
  name: 'rules-list',
  components: {
    CollectionLoader,
  },
  props: {
    isAccountRules: { type: Boolean, required: true },
  },

  data () {
    return {
      rules: [],
      isLoaded: false,
      isLoadFailed: false,
    }
  },

  computed: {
    getRouteLinkName () {
      return this.isAccountRules
        ? 'rules.account.manage'
        : 'rules.signer.manage'
    },
  },

  watch: {
    isAccountRules () {
      this.reloadList()
    },
  },

  methods: {
    async loadRules () {
      this.isLoaded = false
      this.isLoadFailed = false
      let response = {}
      try {
        const endpoint = this.isAccountRules ? '/v3/account_rules' : '/v3/signer_rules'
        response = await api.getWithSignature(endpoint)
      } catch (error) {
        this.isLoadFailed = true
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoaded = true
      return response
    },

    setRules (rules) {
      this.rules = rules.map(i => new RuleRecord(i))
    },

    concatRules (rules) {
      this.rules = this.rules.concat(
        rules.map(i => new RuleRecord(i))
      )
    },

    reloadList () {
      return this.$refs.listCollectionLoader.loadFirstPage()
    },

    formatAction (val) {
      return this.isAccountRules
        ? accountRuleActionsFilter(val)
        : signerRuleActionsFilter(val)
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.rules-list__table-header {
  width: 100%;
  display: flex;
  padding: 0 2.5rem;
  margin-bottom: 0.5rem;
}

.rules-list__li {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);

  & + & {
    margin-top: 2rem;
  }
}

.rules-list__li-a {
  width: 100%;
  display: flex;
  padding: 2rem 2.5rem;
  text-decoration: none;
  color: inherit;
}

%space-right {
  &:not(:last-of-type) {
    margin-right: 3rem;
  }
}

.rules-list__li-name-or-id {
  width: 20%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.rules-list__li-action-name,
.rules-list__li-forbids,
.rules-list__li-resource,
.rules-list__li-is-default {
  width: 20%;
  text-align: center;
}

.app__more-btn-wrp--left {
  margin-right: auto;
  margin-left: 0;
}
</style>
