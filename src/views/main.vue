<template>
  <div class="home">
    <scoreUI 
      :height=900
    />
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
        {{metronomeStatus ? "Mute Metronome" : "Unmute Metronome"}}
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
      <!-- <button class="octs" @click="togglePlayback">
        {{ playbackMessage }}
      </button> -->
      <span style="color: white"
        >Set BPM As:<input id="bpm" v-model="BPM"
      /></span>
      <button class="octs" @click="toggleClock">Clock</button>
    </div>
  </div>
</template>


<script>
import * as Tone from "tone";
import { Buffer, Sequence, Transport, Event, Draw, context } from "tone";
<<<<<<< Updated upstream
import { Midi } from "@tonejs/midi";
import { createRange } from "@/library/music"
=======
>>>>>>> Stashed changes
import keyboardUI from "@/components/keyboardUI.vue";
import scoreUI from "@/components/scoreUI.vue";
import Instruments from "@/library/instruments";

const userMap = [
  // Here, we store all users name in the current order of keys.
  "user1",
];

// Initialize Piano Sampler 1. This is for User.
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

// Metronome Behavior.
// Decouple later.
function metronomeTrigger(tickNumber, interval) {
  var vm = this;
  var intervalIntegar = 4;
  if (!["2n", "4n", "8n", "16n"].includes(interval)) {
    throw new Error(
      "metronomeTrigger: the interval entered is not supported. Please try 2n, 4n, 8n or 16n."
    );
  } else {
    switch (interval) {
      case "2n":
        intervalIntegar = 8;
        break;
      case "4n":
        intervalIntegar = 4;
        break;
      case "8n":
        intervalIntegar = 2;
        break;
      case "16n":
        intervalIntegar = 1;
        break;
    }
    if (tickNumber % intervalIntegar == 0) {
      var note = tickNumber % 16 === 0 ? "C#0" : "C0";
      metronomeSampler.triggerAttackRelease(note, 0.2, Tone.now());
    }
  }
}

window.onclick = () => {
  Tone.start();
  Tone.context.lookAhead = 0;
};

// const scoreHeight = 400;

export default {
  name: "main",

  data() {
    return {
      BPM: 60,
      tickNumber: -1,
      clockStatus: false,
      clockInitialized: false,
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 1,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: true,
      playbackMessage: "Start THE Playback",
      playing: false,
    };
  },

  components: {
    keyboardUI,
    scoreUI
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
    BPM: {
      immediate: true,
      handler(newValue) {
        Tone.Transport.bpm.value = newValue;
        console.log("New BPM Value Set: " + Tone.Transport.bpm.value);
      },
    },
  },

  methods: {
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
<<<<<<< Updated upstream
        setInterval(function sendTicksOut() {
          /*
            So here's what every "tick" does.
            Now it's configured to add to tickNumber at every tick.
            When "paused", it stop adding to itself.
          */
=======

        // Clock behavior function.
        function tickBehavior() {
>>>>>>> Stashed changes
          if (vm.clockStatus) {
            vm.tickNumber += 1;
          }
          // Below are behaviors.
<<<<<<< Updated upstream

          console.log("Tick #" + vm.tickNumber + " sent out!\n Quantized Inputs include: ");
          metronomeTrigger(vm.tickNumber, "4n");
          console.log(vm.$store.getters.getBufferedNotes);

          // Reset global BufferState.
          vm.$store.commit('clearBuffer');
        }, (60 / this.BPM / 4) * 1000); // Set to sixteenth notes ticks.
=======
          console.log(
            "Tick #" + vm.tickNumber + " sent out!\n Quantized Inputs include: "
          );
          metronomeTrigger(vm.tickNumber, "4n");
          console.log(vm.$store.getters.getBufferedNotes);
          console.log(
            "Last note played: " + vm.$store.getters.getLastNotePlayed
          );
          // Reset global BufferState.
          vm.$store.commit("clearBuffer");
        }

        function sendOutTicks() {
          console.log("tick send.");
          tickBehavior();
          // Recursively call the tick sending function (itself), update BPM at each tick.
          setTimeout(sendOutTicks, (60 / vm.BPM / 4) * 1000);
        }

        // Call it for the first time.
        sendOutTicks();
>>>>>>> Stashed changes
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