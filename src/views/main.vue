<template>
  <!--
      main.vue, the application's main UI file.
  -->
  <div>
    <div ref="mainLoadingScreen" id="mainLoadingScreen">
      <div class="center">
        <h1 class="loadingTitle">
          <p
            class="typewrite"
            data-period="300"
            data-type='[ "Hello!", "This is BachDuet.", "A Musical Genius.", "Well... Sort of.", "Studied from Bach.", "That Bach.", "No, Really.", "Wanna Try me?"]'
          >
            <span class="wrap"></span>
          </p>
        </h1>
        <p ref="workerStatus" class="loadingStatus">
          Loading in The Neural Network...
        </p>
        <div style="padding-bottom: 20px">
          <toggle-button
            color="#74601c"
            :value="true"
            @change="onPrivacyAgreeBtn($event)"
          />
          <span>
            Send us data of your interaction with BachDuet anonymously.</span
          >
        </div>
        <button @click="entryProgram" ref="entryBtn" class="entryBtn">
          Play with Neural Network
        </button>
      </div>
    </div>

    <div ref="mainContent" id="mainContent" class="fade-in">
      <div
        style="
          background-color: black;
          opacity: 0.5;
          display: fixed;
          top: 0;
          right: 0;
          z-index: 999;
        "
      ></div>
      <scoreUI />
      <MIDI />
      <gameUI />
      <!-- <neuralNet /> -->
      <div style="position: absolute; bottom: 230px; right: 20px">
        <md-button @click="toggleClock" class="md-raised" style="width: 40px">
          <md-icon>{{ localSyncClockStatus ? "pause" : "play_arrow" }}</md-icon>
          <span> {{ localSyncClockStatus ? "Pause" : "Play" }}</span>
        </md-button>
        <md-button @click="showSettingsModal" class="md-raised">
          <md-icon>settings</md-icon>
          <span> Settings </span>
        </md-button>
      </div>
      <md-button
        v-if="keyboardUIoctaveEnd !== 8"
        @click="transposeOctUp"
        class="md-icon-button md-raised"
        style="position:absolute;right:20px;bottom:100px;"
      >
        <md-icon>arrow_forward</md-icon>
      </md-button>
      <md-button
        v-if="keyboardUIoctaveStart !== 0"
        @click="transposeOctDown"
        class="md-icon-button md-raised"
        style="position:absolute;left:20px;bottom:100px;"
      >
        <md-icon>arrow_back</md-icon>
      </md-button>
      <keyboardUI
        id="pianoKeyboard"
        class="pianoKeyboard"
        ref="usersKeyboardUIref"
        :key="keyboardUIKey"
        :octave-start="keyboardUIoctaveStart"
        :octave-end="keyboardUIoctaveEnd"
      />
      <!-- <neuralNet/> -->
      <!-- logic handled by this file for decoupling purposes. -->
      <modal name="settingsModal">
        <div
          style="
            padding: 10px;
            min-height: 100%;
            background-color: rgb(243, 225, 190);
          "
        >
          <p>Settings</p>
          <div>
            <span> BPM: {{ BPM }} </span>
            <vue-slider
              v-model="BPM"
              :lazy="true"
              :min="60"
              :max="120"
            ></vue-slider>
          </div>
          <div>
            <span> Frequency: {{ FREQ }} beats per measure </span>
            <vue-slider
              v-model="FREQ"
              :lazy="true"
              :min="2"
              :max="6"
            ></vue-slider>
          </div>
          <div> 
            <!-- Feel free to change that -->
            <span> Randomness </span>
            <vue-slider
              v-model="temperature"
              :lazy="true"
              :min="1"
              :max="200"
            ></vue-slider>
          </div>
          <div style="padding-bottom: 20px">
            <toggle-button
              color="#74601c"
              :value="true"
              @change="toggleMetronome"
            />
            <span> Metronome</span>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script>
import * as Tone from "tone";
import { Midi } from "@tonaljs/tonal";
import keyboardUI from "@/components/keyboardUI.vue";
import gameUI from "@/components/gameUI.vue";
import scoreUI from "@/components/scoreUI.vue";
import MIDI from "@/components/MIDI.vue";
import fab from "vue-fab";
import Instruments from "@/library/instruments";
import * as TokensDict from "@/../public/globalTokenIndexDict.json";

import AudioKeys from "audiokeys";

// Use Google Firebase and Analytics for data gathering
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVFIcL_nokMdYVET7lvxnuIbLLoUi5YSs",
  authDomain: "bachduet-b9d02.firebaseapp.com",
  projectId: "bachduet-b9d02",
  storageBucket: "bachduet-b9d02.appspot.com",
  messagingSenderId: "668363580240",
  appId: "1:668363580240:web:f301aa62ecf8310caa8255",
  measurementId: "G-Z0DKQ7L50N",
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const db = getFirestore();
// import globalDict from "globalTokenIndexDict.json"

// This is for Web Audio restrictions, we need to make an user behavior to trigger the Tone.start() function.
window.onclick = () => {
  Tone.start();
  Tone.context.lookAhead = 0;
};

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

export default {
  name: "mainScreen",

  data() {
    return {
      BPM: 60,
      FREQ: 4,
      temperature: 50,
      localSyncClockStatus: false, // used to trigger local UI change
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 2,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: true,
      // tokensDict: TokensDict,
      lastNoteOnAi: "",
      reset: 0,
      // Userdata
      userDataID: null,
      userAgent: null,
      pageLoadTime: null,
      modelLoadTime: null,
    };
  },

  components: {
    keyboardUI,
    scoreUI,
    gameUI,
    fab,
    MIDI,
    // neuralNet
  },

  created() {
    this.$root.$refs.main = this;
  },

  mounted() {
    this.userAgent = navigator.userAgent;
    // get loading time.
    this.pageLoadTime =
      window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart;
    this.modelLoadTime = Date.now();

    var introTypingText = function (el, toRotate, period) {
      this.toRotate = toRotate;
      this.el = el;
      this.loopNum = 0;
      this.period = parseInt(period, 10) || 300;
      this.txt = "";
      this.tick();
      this.isDeleting = false;
    };

    introTypingText.prototype.tick = function () {
      var i = this.loopNum % this.toRotate.length;
      var fullTxt = this.toRotate[i];

      if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
      } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
      }

      this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

      var that = this;
      var delta = 100 - Math.random() * 50;

      if (this.isDeleting) {
        delta /= 1.5;
      }

      if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === "") {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
      }

      setTimeout(function () {
        that.tick();
      }, delta);
    };

    var elements = document.getElementsByClassName("typewrite");
    for (var i = 0; i < elements.length; i++) {
      var toRotate = elements[i].getAttribute("data-type");
      var period = elements[i].getAttribute("data-period");
      if (toRotate) {
        new introTypingText(elements[i], JSON.parse(toRotate), period);
      }
    }
    // INJECT CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML =
      ".typewrite > .wrap { border-right: 0.03em solid rgb(89,50,54);color:rgb(89,50,54);}";
    document.body.appendChild(css);

    this.$refs.mainContent.style.display = "none";
    this.$refs.entryBtn.style.visibility = "hidden";

    // AIKeyboardElement = this.$refs.aiKeyboard;
    this.$store.commit("setTokensDict", TokensDict.default);

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

    let self = this;
    var keyboard = new AudioKeys({
      polyphony: 100,
      rows: 2,
      priority: "last",
      rootNote: 60,
    });
    keyboard.down(function (note) {
      let name = Midi.midiToNoteName(note.note, { sharps: true });
      self.$refs.usersKeyboardUIref.toggleAttack(name);
    });

    keyboard.up(function (note) {
      let name = Midi.midiToNoteName(note.note, { sharps: true });
      self.$refs.usersKeyboardUIref.toggleRelease(name);
    });
  },

  watch: {
    // At every screenWidth data change, this would automatically change the keyboardUI's octave number.
    screenWidth: {
      immediate: true,
      handler(newValue) {
        let octaves;
        if (newValue <= 750) {
          octaves = 2;
        } else if (newValue <= 1024) {
          // for iPads. 1024 * 768.
          octaves = 3;
        } else if (newValue <= 1366) {
          // for iPad Pros. 1366 * 1024.
          octaves = 4;
        } else if (newValue <= 1920) {
          // for 1920 * 1080 screens.
          octaves = 5;
        } else {
          octaves = 6;
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
        this.$store.commit("setFrequency", newValue);
      },
    },
    BPM: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setBPM", newValue);
      },
    },
    temperature: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setTemperature", newValue / 100);
      },
    },
  },

  methods: {
    // To fade between loading screen and main content.
    entryProgram() {
      const vm = this;
      vm.$refs.mainLoadingScreen.classList.add("fade-out");
      vm.$refs.mainLoadingScreen.style.display = "none";
      vm.$refs.mainContent.style.display = "block";
    },

    // neuralWorker's callback. Called every tick, and processes the AI's output
    async workerCallback(e) {
      const vm = this;
      const workerStatus = vm.$refs.workerStatus;
      if (typeof e.data === "string" || e.data instanceof String) {
        if (e.data == "Neural Network is ready to play with you!") {
          vm.$refs.entryBtn.classList.add("fade-in");
          vm.$refs.entryBtn.style.visibility = "visible";
          vm.modelLoadTime = Date.now() - vm.modelLoadTime;

          // try writing to firebase
          try {
            const docRef = await addDoc(collection(db, "loadingTimes"), {
              userAgent: vm.userAgent,
              pageLoad: vm.pageLoadTime,
              modelLoad: vm.modelLoadTime,
              dataAddTime: Date.now(),
            });
            vm.userDataID = docRef.id;
            vm.$store.commit("writeSessionID", docRef.id);
          } catch (e) {
            console.error("Error writing to firebase. ", e);
          }
        }
        workerStatus.innerHTML = e.data;
      } else {
        // HERE
        var aiPrediction = e.data;
        // write something here to send it to firebase
        this.$store.dispatch("newAiPrediction", aiPrediction);
      }

      this.reset = 0; // for explanation see the comment about reset inside runTheWorker()
    },
    // moved the metronomeTrigger function inside methods
    // it doesn't take any input argument
    // and it doesn't use a switch statement for to check the interval for every tick.
    metronomeTrigger() {
      // var vm = this;
      // console.log("IN METRONOMETRIGGER " + this.$store.getters.getLocalTick)
      if (
        this.$store.getters.getLocalTick % this.$store.getters.getFrequency ==
        0
      ) {
        var note = this.$store.getters.getLocalTick % 16 === 0 ? "G0" : "C0";
        metronomeSampler.triggerAttackRelease(note, 0.2, Tone.now());
      }
    },

    onPrivacyAgreeBtn(event) {
      this.$store.commit("changeDataCollectionState", event.value);
    },

    showSettingsModal() {
      this.$modal.show("settingsModal");
    },
    hideSettingsModal() {
      this.$modal.hide("settingsModal");
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
      // this.$refs.mytestref.$el.children[0].getElementsByClassName("A1")[0].classList.add('white-activate')
      // console.log(this.$refs.mytestref.$el.children[0].children[0].classList)
      // console.log(this.$refs.mytestref.$el.children[0].getElementsByClassName("A1")[0].classList)

      var vm = this;
      vm.localSyncClockStatus = !vm.localSyncClockStatus;
      // Allowing tickNumber to add to itself.
      // console.log(tokensDict)
      vm.$store.commit("changeClockStatus");

      // If the clock is not yet initialized...
      if (!vm.$store.getters.getClockInitialized) {
        // Then set it to intialized
        vm.$store.commit("initializeClock");
        // And intialized it.

        // Clock behavior function.
        function tickBehavior() {
          if (vm.$store.getters.getClockStatus) {
            vm.$store.commit("incrementTick");
            // }
            // Below are behaviors.
            // console.log(
            //   "Tick #" +
            //     vm.$store.getters.getLocalTick +
            //     " sent out!\n Quantized Inputs include: "
            // );
            vm.metronomeTrigger();

            // trigger the ai sampler to play the note the AI predicted
            vm.triggerAiSampler();
            // console.log("Tick #" + vm.$store.getters.getLocalTick + " sent out at "  +"\n");

            // B) using a web worker with async
            // vm.runTheWorker();
            setTimeout(function () {
              vm.runTheWorker();
            }, (60 / vm.$store.getters.getBPM / 4) * 1000 / 5);

            vm.$store.commit("clearNotesBuffer");
          }
        }

        function sendOutTicks() {
          // console.log("tick send.");
          tickBehavior();
          setTimeout(sendOutTicks, (60 / vm.$store.getters.getBPM / 4) * 1000);
        }

        // Call it for the first time.
        sendOutTicks();
      }
    },

    triggerAiSampler() {
      // TODO use lastAiNote from vuex
      // here, we check the note the AI predicted in the previous tick,
      // for the tick we are now. If the articulation of the predicted note
      // is 1 (hit), then we trigger the AI sampler to play the note.
      // if there is already a note active, we have to triggerRelease first
      // if the predicted note is a rest ... blablabla.
      var aiPrediction = this.$store.getters.getAiPredictionFor(
        this.$store.getters.getLocalTick
      );
      // console.log("in triger " + aiPrediction.midi + "_" + aiPrediction.artic)
      // to be continued
      if (aiPrediction.artic == 1) {
        if (aiPrediction.midi != 0) {
          if (!(this.lastNoteOnAi === "")) {
            AISampler.triggerRelease(this.lastNoteOnAi, Tone.now());
            this.$root.$refs.gameUI.keyUp(this.lastNoteOnAi, false);
          }
          let currentNote = Midi.midiToNoteName(aiPrediction.midi, {
            sharps: true,
          });
          AISampler.triggerAttack(currentNote, Tone.now());
          this.$root.$refs.gameUI.keyDown(currentNote, false);
          this.lastNoteOnAi = currentNote;
        } else {
          if (!(this.lastNoteOnAi === "")) {
            AISampler.triggerRelease(this.lastNoteOnAi, Tone.now());
            this.$root.$refs.gameUI.keyUp(this.lastNoteOnAi, false);
            this.lastNoteOnAi = "";
          }
        }
      }
    },

    estimateHumanQuantizedNote() {
      // Here we are quantize and store the user's input

      var midi;
      var artic;
      var cpc;
      var name;
      // var startTick;
      // var dur;

      var activeNotes = this.$store.getters.getActiveNotes;
      var lastNote = this.$store.getters.getLastNotePlayed;
      // check if keyboard is currently active, namely if there is at least one key pressed
      // If keyboard NOT active
      if (!this.$store.getters.keyboardIsActive) {
        // if the buffer is empty
        if (this.$store.getters.getNotesBuffer.length == 0) {
          // then we have a REST
          midi = 0;
          artic = 1;
          cpc = 12;
          name = "R";
        }
        // if the buffer is not empty
        else {
          // sanity check  notesBuffer.pop() === lastNote
          midi = Midi.toMidi(lastNote);
          artic = 1;
          cpc = midi % 12;
          name = lastNote;
        }
      } else {
        // there is at least one key pressed. We only care for the last key pressed so
        // var lastNote = this.$store.getters.getLastNotePlayed
        // var activeNotes = this.$store.getters.getActiveNotes
        // var lastNoteTickStart = this.$store.getters.getLastNotePlayedOnTick
        // var currentTick = this.$store.getters.getLocalTick
        if (activeNotes.includes(lastNote)) {
          // find artic
          midi = Midi.toMidi(lastNote);
          cpc = midi % 12;
          name = lastNote;
          if (
            this.$store.getters.getGlobalTick -
              this.$store.getters.getLastNotePlayedOnTick >
            1
          ) {
            // if the note is active for more than 1 tick
            // then the articulation is set to 0
            artic = 0;
          } else {
            artic = 1;
          }
        } else {
          // TODO : does it ever enter here ???
          midi = 0;
          artic = 1;
          cpc = 12;
          name = "R";
        }
      }

      // convert midi/cpc/artic to indexes that the AI understands
      this.$store.dispatch("newHumanInputQuantized", {
        midi: midi,
        artic: artic,
        cpc: cpc,
        name: name,
      });
    },
    // C: using async, improves the neural net's inference speed slightly. Don't know why.
    // update: removed async in order to use setTimeout(runTheWorker, 30)
    runTheWorker() {
      this.estimateHumanQuantizedNote();

      this.$store.commit("incrementTickDelayed");
      this.$root.$refs.scoreUI.draw();
      console.assert(
        this.$store.getters.getLocalTick ===
          this.$store.getters.getLocalTickDelayed
      );

      var rhythmToken = this.$store.getters.getRhythmToken;
      var rhythmTokenInd =
        this.$store.getters.getTokensDict.rhythm.token2index[rhythmToken];
      var aiInp = {
        tick: this.$store.getters.getLocalTick, //input tick time (the AI will predict a note for time tick+1)
        humanInp: this.$store.getters.getHumanInputFor(
          this.$store.getters.getLocalTick
        ),
        // humanInpMidi: midiArticInd, //users input at time tick
        // humanInpCpc: cpcInd,
        rhythmInd: rhythmTokenInd,
        // for the AI to generate the note for time tick + 1, besides the users input
        // it also takes as an input the note it played/generated for at time tick
        aiInp: this.$store.getters.getAiPredictionFor(
          this.$store.getters.getLocalTick,
        ),
        temperature : this.$store.getters.getTemperature,
        reset : this.reset
      };
      // when this.reset is 1, then for this tick only, the neural network will reset its memory. 
      // after that we ll have to set this.reset = 0 again (in the workerCallback), because if not, 
      // the AI will keep reseting its memory. I think that's a terrible way to implement the reset function. 
      // My problem is that the only way to communicate with the AI is through the input arguments of postMessage().
      // Ideally we want to have a reset button that calls a callback that exists inside the neuralWorker.js, 
      // but I don't know if this is possible
      
      // console.log("to run the worker with ", aiInp, " tick is ", this.$store.getters.getLocalTick)
      this.neuralWorker.postMessage(aiInp); //{"currentTickNumber": vm.$store.getters.getLocalTick});
    },
  },
};
</script>

<style scoped>
.pianoKeyboard {
  z-index: 1;
  position: fixed;
  bottom: 10px;
  border-radius: 2px;
}

.octaveControls {
  z-index: 3;
  color: black;
  position: fixed;
  right: 30px;
  bottom: 230px;
}

.timingControls {
  z-index: 3;
  color: black;
  position: fixed;
  left: 30px;
  bottom: 230px;
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

#mainLoadingScreen {
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 100%;
}

.fade-in {
  -webkit-animation: fade-in 1s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  animation: fade-in 1s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

@-webkit-keyframes fade-in {
  0% {
    display: none;
    opacity: 0;
    visibility: hidden;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fade-in {
  0% {
    display: none;
    opacity: 0;
    visibility: hidden;
  }
  100% {
    opacity: 1;
  }
}

.fade-out {
  -webkit-animation: fade-out 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  animation: fade-out 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

@-webkit-keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none;
  }
}
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none;
  }
}

.loadingTitle {
  z-index: 999;
  font-size: 100px;
  font-weight: 600;
  font-style: italic;
  line-height: 100px;
  width: 95%;
}

.loadingStatus {
  z-index: 999;
  font-size: 20px;
  line-height: 20px;
  margin-top: -5px;
  font-weight: 500;
}

.center {
  margin: 0;
  position: absolute;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.entryBtn {
  font-family: source-serif-pro, serif;
  z-index: 999;
  width: auto;
  font-size: 18px;
  padding: 10px;
  border: 4px solid rgb(89, 50, 54);
  background: rgba(89, 50, 54, 0);
}

.entryBtn:hover {
  font-weight: 800;
}

.entryBtn:active {
  -webkit-animation: scale-down-center 0.05s
    cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-down-center 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.typewrite {
  padding: 0;
  margin: 0;
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
</style>
