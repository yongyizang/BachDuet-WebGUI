<!--
    This is the vue component of Piano Keyboard UI.

    It automatically generates the correct amount of keys, with a default piano sampler.
-->

<template>
  <div class="keyboard" :style="style">
    <ul>
      <!--
        This is an iteration for every key on the keyboard.
        the reference of the key's name is "key.name"
        the CSS class of the key is "key.class", while the active state is defined by noteActive(key.name).
        For more information, please check the doc on Vue.js.
        -->
      <li
        v-for="(key, index) in keys"
        :key="index"
        :style="key.style"
        @mousedown="toggleAttack(key.name)"
        @mouseup="toggleRelease(key.name)"
        :class="[
          ...key.class,
          { active: noteActive(key.name) },
          { audiokeys: key.name in audioKeysMap },
        ]"
        :ref="key.name"
      >
        <p v-if="key.name in audioKeysMap" style="font-family: roboto;line-height:15px;margin-bottom:0px"><span style="font-size:20px;padding:30px;">{{ audioKeysMap[key.name] }}</span> </n> <span style="opacity: 0.5;font-size:5px">{{ key.name }}</span></p>
        <span style="opacity: 0.5; font-family: roboto" v-else="key.name in audioKeysMap" >{{ key.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import * as Tone from "tone";
import Instruments from "@/library/instruments";
import { clamp } from "@/library/math";

// Here, a set of constants are defined.
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", null, "F#", "G#", "A#", null];
const NOTE_OFFSETS = ["C", "D", "E", "F", "G", "A", "B"];
const NUM_WHITE_KEYS_PER_OCTAVE = 7;
const NUM_BLACK_KEYS_PER_OCTAVE = 5;
const NUM_WHITE_KEYS_TOTAL = 52;
const NUM_BLACK_KEYS_TOTAL = 36;
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 8;
const MIN_NOTE = 0;
const MAX_NOTE = 6;

// Initialize the pianoSampler.

export default {
  props: {
    octaveStart: {
      type: Number,
      validator(value) {
        return value >= MIN_OCTAVE && value <= MAX_OCTAVE;
      },
      default() {
        return MIN_OCTAVE;
      },
    },

    octaveEnd: {
      type: Number,
      validator(value) {
        return value >= MIN_OCTAVE && value <= MAX_OCTAVE;
      },
      default() {
        return MAX_OCTAVE;
      },
    },

    noteStart: {
      type: [Number, String],
      validator(value) {
        if (typeof value === "string") {
          return WHITE_KEYS.includes(value);
        } else {
          return value >= MIN_NOTE && value <= MAX_NOTE;
        }
      },
      default() {
        return WHITE_KEYS.indexOf("A");
      },
    },

    noteEnd: {
      type: [Number, String],
      validator(value) {
        if (typeof value === "string") {
          return WHITE_KEYS.includes(value);
        } else {
          return value >= MIN_NOTE && value <= MAX_NOTE;
        }
      },
      default() {
        return WHITE_KEYS.indexOf("C");
      },
    },
  },

  created() {
    this.$root.$refs.keyboardUI = this;

    if (typeof this.noteStart === "string") {
      this.offsets.noteStart = WHITE_KEYS.indexOf(this.noteStart);
    } else {
      this.offsets.noteStart = this.noteStart;
    }

    if (typeof this.noteEnd === "string") {
      this.offsets.noteEnd = WHITE_KEYS.indexOf(this.noteEnd);
    } else {
      this.offsets.noteEnd = this.noteEnd;
    }

    this.offsets.octaveStart = this.octaveStart;
    this.offsets.octaveEnd = this.octaveEnd;

    if (
      this.offsets.octaveStart > this.offsets.octaveEnd ||
      (this.offsets.octaveStart === this.offsets.octaveEnd &&
        this.offsets.noteStart > this.offsets.noteEnd)
    ) {
      throw new Error(
        "The start octave must be lower than or equal to the end octave and the start note must be lower than the end note."
      );
    }
  },

  data() {
    return {
      offsets: {
        octaveStart: 0,
        octaveEnd: 3,
        noteStart: 0,
        noteEnd: 0,
      },
      audioKeysMap: {
        C4: "Z",
        "C#4": "S",
        D4: "X",
        "D#4": "D",
        E4: "C",
        F4: "V",
        "F#4": "G",
        G4: "B",
        "G#4": "H",
        A4: "N",
        "A#4": "J",
        B4: "M",
        C5: "Q",
        "C#5": "2",
        D5: "W",
        "D#5": "3",
        E5: "E",
        F5: "R",
        "F#5": "5",
        G5: "T",
        "G#5": "6",
        A5: "Y",       
        "A#5": "7",
        B5: "U",     
        C6: "I",
        "C#6": "9",
        D6: "O",
        "D#6": "0",
        E6: "P",
        F6: "[",
        "F#6": "=",
        G6: "]",
      },
    };
  },

  methods: {
    noteActive(note) {
      // If the note is active, the state of that note is true.
      return this.$store.getters.getPianoState[note] === true;
    },

    toggleAttack(currentNote) {
      if (this.$store.getters.getClockStatus){
      // Trigger the sampler.
      // console.log("The CURRENT note IS ", currentNote)
      // set the second parameter here to False for human.
      this.$root.$refs.gameUI.keyDown(currentNote, true);
      this.$store.dispatch("noteOn", currentNote);
      console.log(currentNote);
      const payload = {
        name: "user",
        note: currentNote,
        time: Tone.now()
      }
      this.$store.dispatch("samplerOn", payload);
      // pianoSampler.triggerAttack(currentNote, Tone.now());
      }
    },

    toggleRelease(currentNote) {
      // Release the sampler that's been triggered.
      // console.log("The RELEASED note IS ", currentNote)
      this.$root.$refs.gameUI.keyUp(currentNote, true);
      this.$store.dispatch("noteOff", currentNote);
      const payload = {
        name: "user",
        note: currentNote,
        time: Tone.now()
      }
      this.$store.dispatch("samplerOff", payload);
      // pianoSampler.triggerRelease(currentNote, Tone.now());
      // Also change the global piano-state.
    },

    calculateOctave(n) {
      return (
        Math.floor(n / NUM_WHITE_KEYS_PER_OCTAVE) +
        Math.max(MIN_OCTAVE, this.offsets.octaveStart)
      );
    },
  },

  computed: {
    offsetStart() {
      return clamp(this.offsets.noteStart, MIN_NOTE, MAX_NOTE);
    },

    offsetEnd() {
      return clamp(this.offsets.noteEnd, MIN_NOTE, MAX_NOTE);
    },

    totalWhiteKeys() {
      return Math.min(
        Infinity,
        this.numOctaves * NUM_WHITE_KEYS_PER_OCTAVE -
          this.offsetStart -
          (NUM_WHITE_KEYS_PER_OCTAVE - (this.offsetEnd + 1))
      );
    },

    totalBlackKeys() {
      return Math.min(
        Infinity,
        this.numOctaves * NUM_BLACK_KEYS_PER_OCTAVE -
          this.offsetStart -
          (NUM_BLACK_KEYS_PER_OCTAVE - (this.offsetEnd + 1))
      );
    },

    totalKeys() {
      return this.totalWhiteKeys + this.totalBlackKeys;
    },

    numOctaves() {
      return (
        1 +
        (Math.min(MAX_OCTAVE, this.offsets.octaveEnd) -
          Math.max(MIN_OCTAVE, this.offsets.octaveStart))
      );
    },

    style() {
      return {
        "--keys": this.totalWhiteKeys,
        "--octaves": this.numOctaves,
      };
    },

    keys() {
      const keys = [];

      // White keys.
      for (let i = this.offsetStart, j = 0; j < this.totalWhiteKeys; i++, j++) {
        const octave = this.calculateOctave(i);
        const keyName = WHITE_KEYS[i % 7];
        const key = {
          name: `${keyName}${octave}`,
          class: ["white", keyName, `${keyName}${octave}`],
          style: {
            "grid-column": `${j === 0 ? 1 : 4 + (j - 1) * 3} / span 3`,
          },
        };
        keys.push(key);
      }

      // Black keys.
      for (let i = this.offsetStart, j = 0; j < this.totalWhiteKeys; i++, j++) {
        const octave = this.calculateOctave(i);
        const keyName = BLACK_KEYS[i % 7];

        // Skip E♯ (F) or B♯ (C).
        if (!keyName) {
          continue;
        }

        // Skip > C8.
        if (octave >= 8) {
          continue;
        }

        const keyNameClass = keyName.replace("#", "s");

        const key = {
          name: `${keyName}${octave}`,
          class: ["black", keyNameClass, `${keyNameClass}${octave}`],
          style: {
            "grid-column": `${j === 0 ? 3 : 6 + (j - 1) * 3} / span 2`,
          },
        };

        keys.push(key);
      }

      return keys;
    },
  },
};
</script>

<style scoped>
body,
ul {
  margin: 0;
  padding: 0;
}

.keyboard {
  width: 100vw;
  height: 200px;
  overflow-x: hidden;
}

.keyboard ul {
  height: 100%;
  width: 100%;
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(calc(var(--keys) * 3), 1fr);
  grid-template-rows: repeat(3, 1fr);
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
  border-radius: 10px;
  margin-left: 1px;
  margin-right: 1px;
  border-style: hidden;
  box-shadow: -1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 0 5px #ccc inset,
    0 0 3px rgba(0, 0, 0, 0.2);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  padding-bottom: 10px;
  -webkit-animation: scale-up-center 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: scale-up-center 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@-webkit-keyframes scale-down-center {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  100% {
    -webkit-transform: scale(0.95);
    transform: scale(0.95);
  }
}
@keyframes scale-down-center {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  100% {
    -webkit-transform: scale(0.95);
    transform: scale(0.95);
  }
}
@-webkit-keyframes scale-up-center {
  0% {
    -webkit-transform: scale(0.95);
    transform: scale(0.95);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@keyframes scale-up-center {
  0% {
    -webkit-transform: scale(0.95);
    transform: scale(0.95);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

.white:active {
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.1) inset,
    -5px 5px 20px rgba(0, 0, 0, 0.2) inset, 0 0 3px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to bottom, rgb(170, 26, 26) 0%, #e9e9e9 100%);
  -webkit-animation: scale-down-center 0.05s
    cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-down-center 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.black {
  grid-row: 1 / span 2;
  background-color: black;
  color: white;
  z-index: 3;
  width: 100%;
  border-radius: 10px;
  box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
    0 -5px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(45deg, #222 0%, #555 100%);
}

.white-activate {
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.1) inset,
    -5px 5px 20px rgba(166, 192, 16, 0.2) inset, 0 0 3px rgba(19, 16, 206, 0.2);
  background: linear-gradient(to bottom, rgb(209, 5, 5) 0%, #05e723 100%);
  -webkit-transform: scale(0.5);
  -moz-transform: scale(0.5);
  -ms-transform: scale(0.5);
  transform: scale(0.5);
}

.black:active {
  box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
    0 -2px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: linear-gradient(to right, #444 0%, rgb(170, 26, 26) 100%);
  -webkit-animation: scale-down-center 0.05s
    cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-down-center 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.blank {
  border-width: 0;
  grid-row: 1 / span 2;
}
</style>
