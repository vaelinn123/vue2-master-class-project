// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import vuelidate from 'vuelidate'
import App from './App'
import router from './router'
import AppDate from '@/components/AppDate'
import store from '@/store'
import firebase from 'firebase'

Vue.use(vuelidate)
Vue.component('AppDate', AppDate)
Vue.config.productionTip = false
const firebaseConfig = process.env.FIREBASE_CONFIG
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
