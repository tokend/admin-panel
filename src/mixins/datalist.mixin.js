import { DOCUMENT_TYPES_STR } from '@/constants'

export default {
  methods: {
    getNormalizedDocsList () {
      return Object.values(DOCUMENT_TYPES_STR).map(item => item.replace(/_/g, ' '))
    },
  },
}
