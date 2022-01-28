
import Vue from "vue";

//Maximum of the localTick
const LOCALMAX = 16;

const bar =  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1];
const beat = [0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2, 0,-2,-1,-2];
const accent=[0,-3,-2,-3,-2,-4,-3,-4,-1,-3,-2,-3,-2,-4,-3,-4];
/*Initial state of three Tick number
globalTick is the Tick number for the whole process of the midi IO
localTick is the Tick number for only one measure, cannot be greater than 16
barTick is the number of the measures played
 */
const state = {
    globalTick: -1,
    localTick: -1,
    localTickDelayed: -1,
    globalTickDelayed: -1,
    barTick: -1,
}

//Getters for globalTick, localTick, barTick
const getters = {
    getGlobalTick (state) {
        return state.globalTick;
    },
    getLocalTick (state){
        return state.localTick;
    },
    getLocalTickDelayed (state){
        return state.localTickDelayed;
    },
    // TODO : here there are two ways to write a getter.
    // For the first way, we use the function as var tick = getGlobalTickDelayed;
    // For the second we have to use it like : var tick = getGlobalTickDelayed();
    // I prefer the second way. What do you think ? 
    // getGlobalTickDelayed (state){
    //     return state.globalTickDelayed;
    // },
    getGlobalTickDelayed: (state) => () => {
        return state.globalTickDelayed;
    },
    getBarTick (state){
        return state.barTick;
    },
    isNewBar (state){
        return state.localTick % 16 === 0;
    },
    getNextLocalTickAfter: (state) => (currentTick) => {
        return (currentTick + 1) % 16;
    },
    getNextLocalTick: (state) => () => {
        return (state.localTick + 1) % 16;
    },
    getRhythmToken (state){
        return bar[state.localTick].toString() + '_' + beat[state.localTick].toString() + '_' + accent[state.localTick].toString();
    }
}

const actions = {
}

/*
AddTick is the func. for changing the value of the three Tick number.
 */
const mutations = {
    incrementTick (state) {
        state.globalTick += 1;
        state.localTick += 1;
        state.barTick += 1;
        state.localTick = state.localTick % 16;
        // ? Christos : we want integer division here ?
        state.barTick = Math.floor(state.globalTick / 16); 
    },
    incrementTickDelayed (state) {
        state.localTickDelayed += 1;
        state.localTickDelayed = state.localTickDelayed % 16;
        state.globalTickDelayed += 1;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}