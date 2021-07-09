import Vue from "vue"
import { createRange } from "./music"

const notes = createRange("A0", "C8")

const noteMap = notes.reduce((map, note) => {
  map[note.name] = false
  return map
}, {})

// noteMap is noted as observable.
// Vue is going to observe it and update it in real-time!
// (TODO) implement this using Vuex
const pianoState = new Vue.observable(noteMap)

export default pianoState

export function reset() {
  for (const note of notes) {
    pianoState[note.name] = false
  }
}