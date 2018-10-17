<template>
  <div class="operation-view">
    <div
      class="operation-view__row"
      v-for="(details, d) in operationInfo"
      :key="`operation-detail-${d}`">
      <p class="operation-view__label secondary">{{ details[0] }}</p>
      <template v-if="Array.isArray(details[1])">
        <p class="operation-view__value capitalized">
          <span
            v-for="(detail, de) in details[1]"
            :key="`opration-space-br-${d}-${de}`">
            {{ detail }}
            <br>
            <br>
          </span>
        </p>
      </template>
      <template v-else>
        <p class="operation-view__value capitalized">{{ details[1] }}</p>
      </template>
    </div>
  </div>
</template>

<script>
  import { verbozify } from '@/utils/verbozify'

  export default {
    name: 'operation-show',
    props: ['operation', 'user-id'],
    data () {
      return {
        operationInfo: [],
        dictionary: {}
      }
    },
    created () {
      this.getOperationInfoTest(this.operation)
    },
    methods: {
      verbozify,
      getOperationInfoTest (operation) {
        this.operationInfo = Array.from(this.flattenObjectToMap(this.flattenObject(operation)))
      },
      flattenObject (obj) {
        const toReturn = {}

        for (const i in obj) {
          if (!obj.hasOwnProperty(i) || i.charAt(0) === '_' || typeof obj[i] === 'function') continue
          if ((typeof obj[i]) === 'object' && !(obj[i] instanceof Array)) {
            const flatObject = this.flattenObject(obj[i])
            for (const x in flatObject) {
              if (!flatObject.hasOwnProperty(x)) continue

              toReturn[`${i}_${x}`] = flatObject[x]
            }
          } else {
            toReturn[i] = obj[i]
          }
        }

        return toReturn
      },
      flattenObjectToMap (obj) {
        const map = new Map()
        for (const i in obj) {
          if (this.dictionary[i]) {
            map.set(this.verbozify(this.dictionary[i]), obj[i])
          } else {
            map.set(this.verbozify(i), obj[i])
          }
        }
        return map
      }
    }
  }
</script>

<style lang="scss" scoped>
  .operation-view__row {
    display: flex;
    & + & {
      margin-top: 0.5rem;
    }
  }

  .operation-view__label {
    text-align: right;
    padding-right: 2rem;
    width: 20rem;
    min-width: 20rem;
  }

  .operation-view__value {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
