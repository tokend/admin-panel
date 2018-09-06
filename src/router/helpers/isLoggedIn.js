import store from '@/store'

export function isLoggedIn () {
  const { isLoggedIn } = store.state.auth
  return !!isLoggedIn
}
