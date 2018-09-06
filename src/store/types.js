const mutations = Object.freeze({
  PUSH_EMAIL_TO_ADDRESS_BOOK: 'PUSH_TO_EMAIL_ADDRESS_BOOK'
})

const actions = Object.freeze({
  REQUEST_EMAIL_BY_ADDRESS: 'REQUEST_EMAIL_BY_ADDRESS'
})

const getters = Object.freeze({
  GET_USER: 'GET_USER',
  GET_USER_ADDRESS: 'GET_USER_ADDRESS',
  GET_EMAIL_ADDRESS_BOOK: 'GET_EMAIL_ADDRESS_BOOK'
})

export { mutations, actions, getters }
