<template>
  <!--
      main.vue, the application's main UI file.
  -->

  <div class="home">
    <md-dialog-alert
      :md-active.sync="screenRatio"
      md-content="Although we will support mobile devices in the future, this application only works best on horizontal screens right now. <br /> <br /> We would recommend using this application on a PC or a tablet, or you could try to rotate your phone over in horizontal mode, although you may experience UI problems. <br /><br /> We are sorry for the inconvenience."
      md-confirm-text="Okay"
    />

    <md-dialog-alert
      :md-active.sync="screenWidthTooSmall"
      md-content="Although we are planning on adding small screen support in the future, this application only works best when screen width is larger than 768 pixels.<br /><br />We would recommend using this application on a PC or a tablet, or you could try to rotate your phone over in horizontal mode, although you may experience UI problems. <br /><br /> We are sorry for the inconvenience."
      md-confirm-text="Okay"
    />

    <div style="padding:10px;">
      <div
        class="topbar"
        style="padding: 30px; backdrop-filter: blur(15px); border-radius: 30px;box-shadow: 0px 1px 22px 5px rgba(0,0,0,0.66); color: #F3FEB0; min-height:60px; "
      >
        <img
          class="disappear-on-small-screen"
          src="/img/logo.png"
          style=" height: 48px; width: auto"
        />
        <div class="small-screen-displacement">
          <div
            id="BachDuetLogoText"
            style="color:white;margin-top: -41px; margin-left: 55px"
          >
            <span
              style="
              font-weight: 600;
              font-size: 1.8em;
              padding: 0;
              line-height: 0;
            "
              >BachDuet</span
            >
            <div style="margin-top: -5px; margin-left:1px">
              <span style="font-size: 12px">by </span>
            </div>
            <div
              style="margin-top: -0.9rem; margin-left: 1.1em; font-size: 1.3em"
            >
              <span
                onclick="location='http://www2.ece.rochester.edu/projects/air/index.html'"
                >AIR Lab</span
              >
            </div>
          </div>

          <div
            id="bpmSlider"
            style="position:absolute;margin-top:-70px;margin-left:200px;width:auto"
          >
            <span style="font-size:0.8em">BPM</span><br />
            <span style="font-size:1.5em;font-weight:bold">{{ bpm }}</span>
            <vue-slider
              style="margin-top:-30px;margin-left:3em"
              v-model="bpm"
              :contained="true"
              :width="100"
              :lazy="true"
              :min="60"
              :max="120"
              :tooltip-placement="'right'"
              :tooltip-formatter="(val) => val + ' bpm'"
            ></vue-slider>
          </div>

          <div
            id="freqSlider"
            style="position:absolute;margin-top:-22px;margin-left:200px;"
          >
            <span style="font-size:0.8em">FREQ</span><br />
            <span style="font-size:1.5em;font-weight:bold">{{ FREQ }}</span>
            <vue-slider
              style="margin-top:-30px;margin-left:3em"
              v-model="FREQ"
              :contained="true"
              :width="100"
              :lazy="true"
              :min="2"
              :max="16"
              :tooltip-placement="'right'"
              :tooltip-formatter="(val) => val + ' beats / bar'"
            ></vue-slider>
          </div>
        </div>
        <div id="clockToggleBtn">
          <md-tooltip md-direction="bottom"
            >Click to start or pause the session.</md-tooltip
          >
          <span
            class="disappear-on-small-screen"
            style="font-weight:bold;grid-area: 1/1/2/2"
          >
            SESSION<br />CONTROL
          </span>
          <md-button
            @click="toggleClock"
            id="clockBtn"
            class="md-icon-button md-plain"
            style="box-sizing:border-box;position:relative;width:60px;height:60px;left:0px;top:0px;margin-top:-10px;grid-area:1/2/2/3"
          >
            <md-icon class="md-size-2x" style="color:#F3FEB0">{{
              clockStatus ? "pause" : "play_arrow"
            }}</md-icon>
          </md-button>
        </div>
        <div id="metronomeToggle" style="">
          <span style="font-weight:bold;">METRONOME<br />SOUND</span><br />
          <md-switch
          id="metronomeSwitch"
            style=""
            v-model="metronomeStatus"
          ></md-switch>
        </div>
      </div>
    </div>

    <div class="center">
      <keyboardUI
        id="AIKeyboard"
        style="pointer-events: none; user-select: none;"
        ref="aiKeyboard"
        class="pianoKeyboard"
        :octave-start="4"
        :octave-end="7"
      />
      <!-- logic handled by this file for decoupling purposes. -->
      <div class="octaveControls">
        <md-button
          @click="transposeOctUp"
          v-if="keyboardUIoctaveEnd !== 8"
          class="md-icon-button md-plain"
          style="box-sizing:border-box;"
        >
          <md-icon style="color:#F3FEB0">keyboard_arrow_up</md-icon>
        </md-button>
        <span
          style="position:absolute;color:#F3FE80;margin-top:9px;font-weight:bold;min-width:150px;"
          >OCTAVE CONTROL</span
        >
        <md-button
          @click="transposeOctDown"
          v-if="keyboardUIoctaveStart !== 0"
          class="md-icon-button md-plain"
          style="box-sizing:border-box;margin-left:9.3em;"
        >
          <md-icon style="color:#F3FEB0">keyboard_arrow_down</md-icon>
        </md-button>
      </div>

      <keyboardUI
        id="UserKeyboard"
        ref="UserKeyboard"
        style="user-select: none;"
        class="pianoKeyboard"
        :key="keyboardUIKey"
        :octave-start="keyboardUIoctaveStart"
        :octave-end="keyboardUIoctaveEnd"
      />
    </div>
  </div>
</template>


<script>
import * as Tone from "tone";
import { Buffer, Sequence, Transport, Event, Draw, context } from "tone";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import "vue-material/dist/theme/default-dark.css";
import keyboardUI from "@/components/keyboardUI.vue";
import MIDI from "@/components/MIDI.vue";
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
      FREQ: 4,
      bpm: 60,
      intervalIntegar: 4,
      clockStatus: false,
      clockInitialized: false,
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      screenRatio: false,
      screenWidthTooSmall: false,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 1,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: true,
      currentDevice: '',
      pressedDeviceKey: 0,
      isKeyPressed: 0
    };
  },

  components: {
    keyboardUI,
    VueSlider,
    MIDI,
  },

  mounted() {
    this.neuralWorker = new Worker('neuralWorker.js');//, { type: "module" })

    // the workerCallback function is called when the neuralWorker returns the AI's prediction
    this.neuralWorker.onmessage = this.workerCallback


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
        if (this.screenWidth / this.screenHeight <= 1) {
          this.screenRatio = true;
        }
        if (this.screenWidth < 768) {
          this.screenWidthTooSmall = true;
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
        this.intervalIntegar = newValue
        }
      },
    bpm: {
      immediate: true,
      handler(newValue) {
        console.log(newValue);
      },
    },
    metronomeStatus: {
      immediate: true,
      handler(newValue) {
        console.log(newValue);
        metronomeBus.mute = !this.metronomeStatus;
      },
    },
  },

  methods: {
    // Toggle Keys using this.
    // send in: renderKeyEvent ("C4", true, "AI", true), or ("C4", false, "User", true)
    renderKeyEvent(note = "", type = true, player = "", whiteOrBlack = true) {
      var AIKeyboardElement = this.$refs.aiKeyboard.$el;
      var UserKeyboardElement = this.$refs.UserKeyboard.$el;
      if (type) {
        // if it's noteOn
        if (player === "AI") {
          if (whiteOrBlack) {
            // if it's white note
            AIKeyboardElement.getElementsByClassName(note)[0].classList.add(
              "white-activate"
            );
          } else {
            AIKeyboardElement.getElementsByClassName(note)[0].classList.add(
              "black-activate"
            );
          }
        } else if (player === "User") {
          if (whiteOrBlack) {
            // if it's white note
            UserKeyboardElement.getElementsByClassName(note)[0].classList.add(
              "white-activate"
            );
          } else {
            UserKeyboardElement.getElementsByClassName(note)[0].classList.add(
              "black-activate"
            );
          }
        } else {
          throw new Error(
            "the player parameter in renderKeyEvent is wrong. Try again."
          );
        }
      } else {
        // if it's noteOff
        if (player === "AI") {
          if (whiteOrBlack) {
            // if it's white note
            AIKeyboardElement.getElementsByClassName(note)[0].classList.remove(
              "white-activate"
            );
          } else {
            AIKeyboardElement.getElementsByClassName(note)[0].classList.remove(
              "black-activate"
            );
          }
        } else if (player === "User") {
          if (whiteOrBlack) {
            // if it's white note
            UserKeyboardElement.getElementsByClassName(
              note
            )[0].classList.remove("white-activate");
          } else {
            UserKeyboardElement.getElementsByClassName(
              note
            )[0].classList.remove("black-activate");
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
      var payload = {'currentTick' : aiOutput['tick'],
                    'prediction' : {'midi':midi, 'artic':artic}
        }
      // save AI's prediction to store.state.aiPredictions 
      this.$store.dispatch('newAiPrediction', payload)
      // console.log('Message received from worker' + e.data);
    },
    // moved the metronomeTrigger function inside methods
    // it doesn't take any input argument
    // and it doesn't use a switch statement for to check the interval for every tick. 
    metronomeTrigger() {
      // var vm = this;
        if (this.$store.getters.getLocalTick % this.intervalIntegar == 0) {
          var note = this.$store.getters.getLocalTick % 16*this.$store.state === 0 ? "G0" : "C0";
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
        function tickBehavior(){
          if (vm.clockStatus){
              vm.$store.commit("incrementTick")
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
              vm.runTheWorker()
              
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
          setTimeout(sendOutTicks, ((60 / vm.bpm / 4) * 1000));
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
        var note = this.$store.getters.getAiPredictionFor(this.$store.getters.getLocalTick)
        // to be continued
    },
    // C: using async, improves the neural net's inference speed slightly. Don't know why.
    async runTheWorker(){
        var aiInp = {
          "tick" : this.$store.getters.getLocalTick,
        }
        this.neuralWorker.postMessage(aiInp);//{"currentTickNumber": vm.$store.getters.getLocalTick});
        console.log('Message posted to worker async');
    },

    onMidiInput(key) {
      this.pressedDeviceKey = key;
    },

    onKeyPressStatus(status) {
      this.isKeyPressed = status;
    }
  },
};

</script>

<style>
html {
  height: 100vh;
  width: 100vw;
}
body {
  background-color: #402504;
  background-image:
		/* Pink lines */ linear-gradient(
      -116deg,
      transparent 40%,
      #bf4136 0,
      #bf4136 42%,
      transparent 42%
    ),
    linear-gradient(
      116deg,
      transparent 41%,
      #bf4136 0,
      #bf4136 43%,
      transparent 43%
    ),
    /* Black lines */
      linear-gradient(
        -116deg,
        transparent 40%,
        #bf5b04 0,
        #bf5b04 42%,
        transparent 42%
      ),
    linear-gradient(
      116deg,
      transparent 41%,
      #bf5b04 41%,
      #bf5b04 43%,
      transparent 43%
    ),
    /* Black diamonds */ linear-gradient(-135deg, #bf5b04 16.5%, transparent 0),
    linear-gradient(-45deg, #bf5b04 16.5%, transparent 0),
    linear-gradient(135deg, #bf5b04 16.5%, transparent 0),
    linear-gradient(45deg, #bf5b04 16.5%, transparent 0),
    /* Pink diamonds */ linear-gradient(-135deg, #bf4136 16.5%, transparent 0),
    linear-gradient(-45deg, #bf4136 16.5%, transparent 0),
    linear-gradient(135deg, #bf4136 16.5%, transparent 0),
    linear-gradient(45deg, #bf4136 16.5%, transparent 0);
  background-size: 
		/* Pink lines */ 8em 8em, 8em 8em, /* Black Lines */ 8em 8em,
    8em 8em, /* Black diamonds */ 8em 8em, 8em 8em, 8em 8em, 8em 8em,
    /* Pink diamonds */ 8em 8em, 8em 8em, 8em 8em, 8em 8em;
  background-position: 
		/* Pink lines */ 3em -8em, -3em -8em,
    /* Black Lines */ -9em 8em, 9em 8em, /* Black diamonds */ 0, 0, 0, 0,
    /* Pink diamonds */ 4em, 4em, 4em, 4em;
  height: 100%;
  width: 100%;
}

.home {
  height: 100vh;
  width: 100vw;
}

.center {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

@media screen and (max-height: 746px) {
  .center {
    position: absolute;
    bottom: 0;
  }
}

@media screen and (min-width:769px) {

#metronomeToggle {
  position:absolute;margin-top:-60px;margin-left:575px;
}
#metronomeSwitch {
  position:absolute;top:0;margin-left:8em;
}

}

@media screen and (max-width: 768px) {
  .disappear-on-small-screen {
    display: none;
  }
  .small-screen-displacement {
    margin-top: 52px;
    margin-left: -50px;
  }
  #clockBtn {
    margin-left:-80px;
  }
  #metronomeToggle {
    position:absolute;
    left:450px;
    top:30px;
  }
}


#clockToggleBtn {
  position: absolute;
  margin-top: -45px;
  margin-left: 400px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
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
  -webkit-box-shadow: 1px -7px 22px 1px rgba(0, 0, 0, 0.68);
  box-shadow: 1px -7px 22px 1px rgba(0, 0, 0, 0.68);
}

#UserKeyboard {
  -webkit-box-shadow: -1px 5px 22px 1px rgba(0, 0, 0, 0.68);
  box-shadow: -1px 5px 22px 1px rgba(0, 0, 0, 0.68);
}

.octaveControls {
  z-index: 3;
  position: absolute;
  margin-left: calc(50% - 80px);
  margin-top: 15px;
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
</style>
