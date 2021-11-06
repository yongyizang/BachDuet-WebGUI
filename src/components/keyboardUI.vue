<!--
    This is the vue component of Piano Keyboard UI.

    It automatically generates the correct amount of keys, with a default piano sampler.
-->

<template>
  <div class="keyboard" :style="style">
    <ul>
      <li
        v-for="(key, index) in keys"
        :key="index"
        :style="key.style"
        @mousedown="toggleAttack(key.name)"
        @mouseup="toggleRelease(key.name)"
        :class="[...key.class, {active: noteActive(key.name)}]"
      >
        <span>{{ key.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import * as Tone from 'tone'
import Instruments from "@/library/instruments";
import { clamp } from "@/library/math"

// Here, a set of constants are defined.
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"]
const BLACK_KEYS = ["C#", "D#", null, "F#", "G#", "A#", null]
const NOTE_OFFSETS = ["C", "D", "E", "F", "G", "A", "B"]
const NUM_WHITE_KEYS_PER_OCTAVE = 7
const NUM_BLACK_KEYS_PER_OCTAVE = 5
const NUM_WHITE_KEYS_TOTAL = 52
const NUM_BLACK_KEYS_TOTAL = 36
const MIN_OCTAVE = 0
const MAX_OCTAVE = 8
const MIN_NOTE = 0
const MAX_NOTE = 6
const SAMPLER_RELEASE = 2;

// Initialize the pianoSampler.
const pianoSampler = new Instruments().createSampler("piano", (piano) => {
    piano.release = SAMPLER_RELEASE;
    piano.toDestination();
});

export default {
  props: {
    octaveStart: {
      type: Number,
      validator(value) {
        return value >= MIN_OCTAVE && value <= MAX_OCTAVE
      },
      default() {
        return MIN_OCTAVE
      }
    },

    octaveEnd: {
      type: Number,
      validator(value) {
        return value >= MIN_OCTAVE && value <= MAX_OCTAVE
      },
      default() {
        return MAX_OCTAVE
      }
    },

    noteStart: {
      type: [Number, String],
      validator(value) {
        if (typeof value === "string") {
          return WHITE_KEYS.includes(value)
        } else {
          return value >= MIN_NOTE && value <= MAX_NOTE
        }
      },
      default() {
        return WHITE_KEYS.indexOf("A")
      }
    },

    noteEnd: {
      type: [Number, String],
      validator(value) {
        if (typeof value === "string") {
          return WHITE_KEYS.includes(value)
        } else {
          return value >= MIN_NOTE && value <= MAX_NOTE
        }
      },
      default() {
        return WHITE_KEYS.indexOf("C")
      }
    }
  },

  created() {

    if (typeof this.noteStart === "string") {
      this.offsets.noteStart = WHITE_KEYS.indexOf(this.noteStart)
    } else {
      this.offsets.noteStart = this.noteStart
    }

    if (typeof this.noteEnd === "string") {
      this.offsets.noteEnd = WHITE_KEYS.indexOf(this.noteEnd)
    } else {
      this.offsets.noteEnd = this.noteEnd
    }

    this.offsets.octaveStart = this.octaveStart
    this.offsets.octaveEnd = this.octaveEnd

    if (
      this.offsets.octaveStart > this.offsets.octaveEnd ||
      (this.offsets.octaveStart === this.offsets.octaveEnd &&
        this.offsets.noteStart > this.offsets.noteEnd)
    ) {
      throw new Error(
        "The start octave must be lower than or equal to the end octave and the start note must be lower than the end note."
      )
    }
  },

  data() {
    return {
      offsets: {
        octaveStart: 0,
        octaveEnd: 3,
        noteStart: 0,
        noteEnd: 0
      }
    }
  },

  methods: {
    noteActive(note) {
      // If the note is active, the state of that note is true.
      return this.$store.getters.getPianoState[note.name]=== true;
    },

    toggleBlackKeyDown(note) {

    },

    toggleBlackKeyUp(note) {

    },

    toggleWhiteKeyDown(note) {

    },

    toggleWhiteKeyUp(note){

    },

    toggleAttack(currentNote) {
      // Trigger the sampler.
      pianoSampler.triggerAttack(currentNote, Tone.now());
      // Change the global piano-state.
      // pianoState[currentNote] = true;
      // Add into buffer.
      this.$store.commit('noteOn', currentNote);
    },

    toggleRelease(currentNote) {
      // Release the sampler that's been triggered.
      pianoSampler.triggerRelease(currentNote, Tone.now());
      // Also change the global piano-state.
      this.$store.commit('noteOff', currentNote);
    },

    calculateOctave(n) {
      return (
        Math.floor(n / NUM_WHITE_KEYS_PER_OCTAVE) +
        Math.max(MIN_OCTAVE, this.offsets.octaveStart)
      )
    }
  },

  computed: {
    offsetStart() {
      return clamp(this.offsets.noteStart, MIN_NOTE, MAX_NOTE)
    },

    offsetEnd() {
      return clamp(this.offsets.noteEnd, MIN_NOTE, MAX_NOTE)
    },

    totalWhiteKeys() {
      return Math.min(
        Infinity,
        this.numOctaves * NUM_WHITE_KEYS_PER_OCTAVE -
          this.offsetStart -
          (NUM_WHITE_KEYS_PER_OCTAVE - (this.offsetEnd + 1))
      )
    },

    totalBlackKeys() {
      return Math.min(
        Infinity,
        this.numOctaves * NUM_BLACK_KEYS_PER_OCTAVE -
          this.offsetStart -
          (NUM_BLACK_KEYS_PER_OCTAVE - (this.offsetEnd + 1))
      )
    },

    totalKeys() {
      return this.totalWhiteKeys + this.totalBlackKeys
    },

    numOctaves() {
      return (
        1 +
        (Math.min(MAX_OCTAVE, this.offsets.octaveEnd) -
          Math.max(MIN_OCTAVE, this.offsets.octaveStart))
      )
    },

    style() {
      return {
        "--keys": this.totalWhiteKeys,
        "--octaves": this.numOctaves
      }
    },

    keys() {
      const keys = []

      // White keys.
      for (let i = this.offsetStart, j = 0; j < this.totalWhiteKeys; i++, j++) {
        const octave = this.calculateOctave(i)
        const keyName = WHITE_KEYS[i % 7]

        // Skip < A0
        // if (octave === 0 && WHITE_KEYS.indexOf(keyName) < 5) {
        //   continue
        // }

        const key = {
          name: `${keyName}${octave}`,
          class: ["white", keyName, `${keyName}${octave}`],
          style: {
            "grid-column": `${j === 0 ? 1 : 4 + (j - 1) * 3} / span 3`
          }
        }

        keys.push(key)
      }

      // Black keys.
      for (let i = this.offsetStart, j = 0; j < this.totalWhiteKeys; i++, j++) {
        const octave = this.calculateOctave(i)
        const keyName = BLACK_KEYS[i % 7]

        // Skip E♯ (F) or B♯ (C).
        if (!keyName) {
          continue
        }

        // Skip > C8.
        if (octave >= 8) {
          continue
        }

        const keyNameClass = keyName.replace("#", "s")

        const key = {
          name: `${keyName}${octave}`,
          class: ["black", keyNameClass, `${keyNameClass}${octave}`],
          style: {
            "grid-column": `${j === 0 ? 3 : 6 + (j - 1) * 3} / span 2`
          }
        }

        keys.push(key)
      }

      return keys
    }
  }
}
</script>

<style scoped>
body,
ul {
  margin: 0;
  padding: 0;
}

.keyboard {
  width: 100vw;
  height: 250px;
  overflow-x: hidden;
}

.keyboard ul {
  height: calc(100% - 60px);
  width: 96%;
  padding-top:60px;
  padding-left:2%;
  padding-right:2%;
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(calc(var(--keys) * 3), 1fr);
  grid-template-rows: repeat(3, 1fr);
  background:linear-gradient(to bottom right,rgba(0,0,0,0.3),rgba(0,0,0,0)),url('/vwood.png');
}

li {
  text-align: center;
  background-color: white;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 0.25rem;
  font-weight: bold;
}

li.black span {
  transform: rotate(90deg);
  transform-origin: center 50%;
  margin-bottom: 0.75rem;
}

.white {
  grid-row: 1 / span 3;
  z-index: 2;
  box-shadow:-1px 0 0 rgba(255,255,255,0.8) inset,0 0 5px #ccc inset,0 0 3px rgba(0,0,0,0.2);
  background:linear-gradient(to bottom,#eee 0%,#fff 100%)
}

.white:active, .white:activate {
  box-shadow:2px 0 3px rgba(0,0,0,0.1) inset,-5px 5px 20px rgba(0,0,0,0.2) inset,0 0 3px rgba(0,0,0,0.2);
  background:linear-gradient(to bottom,#fff 0%,#e9e9e9 100%)
}
.black:active, .black:activate {
  box-shadow:-1px -1px 2px rgba(255,255,255,0.2) inset,0 -2px 2px 3px rgba(0,0,0,0.6) inset,0 1px 2px rgba(0,0,0,0.5);
  background:linear-gradient(to right,#444 0%,#222 100%)
}
.black {
  grid-row: 1 / span 2;
  background-color: black;
  color: white;
  z-index: 3;
  box-shadow:-1px -1px 2px rgba(255,255,255,0.2) inset,0 -5px 2px 3px rgba(0,0,0,0.6) inset,0 2px 4px rgba(0,0,0,0.5);
  background:linear-gradient(45deg,#222 0%,#555 100%)
}
.white-activate {
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.1) inset,
    -5px 5px 20px rgba(166, 192, 16, 0.2) inset, 0 0 3px rgba(19, 16, 206, 0.2);
  background: linear-gradient(to bottom, rgb(209, 5, 5) 0%, #05e723 100%);
}
.black-activate {
  box-shadow: -1px -1px 2px rgba(218, 12, 12, 0.2) inset,
    0 -2px 2px 3px rgba(139, 196, 7, 0.6) inset, 0 1px 2px rgba(236, 5, 5, 0.5);
  background: linear-gradient(to right, rgb(38, 0, 255) 0%, rgb(251, 255, 0) 100%);
}


.blank {
  border-width: 0;
  grid-row: 1 / span 2;
}
</style>
