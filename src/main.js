import Vue from 'vue'
import store from './store/index.js'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import 'remixicon/fonts/remixicon.css'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
