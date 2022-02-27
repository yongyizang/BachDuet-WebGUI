import Vue from 'vue'
import Vuex from 'vuex'
// import pianobufferstate from './modules/piano-buffer-state'
import noteBuffers from './modules/note-buffers'
import tickNumber from './modules/tick-number'
import globalSettings from './modules/global-settings'
import samplers from './modules/samplers'
// import newmodule from './modules/newmodule'

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
    tickNumber,
    globalSettings,
    samplers
    // add new modules here in this manner:
    // newmodule,
  },
})