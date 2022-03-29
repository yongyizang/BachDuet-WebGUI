import Vue from "vue";
import { createRange } from "../../library/music"

// TODO the names of most of the buffers/arrays/maps are not representative of 
// their actual functionality

// Create a range of notes from A0 to C8.
// TODO we can use Range.chromatic(["C2", "C3"], { sharps: true }); from the tonaljs package
const notes = createRange("A0", "C8") 
// const midiNumbers = [...Array(88).keys()].map(i => i + 21);
const measureTicks = [...Array(16).keys()];
// Put all the notes into the notemap, then set all default values to false.

const noteMapforPiano = notes.reduce((map, note) => {
    map[note.name] = false
    return map
}, {})

const noteMapforAI = measureTicks.reduce((map, tick) => {
    map[tick] = {"midi" : 0, "artic" : 1, "cpc" : 12, "midiArticInd" : 96, "name" : "R"}
    return map
}, {})
const noteMapforHuman = measureTicks.reduce((map, tick) => {
    map[tick] = {"midi" : 0, "artic" : 1, "cpc" : 12, "midiArticInd" : 96, "name" : "R"}
    return map
}, {})


// note as observables
const pianoStateMap = new Vue.observable(noteMapforPiano)
const aiPredictionsMap = new Vue.observable(noteMapforAI)
const humanQuantizedInputMap = new Vue.observable(noteMapforHuman)
// const lastNotePlayedObs = new Vue.observable("")
// const lastNotePlayedOnTickObs = new Vue.observable(-1)

const state = {
    // Define all basic states.
    pianoState: pianoStateMap,
    // The last note (continuous) the human pressed on the keyboard
    lastNotePlayed: "",
    lastNotePlayedOnTick: -1,
    // The last quantized note the human played
    lastHumanNote : {"midi" : -1, "cpc" : -1, "name" : "", "dur" : 0, "startTick" : -1},
    // The last note the AI played (quantized by default)
    lastAINote :  {"midi" : 0, "cpc" : 12, "name" : "R", "dur" : 1, "startTick" : -1},
    // A buffer where we push the (continuous) notes the human plays.
    notesBuffer: [],
    aiPredictions: aiPredictionsMap,
    humanQuantizedInput: humanQuantizedInputMap,
    // The dictionary that converts note tokens to the indexes that the AI understands
    // For example, the rest token "0_1" is 96
    // other tokens are "60_1" (a C4 onset)
    // or "60_0" (a C4 hold)
    tokensDict: {}
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
    getHumanInputFor: (state) => (currentTick) => {
        return state.humanQuantizedInput[currentTick]
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
    getTokensDict (state){
        return state.tokensDict;
    },
    getLastHumanNoteQuantized (state){
        return state.lastHumanNote;
    },
    getLastAINoteQuantized (state){
        return state.lastAINote;
    }
}

const actions = {
    newAiPrediction ({ commit, state, getters }, aiPrediction) {
        // aiPrediction is a dict with keys "midiArticInd" and "tick"
        // first convert the midiArticInd to the token midiArtic 
        // using the tokensDict
        var midiArticInd = aiPrediction.midiArticInd
        // the tick that the AI run to make this prediction
        // Note that this prediction is to be played at the next tick
        var tick = aiPrediction.tick
        var midiArtic = getters.getTokensDict.midiArtic.index2token[midiArticInd];
        // split the midiArtic token to get the midi number and the articulation
        var midi = parseInt(midiArtic.split("_")[0]);
        var artic = parseInt(midiArtic.split("_")[1]);
        var cpc = midi % 12;
        if (midi == 0) {
          cpc = 12;
        }
        var nextTick = getters.getNextLocalTick(tick);
        // store the predicted note in the aiPredictions 
        state.aiPredictions[nextTick] =  {  "midi" : midi, 
                                            "artic" : artic, 
                                            "cpc" : cpc, 
                                            "midiArticInd" : midiArticInd
                                            // TODO check if I want those also
                                            // "name" : "R"
                                        }
        // now update the lastAINote
        if (midi == 0) {
            if (state.lastAINote.midi == 0){
                state.lastAINote.dur += 1
            }
            else {
                state.lastAINote.midi = midi;
                state.lastAINote.cpc = cpc;
                // state.lastAINote.name = name;
                state.lastAINote.dur = 1;
                state.lastAINote.startTick = getters.getGlobalTick;
            }
        }
        else {
            if (artic == 1){
                state.lastAINote.midi = midi;
                state.lastAINote.cpc = cpc;
                // state.lastAINote.name = name;
                state.lastAINote.dur = 1;
                state.lastAINote.startTick = getters.getGlobalTick;
            }
            else {
                // It comes here when the AI generates notes with artic=0
                // without previously generating the same note with artic=1
                // this will happen maybe at the first 1-2 tokens generated by the NN
                // or more often if the temperature/randomness is set to a high number

                console.assert(midi === state.lastAINote.midi);
                state.lastAINote.dur += 1
            }
        }
    },
    newHumanInputQuantized ({ commit, state, getters }, args) {
        
        // console.log(args)
        // bring midi to the correct range for the AI (ignore 0 which is used for rest)
        var clipedMidi = args.midi
        while (clipedMidi < 28 && clipedMidi > 0){
            clipedMidi += 12
        }
        while (clipedMidi > 94){
            clipedMidi -= 12
        }
        var midiArtic = clipedMidi.toString() + '_' + args.artic.toString()
        var midiArticInd = getters.getTokensDict.midiArtic.token2index[midiArtic]
        state.humanQuantizedInput[getters.getLocalTick] = { "midi" : args.midi, 
                                                            "artic" : args.artic, 
                                                            "cpc" : args.cpc, 
                                                            "midiArticInd" : midiArticInd
                                                            // TODO check if I want those also
                                                            // "note" : "R"
                                                        }
        if (args.midi === 0){
            if (state.lastHumanNote.midi === 0){
                state.lastHumanNote.dur += 1
            }
            else {
                state.lastHumanNote.midi = args.midi;
                state.lastHumanNote.cpc = args.cpc;
                state.lastHumanNote.name = args.name;
                state.lastHumanNote.dur = 1;
                state.lastHumanNote.startTick = getters.getGlobalTickDelayed();
                // console.log("mesa")
            }
        }
        else {
            if (args.artic == 1){
                state.lastHumanNote.midi = args.midi;
                state.lastHumanNote.cpc = args.cpc;
                state.lastHumanNote.name = args.name;
                state.lastHumanNote.dur = 1;
                state.lastHumanNote.startTick = getters.getGlobalTickDelayed();
            }
            else {
                // it should always be
                console.assert(args.midi === state.lastHumanNote.midi)
                state.lastHumanNote.dur += 1
            }
        }
        // console.log(getters.getGlobalTickDelayed(), " ",
        //     state.lastHumanNote.midi, " ",
        // state.lastHumanNote.dur, " ",
        // state.lastHumanNote.startTick, " ", )

    },

    /*
        Here the behaviors are defined.
        When a note is "on", turn on pianoState and bufferState for that note, then set the last note played to that note.
        When a note is "off", turn off pianoState
    */
    noteOn ({ commit, state, getters }, note) {
        // note is a string. ie "C5"
        // console.log(getters.getGlobalTickDelayed())
        state.pianoState[note] = true;
        state.notesBuffer.push(note);
        state.lastNotePlayed = note;
        // ! does it need parenthesis ? 
        // state.lastNotePlayedOnTick = getters.getGlobalTick;	
        state.lastNotePlayedOnTick = getters.getGlobalTickDelayed();
        
    },
    noteOff ({ commit, state, getters }, note) {
        state.pianoState[note] = false;
    },
}

const mutations = {
    clearNotesBuffer (state) {
        state.notesBuffer = []
    }, 
    setTokensDict (state, tokensDictFromFile){
        state.tokensDict = tokensDictFromFile;
    },
}

export default {
    state,
    getters,
    actions,
    mutations
}