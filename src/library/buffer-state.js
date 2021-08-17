import Vue from "vue"
import { createRange } from "./music"

// Create a range of notes from A0 to C8.
const notes = createRange("A0", "C8")

// Put all the notes into the notemap, then set all default values to false.
const noteMap = notes.reduce((map, note) => {
  map[note.name] = false
  return map
}, {})

// noteMap is noted as observable.
// Vue is going to observe it and update it in real-time!
// (TODO) implement this using Vuex
const bufferState = new Vue.observable(noteMap)

export default bufferState

// A reset function that sets all state
export function reset() {
  for (const note of notes) {
    bufferState[note.name] = false
  }
}