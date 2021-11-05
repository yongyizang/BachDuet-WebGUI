import Vue from "vue";

const state = {
    scoreUIRefreshTime: 0,
    neuralNetRefreshTime: 0
}

//Getters for globalTick, localTick, barTick
const getters = {
    getScoreUIRefreshTime (state) {
        return scoreUIRefreshTime;
    },
    getNeuralNetRefreshTime (state) {
        return neuralNetRefreshTime;
    }
}

const actions = {
}

const mutations = {
    updateScoreUITime (state, time) {
        state.scoreUIRefreshTime = time;
    },
    updateNeuralNetTime (state, time) {
        state.neuralUIRefreshTime = time;
    },
}

export default {
    state,
    getters,
    actions,
    mutations
}