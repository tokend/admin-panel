// TODO refactor, extract require

import { unauthorizedGuard } from '../helpers/navigationGuards'

// Each of these routes are loaded asynchronously, when a user first navigates to each corresponding endpoint.
// The route will load once into memory, the first time it's called, and no more on future calls.
// This behavior can be observed on the network tab of your browser dev tools.

export const AuthRoutes = {
  path: '/auth',
  name: 'auth',
  redirect: { name: 'login' },
  beforeEnter: unauthorizedGuard,
  component (resolve) { require(['../../components/Auth/Auth.vue'], resolve) },
  children: [
    {
      path: '/login',
      name: 'login',
      component: function (resolve) {
        require(['../../components/Auth/Login/Login.vue'], resolve)
      }
    },
    {
      path: '/sign-up',
      name: 'signup',
      component: function (resolve) {
        require(['../../components/Auth/Signup/Signup.vue'], resolve)
      }
    }
  ]
}
