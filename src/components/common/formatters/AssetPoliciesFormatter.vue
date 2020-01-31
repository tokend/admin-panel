<template>
  <span class="asset-policies-formatter capitalized">
    {{
      [
        (mask & ASSET_POLICIES.transferable) &&
          ('asset-policies-formatter.transferable' | globalize),
        (mask & ASSET_POLICIES.baseAsset) &&
          ('asset-policies-formatter.base-asset' | globalize),
        (mask & ASSET_POLICIES.statsQuoteAsset) &&
          ('asset-policies-formatter.stats-quote-asset' | globalize),
        (mask & ASSET_POLICIES.withdrawable) &&
          ('asset-policies-formatter.withdrawable' | globalize)
      ].filter(item => item).join(', ') || '&mdash;'
    }}
  </span>
</template>

<script>
import { ASSET_POLICIES } from '@/constants'
import { globalize } from '@/components/App/filters/filters'
export default {
  props: {
    policies: { type: Array, default: null },
    policyMask: { type: [String, Number], default: null },
  },

  data () {
    return {
      ASSET_POLICIES,
      mask: 0,
    }
  },

  created () {
    if (this.policies) {
      this.mask = this.calcMask(this.policies)
    } else if (typeof this.policyMask === 'string' || typeof this.policyMask === 'number') {
      this.mask = +this.policyMask
    } else if (this.policies === null) {
      this.mask = 0
    } else {
      throw new Error(globalize('asset-policies-formatter.error'))
    }
  },

  methods: {
    globalize,
    calcMask (policies) {
      return policies.reduce((acc, cur) => acc + cur.value, 0)
    },
  },
}
</script>
