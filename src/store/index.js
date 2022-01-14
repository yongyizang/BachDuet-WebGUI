import Vue from 'vue'
import Vuex from 'vuex'
// import pianobufferstate from './modules/piano-buffer-state'
import historicalnotes from './modules/historical-notes'
import noteBuffers from './modules/note-buffers'
import tickNumber from './modules/tick-number'
import testTimers from './modules/test-timers'
import globalSettings from './modules/global-settings'
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
    // pianobufferstate,
    historicalnotes,
    noteBuffers,
    tickNumber,
    testTimers,
    globalSettings
    // add new modules here in this manner:
    // newmodule,
  },
})