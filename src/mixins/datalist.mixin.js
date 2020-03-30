import { DOCUMENT_TYPES_STR } from '@/constants'

export default {
  methods: {
    filteredList () {
      const nonUnderscoreList = Object.values(DOCUMENT_TYPES_STR).map(item => item.replace(/_/g, ' '))
      return nonUnderscoreList
    },
  },
}
