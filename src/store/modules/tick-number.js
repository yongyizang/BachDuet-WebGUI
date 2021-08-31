import Vue from "vue";

const LOCALMAX = 16;
const BARMAX = 8;

const state = {
    globalTick: -1,
    localTick: -1,
    barTick: -1
}

const getters = {
    getGlobalTick (state) {
        return state.globalTick;
    }
}

const actions = {
}

const mutations = {
    addTick (state) {
        state.globalTick += 1;
        state.localTick += 1;
        state.barTick += 1;
        state.localTick = state.localTick % LOCALMAX;
        state.barTick = state.barTick % BARMAX;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}