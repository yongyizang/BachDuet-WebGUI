import Vue from "vue";
import store from "..";
import { createRange } from "../../library/music"

// Create a range of notes from A0 to C8.
const notes = createRange("A0", "C8")

// Put all the notes into the notemap, then set all default values to false.
const noteMapforBuffer = notes.reduce((map, note) => {
    map[note.name] = false
    return map
}, {})

const noteMapforPiano = notes.reduce((map, note) => {
    map[note.name] = false
    return map
}, {})

// noteMap is noted as observable.
const bufferStateMap = new Vue.observable(noteMapforBuffer)
const pianoStateMap = new Vue.observable(noteMapforPiano)

const state = {
    // Define all basic states.
    bufferState: bufferStateMap,
    pianoState: pianoStateMap,
    // Get the last note played.
    lastNotePlayed: ""
}

const getters = {
    // Return all buffered notes within bufferState
    getBufferedNotes (state){
        let quantizedInput = []
        for (const note of notes){
          if (state.bufferState[note.name]){
              quantizedInput.push(note.name);
          }
        }
        return quantizedInput;
    },
    // trivial getters that just get stuff
    getpianoState (state){
        return state.pianoState;
    },
    getLastNotePlayed (state){
        return state.lastNotePlayed;
    }
}

const actions = {
}

const mutations = {
    /*
        Here the behaviors are defined.
        When a note is "on", turn on pianoState and bufferState for that note, then set the last note played to that note.
        When a note is "off", turn off pianoState, it stays in the buffer.
        When buffer is cleared, all buffer and lastNotePlayed is cleared.
    */
    noteOn (state, note) {
        state.pianoState[note] = true;
        state.bufferState[note] = true;
        state.lastNotePlayed = note;
    },
    noteOff (state, note) {
        state.pianoState[note] = false;
    },
    clearBuffer (state) {
        state.lastNotePlayed = "";
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