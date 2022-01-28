import Vue from "vue";
import { createRange } from "../../library/music"

// Create a range of notes from A0 to C8.
const notes = createRange("A0", "C8")

// Put all the notes into the notemap, then set all default values to false.
const noteMap = notes.reduce((map, note) => {
    map[note.name] = false
    return map
}, {})

// noteMap is noted as observable.
const bufferStateMap = new Vue.observable(noteMap)

const state = {
    bufferState: bufferStateMap
}

const getters = {
    getBufferedNotes (state){
        let quantizedInput = []
        for (const note of notes){
          if (state.bufferState[note.name]){
              quantizedInput.push(note.name);
          }
        }
        return quantizedInput;
    },
}

const actions = {
}

const mutations = {
    clearBuffer (state) {
        for (const note of notes) {
            state.bufferState[note.name] = false;
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}