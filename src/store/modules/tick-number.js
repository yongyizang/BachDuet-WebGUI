
import Vue from "vue";

const LOCALMAX = 16;

const state = {
    globalTick: -1,
    localTick: -1,
    barTick: -1
}

const getters = {
    getGlobalTick (state) {
        return state.globalTick;
    }
    getLocalTick (state){
        return state.localTick;
    }
    getBarTick (state){
        return state.barTick;
    }
}

const actions = {
}

const mutations = {
    addTick (state) {
        state.globalTick += 1;
        state.localTick = state.globalTick % 16;
        state.barTick = state.globalTick / 16;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}