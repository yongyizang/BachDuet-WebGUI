import { createRange } from "./music"
import { Sampler } from "tone"

// Define the set of notes.
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Define the instrument samples' base URL. this should be where all samples are stored.
export const INSTRUMENT_BASE_URL = "/audio/samples/"

// Define the ranges of each instrument (as samples provided)
export const SAMPLE_RANGES = {
  metronome: ["C0", "C#0"], // C0 for high_woodblock, C#0 for low_woodblock;
  bassElectric: ["A#2", "G5"],
  bassoon: ["A1", "G3"],
  cello: ["A2", "G#4"],
  clarinet: ["A#2", "F#5"],
  contrabass: ["A1", "G#2"],
  flute: ["A3", "E5"],
  frenchHorn: ["A0", "G1"],
  guitarAcoustic: ["A1", "G#3"],
  guitarElectric: ["A2", "F#5"],
  guitarNylon: ["A2", "G#5"],
  harmonium: ["A2", "G#4"],
  harp: ["A2", "G5"],
  organ: ["A1", "F#5"],
  piano: ["A0", "C7"], // TODO: Find alternate samples with full piano range.
  saxophone: ["A3", "G#4"],
  trombone: ["A#0", "G#2"],
  trumpet: ["A2", "G3"],
  tuba: ["A#0", "F2"],
  violin: ["A3", "G6"]
  // xylophone: [] // TODO: Find out why samples are missing or find alternatives.
}

export const MIDIKEY_TO_PIANOKEY = {
  '21': 'A1',
  '22': 'A#1',
  '23': 'B1',
  '24': 'C2',
  '25': 'C#2',
  '26': 'D2',
  '27': 'D#2',
  '28': 'E2',
  '29': 'F2',
  '30': 'F#2',
  '31': 'G2',
  '32': 'G#2',
  '33': 'A2',
  '34': 'A#2',
  '35': 'B2',
  '36': 'C3',
  '37': 'C#3',
  '38': 'D3',
  '39': 'D#3',
  '40': 'E3',
  '41': 'F3',
  '42': 'F#3',
  '43': 'G3',
  '44': 'G#3',
  '45': 'A3',
  '46': 'A#3',
  '47': 'B3',
  '48': 'C4',
  '49': 'C#4',
  '50': 'D4',
  '51': 'D#4',
  '52': 'E4',
  '53': 'F4',
  '54': 'F#4',
  '55': 'G4',
  '56': 'G#4',
  '57': 'A4',
  '58': 'A#4',
  '59': 'B4',
  '60': 'C5',
  '61': 'C#5',
  '62': 'D5',
  '63': 'D#5',
  '64': 'E5',
  '65': 'F5',
  '66': 'F#5',
  '67': 'G5',
  '68': 'G#5',
  '69': 'A5',
  '70': 'A#5',
  '71': 'B5',
  '72': 'C6',
  '73': 'C#6'
}

export const INSTRUMENT_NAMES = Object.keys(SAMPLE_RANGES)

export const AVAILABLE_FORMATS = ["mp3", "ogg", "wav"]

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
    if (!INSTRUMENT_NAMES.includes(instrument)) {
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
