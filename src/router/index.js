import Vue from 'vue'
import Router from 'vue-router'
import { AuthRoutes } from './routes/AuthRoutes'
import { UserRoutes } from './routes/UserRoutes'
import { isLoggedIn } from './helpers/isLoggedIn'

Vue.use(Router)

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
      }
    },
    AuthRoutes,
    UserRoutes
  ]
})

export default router
