<template>
  <!--
      main.vue, the application's main UI file.
  -->
  
  <div class="home">
    <div class="topbar" style="padding:30px;">
    <img src="/img/logo.png" style="height:48px; width:auto" />
    <div style="color:white;margin-top:-41px;margin-left:55px">
      <span style="font-weight:600;font-size:1.8em;padding:0;line-height:0;">BachDuet</span>
      <div style="margin-top:-0.3em;padding:1px"><span style="font-size:0.3em;">by </span></div>
      <div style="margin-top:-1.1rem;margin-left:1.1em;font-size:1.3em"><span onclick="location='http://www2.ece.rochester.edu/projects/air/index.html'">AIR Lab</span></div>
    </div>
    </div>
    <div class="center">
      <keyboardUI
        id="AIKeyboard"
        style="pointer-events:none;"
        ref="aiKeyboard"
        class="pianoKeyboard"
        :key="keyboardUIKey"
        :octave-start="keyboardUIoctaveStart"
        :octave-end="keyboardUIoctaveEnd"
      />
      <keyboardUI
        id="UserKeyboard"
        ref="UserKeyboard"
        class="pianoKeyboard"
        :key="keyboardUIKey+1"
        :octave-start="keyboardUIoctaveStart"
        :octave-end="keyboardUIoctaveEnd"
      />
    </div>

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
      <!-- 
        Set to automatically binding between this input and the data BPM.
        v-model.lazy change the value only after the input lose focus.
      -->
<!-- <md-field>
      <label>BPM</label>
      <md-input id="bpm v-model.lazy="BPM" maxlength="3" size="3"></md-input>
    </md-field> -->

    <md-field>
      <label>Type here!</label>
      <md-input v-model="type"></md-input>
      <span class="md-helper-text">Helper text</span>
    </md-field>
          
        <div class="input-field col s3">
          <input id="email" type="email" class="validate">
          <label for="email">Email</label>
        </div>

      

      <span style="color: white"
        >Freq:<input id="freq" v-model.lazy="FREQ" maxlength="2" size="3"
      /></span>

      <button class="octs" @click="toggleClock">Clock</button>
    </div>
  </div>
</template>

<script>
import * as Tone from "tone";
import { Buffer, Sequence, Transport, Event, Draw, context } from "tone";
import keyboardUI from "@/components/keyboardUI.vue";
import Instruments from "@/library/instruments";

/*
  Initialization Process.
  Here we initialize all necessary samplers, buses, functions, etc.
*/

// Initialize Piano Sampler 1. This is for User.
// C: where is the User piano sampler 1 ? ???

// Initialize is done within the UI Component. See components/keyboardUI.vue

// For every user in userMap, we create a sampler, which sends to a separate bus.
// Then, for each user, we create another "AI" piano sampler, which also, sends to a separate bus.
// This is done by changing the "piano.toDestination()" code, which should determine which bus it got send to.

const AISampler = new Instruments().createSampler("piano", (piano) => {
  piano.release = 2;
  piano.toDestination();
});

// initalize the worker that runs the neural network
// const neuralWorker = new Worker('neuralWorker.js');//, { type: "module" })

// this function is called when the neuralWorker returns the AI's prediction
// how can I put this function inside methods
// neuralWorker.onmessage = function(e) {
//   var aiOutput = e.data;
//   console.log('Message received from worker' + e.data);
// }
// Initialize Metronome Sampler.
const metronomeSampler = new Instruments().createSampler(
  "metronome",
  (metronome) => {
    metronome.release = 2;
  }
);
// This is the metronome Bus. We would need this for mixing purposes.
const metronomeBus = new Tone.Channel().toDestination();
metronomeSampler.connect(metronomeBus);
//C: how about user and ai bus ?



// This is for Web Audio restrictions, we need to make an user behavior to trigger the Tone.start() function.
window.onclick = () => {
  Tone.start();
  Tone.context.lookAhead = 0;
};

export default {
  name: "mainScreen",

  data() {
    return {
      BPM: 60,
      FREQ: 4,
      bpm: 60,
      intervalIntegar: 4,
      clockStatus: false,
      clockInitialized: false,
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 1,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: true,
    };
  },

  components: {
    keyboardUI,
  },

  mounted() {
    
    this.renderKeyEvent("A1", true, "User", true);
    this.renderKeyEvent("C4", true, "AI", true);
    this.renderKeyEvent("As3", true, "User", false);
    this.renderKeyEvent("Gs2", true, "AI", false);
    this.neuralWorker = new Worker("neuralWorker.js"); //, { type: "module" })

    // the workerCallback function is called when the neuralWorker returns the AI's prediction
    this.neuralWorker.onmessage = this.workerCallback;

    // Everytime the window resizes, update the screenWidth in data immediately.
    const vm = this;

    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        vm.screenWidth = window.screenWidth;
      })();
    };
  },

  watch: {
    // At every screenWidth data change, this would automatically change the keyboardUI's octave number.
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
        // A trick, to force keyboardUI re-render itself.
        this.keyboardUIKey += 1;
      },
    },
    // Using the same trick, when the UI octave Start number changes, forcing it to re-render.
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
        this.intervalIntegar = newValue;
      },
    },
    BPM: {
      immediate: true,
      handler(newValue) {
        this.bpm = newValue;
      },
    },
  },

  methods: {
    // Toggle Keys using this.
    // send in: renderKeyEvent ("C4", true, "AI", true), or ("C4", false, "User", true)
    renderKeyEvent(note = "", type = true, player = "", whiteOrBlack = true) {
      var AIKeyboardElement = this.$refs.aiKeyboard.$el;
      var UserKeyboardElement = this.$refs.UserKeyboard.$el
      if (type) {
        // if it's noteOn
        if (player === "AI") {
          if (whiteOrBlack) { // if it's white note
            AIKeyboardElement.getElementsByClassName(note)[0].classList.add("white-activate");
          } else {
            AIKeyboardElement.getElementsByClassName(note)[0].classList.add("black-activate");
          }
        } else if (player === "User") {
          if (whiteOrBlack) { // if it's white note
            UserKeyboardElement.getElementsByClassName(note)[0].classList.add("white-activate");
          } else {
            UserKeyboardElement.getElementsByClassName(note)[0].classList.add("black-activate");
          }
        } else {
          throw new Error(
            "the player parameter in renderKeyEvent is wrong. Try again."
          );
        }
      } else {
        // if it's noteOff
        if (player === "AI") {
          if (whiteOrBlack) { // if it's white note
            AIKeyboardElement.getElementsByClassName(note)[0].classList.remove("white-activate");
          } else {
            AIKeyboardElement.getElementsByClassName(note)[0].classList.remove("black-activate");
          }
        } else if (player === "User") {
          if (whiteOrBlack) { // if it's white note
            UserKeyboardElement.getElementsByClassName(note)[0].classList.remove("white-activate");
          } else {
            UserKeyboardElement.getElementsByClassName(note)[0].classList.remove("black-activate");
          }
        } else {
          throw new Error(
            "the player parameter in renderKeyEvent is wrong. Try again."
          );
        }
      }
    },
    // neuralWorker's callback. Called every tick, and processes the AI's output
    workerCallback(e) {
      var aiOutput = e.data;
      // TODO convert aiOutput['note'] to the midi_artic representation
      var midi = 60;
      var artic = 1;
      var payload = {
        currentTick: aiOutput["tick"],
        prediction: { midi: midi, artic: artic },
      };
      // save AI's prediction to store.state.aiPredictions
      this.$store.dispatch("newAiPrediction", payload);
      // console.log('Message received from worker' + e.data);
    },
    // moved the metronomeTrigger function inside methods
    // it doesn't take any input argument
    // and it doesn't use a switch statement for to check the interval for every tick.
    metronomeTrigger() {
      // var vm = this;
      if (this.$store.getters.getLocalTick % this.intervalIntegar == 0) {
        var note =
          (this.$store.getters.getLocalTick % 16) * this.$store.state === 0
            ? "G0"
            : "C0";
        metronomeSampler.triggerAttackRelease(note, 0.2, Tone.now());
      }
    },
    // when Metronome is toggled.
    toggleMetronome() {
      metronomeBus.mute = this.metronomeStatus;
      this.metronomeStatus = !this.metronomeStatus;
    },

    transposeOctUp() {
      this.keyboardUIoctaveStart += 1;
      this.keyboardUIoctaveEnd += 1;
    },

    transposeOctDown() {
      this.keyboardUIoctaveStart -= 1;
      this.keyboardUIoctaveEnd -= 1;
    },

    // The clock behavior is defined here.
    // This is currently triggered by a button, but you could call this function anywhere to toggle the clock.
    toggleClock() {

      // vm is short for ViewModel
      var vm = this;
      // Allowing tickNumber to add to itself.

      vm.clockStatus = !vm.clockStatus;

      // C: we don't need this if else statement
      // if (vm.clockStatus) {
      //   if (metronomeBus.muted) metronomeBus.mute = false;
      // } else {
      //   metronomeBus.mute = true;
      // }

      // If the clock is not yet initialized...
      if (!vm.clockInitialized) {
        // Then set it to intialized
        vm.clockInitialized = true;
        // And intialized it.

        // Clock behavior function.
        function tickBehavior() {
          if (vm.clockStatus) {
            vm.$store.commit("incrementTick");
            // }
            // Below are behaviors.
            console.log(
              "Tick #" +
                vm.$store.getters.getLocalTick +
                " sent out!\n Quantized Inputs include: "
            );
            vm.metronomeTrigger();

            // trigger the ai sampler to play the note the AI predicted
            vm.triggerAiSampler();

            // 3 ways to run inference to the neural net

            // A) using a web worker without async
            // neuralWorker.postMessage(vm.$store.getters.getLocalTick);//{"currentTickNumber": vm.$store.getters.getLocalTick});
            // console.log('Message posted to worker');

            // B) using a web worker with async
            vm.runTheWorker();

            // C) without using a web worker
            // C : any better ways to reference the neuralNet component ???
            // var neuralNetObj = vm.$children.find(child => { return child.$options.name === "neuralNet"; })
            // var predictedNote = neuralNetObj.inference(vm.$store.getters.getLocalTick);

            console.log(vm.$store.getters.getNotesBuffer);
            console.log(
              "Last note played: " + vm.$store.getters.getLastNotePlayed
            );

            vm.$store.commit("clearNotesBuffer");
          }
        }

        function sendOutTicks() {
          // console.log("tick send.");
          tickBehavior();
          setTimeout(sendOutTicks, (60 / vm.bpm / 4) * 1000);
        }

        // Call it for the first time.
        sendOutTicks();
      }
    },

    triggerAiSampler() {
      // here, we check the note the AI predicted in the previous tick,
      // for the tick we are now. If the articulation of the predicted note
      // is 1 (hit), then we trigger the AI sampler to play the note.
      // if there is already a note active, we have to triggerRelease first
      // if the predicted note is a rest ... blablabla.
      var note = this.$store.getters.getAiPredictionFor(
        this.$store.getters.getLocalTick
      );
      // to be continued
    },
    // C: using async, improves the neural net's inference speed slightly. Don't know why.
    async runTheWorker() {
      var aiInp = {
        tick: this.$store.getters.getLocalTick,
      };
      this.neuralWorker.postMessage(aiInp); //{"currentTickNumber": vm.$store.getters.getLocalTick});
      console.log("Message posted to worker async");
    },
  },
};
</script>

<style>
html,
body {
  background-image: url("/img/carpet.jpeg");
  background-position: center;
  background-size: 110%;
  height: 100%;
  width: 100%;
}

.center {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
.pianoKeyboard {
  z-index: 1;
  border-radius: 2px;
}

#AIKeyboard {
  -webkit-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  -o-transform: rotate(180deg);
  transform: rotate(180deg);
  margin-bottom: 10px;
  -webkit-box-shadow: 1px -7px 12px 1px rgba(0, 0, 0, 0.68);
  box-shadow: 1px -7px 12px 1px rgba(0, 0, 0, 0.68);
}

#UserKeyboard {
  -webkit-box-shadow: -1px 5px 12px 1px rgba(0, 0, 0, 0.68);
  box-shadow: -1px 5px 12px 1px rgba(0, 0, 0, 0.68);
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
  bottom: 0px;
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

/* .white-activate {
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.1) inset,
    -5px 5px 20px rgba(0, 0, 0, 0.2) inset, 0 0 3px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to bottom, #fff 0%, #e9e9e9 100%);
} */

/* .black-activate {
  box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
    0 -2px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 1px 2px rgba(0, 0, 0, 0.5);
  background: linear-gradient(to right, #444 0%, #222 100%);
} */
</style>
