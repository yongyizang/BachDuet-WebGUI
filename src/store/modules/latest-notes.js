import Vue from "vue";


const latestNotes = []

const latestNotesArray = new Vue.observable(latestNotesArray)

const state = {
    latestNotes: latestNotesArray
}


const getters = {
}

const actions = {
}

const mutations = {
    push (state, note) {
        state.latestNotes.push(note.name)
    },
    clear (state) {
        state.bufferState = []
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}