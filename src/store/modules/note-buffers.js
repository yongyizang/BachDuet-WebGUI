import Vue from "vue";
import { createRange } from "../../library/music"

// Create a range of notes from A0 to C8.
const notes = createRange("A0", "C8")

// Put all the notes into the notemap, then set all default values to false.
// const noteMapforBuffer = notes.reduce((map, note) => {
//     map[note.name] = false
//     return map
// }, {})

const noteMapforPiano = notes.reduce((map, note) => {
    map[note.name] = false
    return map
}, {})

// note as observables
const notesBufferArray = []
const notesBufferArrayObs = new Vue.observable(notesBufferArray)
const pianoStateMap = new Vue.observable(noteMapforPiano)

const state = {
    // Define all basic states.
    pianoState: pianoStateMap,
    lastNotePlayed: "",
    notesBuffer: notesBufferArrayObs,
}

const getters = {
    // Return all notes that are currently "pressed"/active
    // the notes are sorted alphabetically
    getActiveNotes (state){
        let activeNotes = []
        for (const note of notes){
          if (state.pianoState[note.name]){
              activeNotes.push(note.name);
          }
        }
        return activeNotes;
    },
    keyboardIsActive (state, getters){
        return getters.getActiveNotes.length > 0;
    },
    // trivial getters that just get stuff
    getPianoState (state){
        return state.pianoState;
    },
    getLastNotePlayed (state){
        return state.lastNotePlayed;
    },
    getNotesBuffer (state){
        return state.notesBuffer;
    },
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
        // state.bufferState[note] = true;
        state.lastNotePlayed = note;
    },
    noteOff (state, note) {
        state.pianoState[note] = false;
    },
    clearNotesBuffer (state) {
        state.notesBuffer = []
        // C: don't we have to make it observable again ? const notesBufferArrayObs = new Vue.observable(notesBufferArray)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}