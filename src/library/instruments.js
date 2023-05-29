/*
 * Instruments.js defines the sampler instrument class that are later exposed to the main vue.
*/
import { Sampler } from "tone"
import { note, transpose } from "@tonaljs/tonal"
import { enharmonic } from "@tonaljs/note"
// Define the instrument samples' base URL. this should be where all samples are stored.
export const INSTRUMENT_BASE_URL = "/samples/"

// Define the ranges of each instrument (as samples provided)
export const SAMPLE_RANGES = {
  metronome: ["C0", "C#0"], // C0 for high_woodblock, C#0 for low_woodblock;
  harpischord: ["C2", "B6"], // TODO: Find alternate samples with full piano range.
}

export function createRange(from, to) {
  let fromNote = note(from)
  const toNote = note(to)

  if (fromNote.height >= toNote.height) {
    throw new Error("Reverse ranges are not yet implemented.")
  }
  if (fromNote.acc === "b") {
    fromNote = note(enharmonic(fromNote))
  }
  let range = []
  for (let i = 0, l = toNote.height - fromNote.height, currNote = fromNote; i < l; i++) {
    range.push(currNote)
    currNote = note(enharmonic(transpose(currNote, "m2")))
  }
  return range
}
export default class Instruments {
  constructor() {
    this.samplers = {}
    this.sampleMaps = {}
    this.generateSampleMaps()
  }

  generateSampleMaps() {
    // To each entry in the const SAMPLE_RANGES dict provided above,
    // This function tries to create a map of sample.
    for (const [instrument, [from, to]] of Object.entries(SAMPLE_RANGES)) {
      this.sampleMaps[instrument] = createRange(from, to).reduce((map, note) => {
        // You could see here, that the name of notes has to be in this format.
        // For example, C#4 should be Cs4.mp3
        // TODO: replace mp3 to more web-friendly content
        map[note.name] = note.name.replace("#", "s") + ".mp3"
        return map
      }, {})
    }

    return this.sampleMaps
  }

  getSamplerForInstrument(instrument, callback) {
    const sampler = this.samplers[instrument]

    if (!sampler) {
      sampler = createSampler(instrument, callback)
    }

    return sampler
  }

  createSampler(instrument, callback) {
    if (!Object.keys(SAMPLE_RANGES).includes(instrument)) {
      throw new Error(`Invalid instrument - ${instrument}. We don't currently support this instrument.`)
      return
    }

    // If the callback paramenter is not a function, see it as an empty function.
    if (typeof callback !== "function") {
      callback = () => {}
    }

    // Creates a sampler.
    const sampler = new Sampler(
      this.sampleMaps[instrument],
      () => callback(sampler),
      `${INSTRUMENT_BASE_URL}${instrument}/`
    )
    this.samplers[instrument] = sampler

    return sampler
  }
}
