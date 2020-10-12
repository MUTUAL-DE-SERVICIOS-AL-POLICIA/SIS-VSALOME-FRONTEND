import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import vuetify from './plugins/vuetify';
import moment from 'vue-moment';

Vue.config.productionTip = false

axios.defaults.baseURL='http://localhost:3000/api/'
//axios.defaults.baseURL='https://villasalome.herokuapp.com/api/'

new Vue({
  router,
  store,
  vuetify,
  moment,
  render: h => h(App)
}).$mount('#app')
