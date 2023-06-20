import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'
import Home from '../views/Home.vue'
import Affiliate from '../components/Affiliate.vue'
import Login from '../components/Login.vue'
import Loan from '../components/Loan'
import User from '../components/User'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      admin: true,
      cobranzas: true
    }
  },
  {
    path: '/affiliate',
    name: 'Affiliate',
    component: Affiliate,
    meta: {
      admin: true,
      cobranzas: true
    }
  },
  {
    path: '/loan',
    name: 'Loan',
    component: Loan,
    meta: {
      admin: true,
      cobranzas: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      free: true
    }
  },
  {
    path: '/user',
    name: 'User',
    component: User,
    meta: {
      admin: true
    }
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) =>{
  if (to.matched.some(record => record.meta.free)) {
    next()
  }
  else if (store.state.user && store.state.user.role == 'admin') {
    if (to.matched.some(record => record.meta.admin)) {
      next()
    }
  }
  else if ( store.state.user && store.state.user.role == 'cobranzas') {
    if (to.matched.some(record => record.meta.cobranzas)) {
      next()
    }
  }
  else{
    next({name: 'Login'})
  }
})

export default router
