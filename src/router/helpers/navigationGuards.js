import { isLoggedIn } from './isLoggedIn'

export function authorizedGuard (to, from, next) {
  next(isLoggedIn() || { name: 'root', query: { redirect: to.fullPath }})
}

export function unauthorizedGuard (to, from, next) {
  next(!isLoggedIn() || { name: 'root' })
}
