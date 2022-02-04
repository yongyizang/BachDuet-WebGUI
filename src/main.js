import Vue from "vue";
import store from "./store/index.js";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import "remixicon/fonts/remixicon.css";
import Vue2TouchEvents from "vue2-touch-events";

Vue.use(Vue2TouchEvents, {
  disableClick: true,
  touchClass: "",
  tapTolerance: 10,
  touchHoldTolerance: 400,
  swipeTolerance: 30,
  longTapTimeInterval: 400,
  namespace: "touch",
});
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
