import Vue from 'vue'
import Vuex from 'vuex'
import noteBuffers from './modules/note-buffers'
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
    noteBuffers,
    tickNumber
  },
})