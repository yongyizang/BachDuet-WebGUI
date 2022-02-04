import Vue from "vue";

/*
 Work in progress.
 We should move every "global" setting (for example, BPM, color, gain levels, etc.) in here.
*/

const state = {
  loadingState: false
};

const getters = {
  getloadingState(state){
    return state.loadingState;
  }
};

const actions = {};

const mutations = {

};

export default {
  state,
  getters,
  actions,
  mutations,
};
