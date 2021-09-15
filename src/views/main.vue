<template>
  <div class="home">
    <scoreUI :height="400" />
    <keyboardUI
      id="pianoKeyboard"
      class="pianoKeyboard"
      :key="keyboardUIKey"
      :octave-start="keyboardUIoctaveStart"
      :octave-end="keyboardUIoctaveEnd"
    />

    <!-- logic handled by this file for decoupling purposes. -->
    <div class="octaveControls">
      <button class="octs" v-if="clockInitialized" @click="toggleMetronome">
        {{ metronomeStatus ? "Mute Metronome" : "Unmute Metronome" }}
      </button>
      <button
        class="octs"
        v-if="keyboardUIoctaveEnd !== 8"
        @click="transposeOctUp"
      >
        OCT UP
      </button>
      <button
        class="octs"
        v-if="keyboardUIoctaveStart !== 0"
        @click="transposeOctDown"
      >
        OCT DOWN
      </button>
    </div>
    <div class="timingControls">
      <button class="octs" @click="togglePlayback">
        {{ playbackMessage }}
      </button>
      <span style="color: white"
        >BPM:<input id="bpm" v-model.lazy="BPM"
      /></span>
      <span style="color: white"
        >Freq:<input id="freq" v-model.lazy="FREQ"
      /></span>
      <button class="octs" @click="toggleClock">Clock</button>
    </div>
  </div>
</template>


<script>
import * as Tone from "tone";
import { Buffer, Sequence, Transport, Event, Draw, context } from "tone";
import { Midi } from "@tonejs/midi";
import { createRange } from "@/library/music";
import keyboardUI from "@/components/keyboardUI.vue";
import scoreUI from "@/components/scoreUI.vue";
import Instruments from "@/library/instruments";
import pianoState from "@/library/piano-state";

const userMap = [
  // Here, we store all users name in the current order of keys.
  "user1",
];

// Initialize Piano Sampler 1. This is for User.
// Q: where is the User piano sampler 1 ? ???

// Initialize is done within the UI Component. See components/keyboardUI.vue
// For every user in userMap, we create a sampler, which sends to a separate bus.
// Then, for each user, we create another "AI" piano sampler, which also, sends to a separate bus.
// This is done by changing the "piano.toDestination()" code, which should determine which bus it got send to.
const AISampler = new Instruments().createSampler("piano", (piano) => {
  piano.release = 2;
  piano.toDestination();
});

// Initialize Metronome Sampler.
// Bugs here.

const metronomeSampler = new Instruments().createSampler(
  "metronome",
  (metronome) => {
    metronome.release = 2;
  }
);
const metronomeBus = new Tone.Channel().toDestination();
metronomeSampler.connect(metronomeBus);
//Q: how about user and ai bus ? 

// Metronome Behavior.
// Decouple later.
// function metronomeTrigger(tickNumber, interval) {
//   var vm = this;
//   var intervalIntegar = 4;
//   if (!["2n", "4n", "8n", "16n"].includes(interval)) {
//     throw new Error(
//       "metronomeTrigger: the interval entered is not supported. Please try 2n, 4n, 8n or 16n."
//     );
//   } else {
//     switch (interval) {
//       case "2n":
//         intervalIntegar = 8;
//         break;
//       case "4n":
//         intervalIntegar = 4;
//         break;
//       case "8n":
//         intervalIntegar = 2;
//         break;
//       case "16n":
//         intervalIntegar = 1;
//         break;
//     }
//     if (tickNumber % intervalIntegar == 0) {
//       var note = tickNumber % 16 === 0 ? "C#0" : "C0";
//       metronomeSampler.triggerAttackRelease(note, 0.2, Tone.now());
//     }
//   }
// }

window.onclick = () => {
  Tone.start();
  Tone.context.lookAhead = 0;
};

const scoreHeight = 400;

export default {
  name: "main",

  data() {
    return {
      BPM: 60,
      FREQ: 4,
      bpm: 60,
      intervalIntegar: 4,
      tickNumber: -1,
      clockStatus: false,
      clockInitialized: false,
      clockNumber: -1,
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 1,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: true,
      playbackMessage: "Start THE Playback",
      playing: false
    };
  },

  components: {
    keyboardUI,
    scoreUI,
  },

  watch: {
    screenWidth: {
      immediate: true,
      handler(newValue) {
        let octaves;
        if (newValue <= 750) {
          octaves = 3;
        } else if (newValue <= 1024) {
          // for iPads. 1024 * 768.
          octaves = 4;
        } else if (newValue <= 1366) {
          // for iPad Pros. 1366 * 1024.
          octaves = 5;
        } else if (newValue <= 1920) {
          // for 1920 * 1080 screens.
          octaves = 6;
        } else {
          octaves = 7;
        }
        this.keyboardUIoctaveEnd = this.keyboardUIoctaveStart + octaves;
        // force keyboardUI re-render itself.
        this.keyboardUIKey += 1;
      },
    },
    keyboardUIoctaveStart: {
      immediate: true,
      handler(newValue) {
        this.keyboardUIKey += 1;
      },
    },
    // this FREQ variable/field currently appears in the main GUI.
    // later we will move that to a "settings" dialog box.
    FREQ: {
      immediate: true,
      handler(newValue) {
        this.intervalIntegar = newValue
        }
      },
    BPM: {
      immediate: true,
      handler(newValue) {
        // we don't need to set the bpm for Tone.Transport
        // Tone.Transport.bpm.value = newValue;
        this.bpm = newValue
      },
    },
  },

  methods: {
    // moved the metronomeTrigger function inside methods, and renamed it to metronomeTrigger2
    // it doesn't take any input argument
    // and it doesn't use a switch statement for to check the interval for every tick. 
    metronomeTrigger2() {
      var vm = this;
        if (vm.tickNumber % vm.intervalIntegar == 0) {
          var note = vm.tickNumber % 16 === 0 ? "G0" : "C0";
          metronomeSampler.triggerAttackRelease(note, 0.2, Tone.now());
        }
    },
    toggleMetronome() {
      // Right now it only updates the message.
      // Easy to customize into doing other stuff in the future.
      if (this.metronomeStatus) {
        this.metronomeMessage = "Metronome On";
        metronomeBus.mute = true;
        console.log("Metronome is muted.");
      } else {
        this.metronomeMessage = "Metronome Mute";
        metronomeBus.mute = false;
        console.log("Metronome is On.");
      }
      this.metronomeStatus = !this.metronomeStatus;
    },

    togglePlayback() {
      Tone.start();
      if (this.playing) {
        Transport.pause();
        this.playbackMessage = "Start THE Playback";
      } else {
        Transport.start();
        this.playbackMessage = "Pause THE Playback";
      }
      this.playing = !this.playing;
    },

    transposeOctUp() {
      this.keyboardUIoctaveStart += 1;
      this.keyboardUIoctaveEnd += 1;
    },

    transposeOctDown() {
      this.keyboardUIoctaveStart -= 1;
      this.keyboardUIoctaveEnd -= 1;
    },

    toggleClock() {
      console.log("clicked");
      var vm = this;
      // Allowing tickNumber to add to itself.
      vm.clockStatus = !vm.clockStatus;
      if (vm.clockStatus) {
        if (metronomeBus.muted) metronomeBus.mute = false;
      } else {
        metronomeBus.mute = true;
      }
      // If the clock is not yet initialized...
      if (!vm.clockInitialized) {
        // Then set it to intialized
        vm.clockInitialized = true;
        // And intialized it.

        sendOutTicks();

        // Clock behavior function.
        function tickBehavior(){
          if (vm.clockStatus){
              vm.tickNumber += 1;
          }
              // Below are behaviors.
              console.log(
                "Tick #" +
                  vm.tickNumber +
                  " sent out!\n Quantized Inputs include: "
              );
              vm.metronomeTrigger2();
              console.log(vm.$store.getters.getBufferedNotes);

              // Reset global BufferState.
              vm.$store.commit("clearBuffer");
        }

        function sendOutTicks() {
          console.log("tick send.");
          tickBehavior();
          setTimeout(sendOutTicks, ((60 / vm.bpm / 4) * 1000));
        }
      }
    },
  },

  mounted() {
    const that = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        that.screenWidth = window.screenWidth;
      })();
    };
  },

  created() {
    Tone.context.lookAhead = 0;
    const instruments = new Instruments();

    instruments.createSampler("piano", (piano) => {
      piano.release = 2;
      piano.toDestination();

      // A bare minimum room reverb.
      const reverb = new Tone.Reverb({
        predelay: 0.125,
        decay: 1.3,
        wet: 0.5,
      });
      piano.chain(reverb, Tone.Destination);

      const now = Tone.now() + 0.5;
      Midi.fromUrl("/audio/midi/demo.mid")
        .then((midi) => {
          midi.tracks.forEach((track) => {
            track.notes.forEach((note) => {
              Transport.schedule(() => {
                piano.triggerAttackRelease(
                  note.name,
                  note.duration,
                  Tone.now(),
                  note.velocity
                );
              }, note.time + now);

              Transport.schedule((time) => {
                Draw.schedule(() => {
                  pianoState[note.name] = true;
                }, time);
              }, note.time + now);

              Transport.schedule((time) => {
                Draw.schedule(() => {
                  pianoState[note.name] = false;
                }, time);
              }, note.time + note.duration + now);
            });
          });
        })
        .catch(console.error);
    });

    Buffer.on("error", (error) => { 
      console.error(error);
    });
  },

  computed: {
    pianoState() {
      return pianoState;
    },

    activeNote() {
      return this.music[this.currentNoteIndex]; // Q: what is this.music
    },
  },
};

</script>

<style scoped>
.pianoKeyboard {
  z-index: 1;
  position: fixed;
  bottom: 0;
  border-radius: 2px;
  -webkit-box-shadow: 0px 3px 19px 8px rgba(0, 0, 0, 0.68);
  box-shadow: 0px 3px 19px 8px rgba(0, 0, 0, 0.68);
}

.octaveControls {
  z-index: 3;
  position: fixed;
  right: 30px;
  bottom: 170px;
}

.timingControls {
  z-index: 3;
  position: fixed;
  left: 30px;
  bottom: 170px;
}

.octs {
  background-color: rgba(0, 0, 0, 0);
  color: white;
  padding: 5px;
}

#pianoRoll {
  z-index: 0;
  padding: 0;
  margin: 0;
  position: absolute;
  bottom: 196px;
}
</style>