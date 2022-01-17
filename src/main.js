import Vue from 'vue'
import store from './store/index.js'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

Vue.config.productionTip = false


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
