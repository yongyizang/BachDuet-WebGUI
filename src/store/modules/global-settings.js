import Vue from "vue";

/*
 Work in progress.
 We should move every "global" setting (for example, BPM, color, gain levels, etc.) in here.
*/

const state = {
  isDataCollecting: true,
  sessionID: null,
  clockStatus: false,
  clockInitialized: false,
  bpm: 60,
  frequency: 4,
  temperature: 0.5,
  modalStatus: false,
};

const getters = {
  getDataCollectingState(state) {
    return state.isDataCollecting;
  },
  getSessionID(state) { // get Firebase sessionID
    return state.sessionID;
  },
  getClockStatus(state){
    return state.clockStatus;
  },
  getClockInitialized(state){
    return state.clockInitialized;
  },
  getBPM(state){
    return state.bpm;
  },
  getTemperature(state){
    return state.temperature;
  },
  getModalStatus(state){
    return state.modalStatus;
  }
};

const actions = {};

const mutations = {
  changeDataCollectionState (state, status) {
    state.isDataCollecting = status;
    console.log(status);
  },
  writeSessionID(state, id){
    state.sessionID = id;
    console.log(id);
  },
  changeClockStatus(state){
    state.clockStatus = !state.clockStatus;
  },
  setClockStatus(state, status){
    state.clockStatus = status;
  },
  initializeClock(state){
    state.clockInitialized = true;
  },
  setBPM(state, bpm){
    state.bpm = bpm;
  },
  changeModalStatus(state){
    state.modalStatus = !state.modalStatus;
  },
  setTemperature(state, temperature){
    state.temperature = temperature;
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
};
