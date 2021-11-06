import Vue from "vue";
import { createRange } from "../../library/music"

// Create a range of notes from A0 to C8.
const notes = createRange("A0", "C8")
const measureTicks = [...Array(16).keys()];
// Put all the notes into the notemap, then set all default values to false.
// const noteMapforBuffer = notes.reduce((map, note) => {
//     map[note.name] = false
//     return map
// }, {})

const noteMapforPiano = notes.reduce((map, note) => {
    map[note.name] = false
    return map
}, {})

const noteMapforAI = measureTicks.reduce((map, tick) => {
    map[tick] = {"midi" : -1, "artic" : -1}
    return map
}, {})

// note as observables
const notesBufferArray = []
const notesBufferArrayObs = new Vue.observable(notesBufferArray)
const pianoStateMap = new Vue.observable(noteMapforPiano)
const aiPredictionsMap = new Vue.observable(noteMapforAI)

const state = {
    // Define all basic states.
    pianoState: pianoStateMap,
    lastNotePlayed: "",
    lastNotePlayedOnThick: -1,
    notesBuffer: notesBufferArrayObs,
    aiPredictions: aiPredictionsMap,
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
    getAiPredictionFor: (state) => (currentTick) => {
        return state.aiPredictions[currentTick]
    },
    // trivial getters that just get stuff
    getPianoState (state){
        return state.pianoState;
    },
    getLastNotePlayed (state){
        return state.lastNotePlayed;
    },
    getLastNotePlayedOnTick (state){
        return state.lastNotePlayedOnTick;
    },
    getNotesBuffer (state){
        return state.notesBuffer;
    },
    getAiPredictions (state){
        return state.aiPredictions;
    },
}

const actions = {
    newAiPrediction ({ commit, state, getters }, args) {
        // pred is a dict with keys "currentTick", and "prediction"
        var nextTick = getters.getNextLocalTick(args["currentTick"]);
        state.aiPredictions[nextTick] = args["prediction"];
    }
}

const mutations = {
    /*
        Here the behaviors are defined.
        When a note is "on", turn on pianoState and bufferState for that note, then set the last note played to that note.
        When a note is "off", turn off pianoState
    */
    noteOn (state, note) {
        state.pianoState[note] = true;
        // state.bufferState[note] = true;
        // state.notesBuffer.push[note];
        state.lastNotePlayed = note;
        state.lastNotePlayedOnTick = getters.getLocaTick();
    },
    noteOff (state, note) {
        state.pianoState[note] = false;
    },
    clearNotesBuffer (state) {
        // state.notesBuffer = []
        // C: don't we have to make it observable again ? const notesBufferArrayObs = new Vue.observable(notesBufferArray)
        // how about 
        // Object.assign(state.notesBuffer, [])
    }, 
}

export default {
    state,
    getters,
    actions,
    mutations
}