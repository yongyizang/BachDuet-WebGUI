import Vue from 'vue'
import Vuex from 'vuex'
import pianobufferstate from './modules/piano-buffer-state'
import tickNumber from './modules/tick-number'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {

  },
  actions: {

  },
  mutations: {

  },
  getters: {

  },
  modules: {
    pianobufferstate,
    tickNumber
  },
})