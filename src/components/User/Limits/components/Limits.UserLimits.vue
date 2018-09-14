<template>
  <div class="user-limits">
    <div class="user-limits__inner">
      <div class="user-limits__limits-list-wrp">
        <template v-for="(type,i) in LIMITS_TYPES">
          <div class="user-limits__limit-row" :key="i">
            <span class="user-limits__limit-type">{{ type.replace('Out', '') }} limit</span>
            <input-field  :value="userLimits[type]"
                          :label="' '"
                          align="right"
                          :readonly="true"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>


<script>
  import { InputField } from '@comcom/fields'
  import _pick from 'lodash/pick'

  const LIMITS_TYPES = [
    'dailyOut',
    'weeklyOut',
    'monthlyOut',
    'annualOut'
  ]

  export default {
    name: 'LimitsUserLimits',
    props: ['limits'],
    components: {
      InputField
    },
    data: _ => ({
      userLimits: {
        dailyOut: '',
        weeklyOut: '',
        monthlyOut: '',
        annualOut: ''
      },
      isPending: false,
      rejectReason: '',
      LIMITS_TYPES
    }),
    created () {
      this.userLimits = _pick(this.limits, Object.keys(this.userLimits))
    },
    methods: {
    }
  }
</script>
<style lang="scss" scoped>

  .user-limits__inner {
    display: flex;
    flex-direction: column;
  }

  .user-limits__reason-wrp {
    margin-top: 4rem;
  }

  .user-limits__limit-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    max-width: 40rem;
  }

  .user-limits__limits-list-wrp {
    &:first-child:not(:only-child) {
      margin-right: 5rem;
    }

    max-width: 28rem;
    width: 100%;
  }

  .user-limits__limit-type {
    margin-right: 1rem;
    min-width: 7.5rem;
    font-size: 1.2rem;
    font-weight: 600;
  }

</style>
