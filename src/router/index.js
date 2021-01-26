import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import Home from '@/pages/PageHome'
import ThreadCreate from '@/pages/PageThreadCreate'
import ThreadEdit from '@/pages/PageThreadEdit'
import ThreadShow from '@/pages/PageThreadShow'
import NotFound from '@/pages/PageNotFound'
import Profile from '@/pages/PageProfile'
import SignIn from '@/pages/PageSignIn'
import Forum from '@/pages/PageForum'
import Category from '@/pages/PageCategory'
import Register from '@/pages/PageRegister'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/category/:id',
      name: 'Category',
      component: Category,
      props: true
    },
    {
      path: '/forum/:id',
      name: 'Forum',
      component: Forum,
      props: true
    },
    {
      // important that this comes before thread/:id or the app tries to load thread/create using create as the id. Ordering is top to bottom
      path: '/thread/create/:forumId',
      name: 'ThreadCreate',
      component: ThreadCreate,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/thread/:id',
      name: 'ThreadShow',
      component: ThreadShow,
      props: true
    },
    {
      path: '/thread/:id/edit',
      name: 'ThreadEdit',
      component: ThreadEdit,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/me',
      name: 'Profile',
      component: Profile,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/me/edit',
      name: 'ProfileEdit',
      component: Profile,
      props: { edit: true },
      meta: { requiresAuth: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: SignIn,
      meta: { requiresGuest: true }
    },
    {
      path: '/logout',
      name: 'SignOut',
      meta: { requiresAuth: true },
      beforeEnter(to, from, next) {
        store.dispatch('signOut').then(() => next({ name: 'Home' }))
      }
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],
  mode: 'history'
})

router.beforeEach((to, from, next) => {
  store.dispatch('initAuthentication').then(user => {
    if (to.matched.some(route => route.meta.requiresAuth)) {
      if (user) {
        next()
      } else {
        next({ name: 'SignIn', query: { redirectTo: to.path } })
      }
    } else if (to.matched.some(route => route.meta.requiresGuest)) {
      if (!user) {
        next()
      } else {
        next({ name: 'Home' })
      }
    } else {
      next()
    }
  })
})
export default router
