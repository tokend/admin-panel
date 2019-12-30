import Vue from 'vue'
import Router from 'vue-router'

import NProgress from 'nprogress'

import { AuthRoutes } from './routes/AuthRoutes'
import { UserRoutes } from './routes/UserRoutes'

import { isLoggedIn } from './helpers/isLoggedIn'

Vue.use(Router)
NProgress.configure({ showSpinner: false })

const router = new Router({
  mode: 'history',
  routes: [
    { path: '*', redirect: '/' },
    {
      path: '/',
      name: 'root',
      redirect () {
        return isLoggedIn()
          ? { name: UserRoutes.name }
          : { name: AuthRoutes.name }
      },
    },
    AuthRoutes,
    UserRoutes,
  ],
})

router.beforeEach((to, from, next) => {
  if (to.name !== from.name) {
    NProgress.start()
  }
  next()
})

router.afterEach((to, from) => {
  NProgress.done()
})

export default router
