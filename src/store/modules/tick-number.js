
import Vue from "vue";

//Maximum of the localTick
const LOCALMAX = 16;

/*Initial state of three Tick number
globalTick is the Tick number for the whole process of the midi IO
localTick is the Tick number for only one measure, cannot be greater than 16
barTick is the number of the measures played
 */
const state = {
    globalTick: -1,
    localTick: -1,
    barTick: -1
}

//Getters for globalTick, localTick, barTick
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

/*
AddTick is the func. for changing the value of the three Tick number.
 */
const mutations = {
    addTick (state) {
        state.globalTick += 1;
        state.localTick += 1;
        state.barTick += 1;
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