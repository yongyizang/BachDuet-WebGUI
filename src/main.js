import Vue from "vue";
import store from "./store/index.js";
import App from "./App.vue";
import router from "./router";
import "remixicon/fonts/remixicon.css";
import Vue2TouchEvents from "vue2-touch-events";
import ToggleButton from 'vue-js-toggle-button'
import VModal from 'vue-js-modal'

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { MdButton, MdIcon } from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(MdButton);
Vue.use(MdIcon);
Vue.component('VueSlider', VueSlider);
Vue.use(VModal);
Vue.use(ToggleButton);
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
