<template>
  <!--
      main.vue, the application's main UI file.
  -->
  <div>
    <div ref="mainLoadingScreen" id="mainLoadingScreen">
      <div class="center">
        <h1 class="loadingTitle">
          <p
            class="loadingTypewriter"
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
        <md-button @click="showFeedbackModal" class="md-raised">
          <md-icon>chat</md-icon>
          <span> Feedback </span>
        </md-button>
        <md-button @click="showAboutModal" class="md-raised">
          <md-icon>groups</md-icon>
          <span> About </span>
        </md-button>
      </div>
      <md-button
        v-if="keyboardUIoctaveEnd !== 8"
        @click="transposeOctUp"
        class="md-icon-button md-raised"
        style="position: absolute; right: 20px; bottom: 100px"
      >
        <md-icon>arrow_forward</md-icon>
      </md-button>
      <md-button
        v-if="keyboardUIoctaveStart !== 0"
        @click="transposeOctDown"
        class="md-icon-button md-raised"
        style="position: absolute; left: 20px; bottom: 100px"
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
      <modal
        name="feedbackModal"
        :minHeight="500"
        :adaptive="true"
        @opened="modalCallback"
        @closed="modalCallback"
      >
        <div
          style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          "
        >
          <p
            style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            "
          >
            Feedback
          </p>
          <hr style="border-top: 1px solid #000; opacity: 12%" />
          <p class="settingsSubtitle">
            How would you rate your experience using BachDuet?
          </p>
          <star-rating
            v-model="feedbackRating"
            inactive-color="#e1bad9"
            active-color="#cc1166"
            :increment="0.01"
            :fixed-points="2"
          ></star-rating>
          <p class="settingsSubtitle">
            Please tell us more about your experience.
          </p>
          <md-field>
            <label>What's your experience using BachDuet?</label>
            <md-textarea v-model="feedbackText"></md-textarea>
          </md-field>
          <md-button
            @click="submitFeedback"
            class="md-raised"
            style="width: 100%"
          >
            Submit
          </md-button>
        </div>
      </modal>
      <modal
        name="aboutModal"
        :minHeight="300"
        :adaptive="true"
        @opened="modalCallback"
        @closed="modalCallback"
      >
        <div
          style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          "
        >
          <p
            style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            "
          >
            About
          </p>
          <hr style="border-top: 1px solid #000; opacity: 12%" />
          <p>
            By
            <a href="http://www2.ece.rochester.edu/projects/air/index.html"
              >AIRLab</a
            >, University of Rochester.<br />
            Based on original work of Christodoulos Benetatos.
            <a
              href="http://www2.ece.rochester.edu/projects/air/publications/benetatos20bachduet.pdf"
              >PDF</a
            ><br />
            Website developed by
            <a href="https://github.com/mrmrmrfinch">Yongyi Zang</a>,
            <a href="https://github.com/xribene">Christodoulos Benetatos</a> and
            Tianyu Huang.<br />
          </p>
        </div>
      </modal>
      <modal
        name="settingsModal"
        :minHeight="600"
        :adaptive="true"
        @opened="modalCallback"
        @closed="modalCallback"
      >
        <div
          style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          "
        >
          <p
            style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            "
          >
            Settings
          </p>
          <hr style="border-top: 1px solid #000; opacity: 12%" />
          <p class="settingsSubtitle">Audio</p>
          <div class="md-layout md-gutter md-alignment-center">
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">BPM</p>
                <p class="settingsValue">{{ BPM }}</p>
                <vue-slider
                  v-model="BPM"
                  :lazy="true"
                  :min="60"
                  :max="120"
                  class="settingsSlider"
                ></vue-slider>
              </div>
            </div>
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv" style="padding-top: 10px">
                <span class="settingsOptionTitle">Metronome</span>
                <toggle-button
                  color="#74601c"
                  :value="true"
                  @change="toggleMetronome"
                  style="transform: scale(0.9)"
                />
              </div>
            </div>
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">Your Piano Volume</p>
                <p class="settingsValue">{{ userPianoVolume }}</p>
                <vue-slider
                  v-model="userPianoVolume"
                  :lazy="true"
                  :min="1"
                  :max="10"
                  class="settingsSlider"
                ></vue-slider>
              </div>
            </div>
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">Network Piano Volume</p>
                <p class="settingsValue">{{ AIPianoVolume }}</p>
                <vue-slider
                  v-model="AIPianoVolume"
                  :lazy="true"
                  :min="1"
                  :max="10"
                  class="settingsSlider"
                ></vue-slider>
              </div>
            </div>
          </div>
          <p class="settingsSubtitle">MIDI</p>

          <div class="MIDIInput" v-if="WebMIDISupport">
            <Dropdown
              :options="activeDevices"
              v-on:selected="onMIDIDeviceSelectedChange"
              placeholder="Type here to search for MIDI device"
            >
            </Dropdown>
          </div>
          <span v-else="WebMIDISupport">
            Currently, Using MIDI devices in browser is only supported by Google
            Chrome v43+, Opera v30+ and Microsoft Edge v79+. Please update to
            one of those browsers if you want to use Web MIDI
            functionalities.</span
          >
          <p class="settingsSubtitle">Network</p>
          <div class="md-layout md-gutter md-alignment-center">
            <div
              class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
            >
              <div class="settingsDiv">
                <p class="settingsOptionTitle">Randomness</p>
                <p style="margin: 0; padding-bottom: 5px">
                  {{ this.number2RandomnessDescription(temperature) }}
                </p>
                <vue-slider
                  v-model="temperature"
                  :lazy="true"
                  :tooltip="'none'"
                  :min="1"
                  :max="200"
                ></vue-slider>
              </div>
            </div>
            <div
              class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
            >
              <md-button @click="resetNetwork" style="width: 100%">
                <md-icon>close</md-icon>
                <span>Reset Network</span>
              </md-button>
              <!-- <md-button @click="writeStates" style="width: 100%">
                <md-icon>close</md-icon>
                <span>Write States</span>
              </md-button> -->
            </div>
          </div>
          <p class="settingsSubtitle">Privacy</p>
          <div class="md-layout md-gutter md-alignment-center">
            <div
              class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
            >
              <span>
                By clicking this button, you would destroy all data sent to our
                server, including all your play data and all app performance
                data. All your data is gathered anonymously, and would only be
                used for research purposes.
              </span>
            </div>
            <div
              class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
            >
              <md-button
                @click="killData"
                class="md-raised md-accent"
                style="height: 100%; width: 100%"
                >Kill Your Data<br /><br />Session ID:<br />{{
                  this.$store.getters.getSessionID
                }}</md-button
              >
            </div>
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
import * as TokensDict from "@/../public/globalTokenIndexDict.json";
import { WebMidi } from "webmidi";
import Dropdown from "vue-simple-search-dropdown";
import AudioKeys from "audiokeys";
import StarRating from "vue-star-rating";

/*
 * Use Google Firebase and Analytics for data gathering.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
// Firebase Configurations.
const firebaseApp = initializeApp({
  apiKey: "AIzaSyCVFIcL_nokMdYVET7lvxnuIbLLoUi5YSs",
  authDomain: "bachduet-b9d02.firebaseapp.com",
  projectId: "bachduet-b9d02",
  storageBucket: "bachduet-b9d02.appspot.com",
  messagingSenderId: "668363580240",
  appId: "1:668363580240:web:f301aa62ecf8310caa8255",
  measurementId: "G-Z0DKQ7L50N",
});
// Use this variable to reference firestore.
const db = getFirestore();

// This is for Web Audio restrictions, we need to make an user behavior to trigger the Tone.start() function.
window.onclick = () => {
  Tone.start();
  Tone.context.lookAhead = 0;
};

export default {
  name: "mainScreen",

  data() {
    return {
      BPM: 90,
      FREQ: 4,
      temperature: 25,
      localSyncClockStatus: false, // used to trigger local UI change
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 2,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: true,
      lastNoteOnAi: "",
      reset: false,
      write: false,
      WebMIDISupport: false,
      userDataID: null,
      userAgent: null,
      pageLoadTime: null,
      modelLoadTime: null,
      activeDevices: [],
      selectedMIDIDevice: "",
      userPianoVolume: 10,
      AIPianoVolume: 10,
      feedbackRating: 5.0,
      feedbackText: "",
      userNoteBuffer2Firebase: [],
      AINoteBuffer2Firebase: [],
    };
  },

  components: {
    keyboardUI,
    scoreUI,
    gameUI,
    Dropdown,
    StarRating,
  },

  mounted() {
    var vm = this;
    // Prevent spacebar trigger any button
    document.querySelectorAll("button").forEach(function (item) {
      item.addEventListener("focus", function () {
        this.blur();
      });
    });
    /*
     * Initialize page load data collections
     */
    vm.userAgent = navigator.userAgent;
    vm.pageLoadTime =
      window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart;
    vm.modelLoadTime = Date.now();

    /*
     * Web MIDI logic
     */

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(function (access) {
        vm.WebMIDISupport = true;
        access.onstatechange = vm.onEnabled;
      });
      // Enable WebMIDI, then call onEnabled method.
      WebMidi.enable()
        .then(vm.onEnabled)
        .catch((err) => this.$toasted.show("WebMIDI Error: " + err));
    }
    /*
     * Initialize computer keyboard logic
     */
    var keyboard = new AudioKeys({
      polyphony: 100,
      rows: 2,
      priority: "last",
      rootNote: 60,
    });
    keyboard.down(function (note) {
      var currentNote = Midi.midiToNoteName(note.note, { sharps: true });
      if (vm.$store.getters.getClockStatus) {
        vm.$root.$refs.gameUI.keyDown(currentNote, true);
        vm.$store.dispatch("noteOn", currentNote);
        const payload = {
          name: "user",
          note: currentNote,
          time: Tone.now(),
        };
        vm.$store.dispatch("samplerOn", payload);
      }
    });

    keyboard.up(function (note) {
      var currentNote = Midi.midiToNoteName(note.note, { sharps: true });
      vm.$root.$refs.gameUI.keyUp(currentNote, true);
      vm.$store.dispatch("noteOff", currentNote);
      const payload = {
        name: "user",
        note: currentNote,
        time: Tone.now(),
      };
      vm.$store.dispatch("samplerOff", payload);
    });

    /*
     * Initialize neural network token dictionary, web worker and worker callback function.
     * Neural network works as a web worker, and we communicate to it by posting message.
     * workerCallback function is called when the neuralWorker returns the AI's prediction.
     * Check out methods: "runTheWorker" and "workerCallback" for more information.
     */
    this.$store.commit("setTokensDict", TokensDict.default);
    this.neuralWorker = new Worker("neuralWorker.js");
    this.neuralWorker.onmessage = this.workerCallback;

    /*
     * Loading Animation: set initial status of both div
     */
    this.$refs.mainContent.style.display = "none";
    this.$refs.entryBtn.style.visibility = "hidden";

    // When window resize, self-update this data.
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        vm.screenWidth = window.screenWidth;
      })();

    
    };

    /*
     * Loading Animation: Typewriter animation logic & CSS
     */
    var introTypingText = function (el, toRotate, period) {
      this.toRotate = toRotate;
      this.el = el;
      this.loopNum = 0;
      this.period = parseInt(period, 10) || 300;
      this.txt = "";
      this.tick();
      this.isDeleting = false;
    };

    // This function would automatically add text to the span under the p element.
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

    var elements = document.getElementsByClassName("loadingTypewriter");
    for (var i = 0; i < elements.length; i++) {
      var toRotate = elements[i].getAttribute("data-type");
      var period = elements[i].getAttribute("data-period");
      if (toRotate) {
        new introTypingText(elements[i], JSON.parse(toRotate), period);
      }
    }
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML =
      ".loadingTypewriter > .wrap { border-right: 0.03em solid rgb(89,50,54);color:rgb(89,50,54);}";
    document.body.appendChild(css);
  },

  watch: {
    screenWidth: {
      // At every screenWidth data change, this would automatically change the keyboardUI's octave number.
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
    keyboardUIoctaveStart: {
      immediate: true,
      handler(newValue) {
        // A trick, to force keyboardUI re-render itself.
        this.keyboardUIKey += 1;
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
    userPianoVolume: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setUserPianoVolume", newValue);
      },
    },
    AIPianoVolume: {
      immediate: true,
      handler(newValue) {
        this.$store.commit("setAIPianoVolume", newValue);
      },
    },
  },

  methods: {
    // downloadToFile = (content, filename, contentType) => {
    //     const a = document.createElement('a');
    //     const file = new Blob([content], {type: contentType});
        
    //     a.href= URL.createObjectURL(file);
    //     a.download = filename;
    //     a.click();
        
    //     URL.revokeObjectURL(a.href);
    // },
    downloadToFile (content, filename, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        
        a.href= URL.createObjectURL(file);
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(a.href);
    },
    
    /*
     * Web MIDI
     */
    onEnabled() {
      const vm = this;
      if (WebMidi.inputs.length < 1) {
        vm.activeDevices = [];
      } else {
        WebMidi.inputs.forEach((device) => {
          vm.activeDevices.push({ id: device.id, name: device.name });
        });
        this.selectedMIDIDevice = this.activeDevices[0].id;
        this.messageListener();
      }
    },

    onMIDIDeviceSelectedChange(state) {
      const vm = this;
      if (state.id) {
        if (vm.selectedMIDIDevice !== state.id) {
          vm.selectedMIDIDevice = state.id;
          vm.messageListener();
        }
      }
    },
    // listens for midi message
    messageListener() {
      const vm = this;
      const inputDevice = WebMidi.getInputById(this.selectedMIDIDevice);
      inputDevice.addListener("noteon", (message) => {
        if (this.$store.getters.getClockStatus) {
          var currentNote = message.note.identifier;
          this.$root.$refs.gameUI.keyDown(currentNote, true);
          this.$store.dispatch("noteOn", currentNote);
          const payload = {
            name: "user",
            note: currentNote,
            time: Tone.now(),
          };
          this.$store.dispatch("samplerOn", payload);
        }
      });

      inputDevice.addListener("noteoff", (message) => {
        var currentNote = message.note.identifier;
        this.$root.$refs.gameUI.keyUp(currentNote, true);
        this.$store.dispatch("noteOff", currentNote);
        const payload = {
          name: "user",
          note: currentNote,
          time: Tone.now(),
        };
        this.$store.dispatch("samplerOff", payload);
      });
    },

    /*
     * Loading animation, switch between main content and loading welcome page.
     */
    entryProgram() {
      const vm = this;
      vm.$refs.mainLoadingScreen.classList.add("fade-out");
      vm.$refs.mainLoadingScreen.style.display = "none";
      vm.$refs.mainContent.style.display = "block";
    },

    /*
     * neural network web worker's callback and worker call methods.
     * Called every tick, and processes the AI's output.
     */

    runTheWorker() {
      const vm = this;
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
        rhythmInd: rhythmTokenInd,
        // for the AI to generate the note for time tick + 1, besides the users input
        // it also takes as an input the note it played/generated for at time tick
        aiInp: this.$store.getters.getAiPredictionFor(
          this.$store.getters.getLocalTick
        ),
        temperature: this.$store.getters.getTemperature,
        reset: this.reset,
        write: this.write,
      };
      this.neuralWorker.postMessage(aiInp);
      // try writing to firebase
      if (this.$store.getters.getDataCollectingState) {
        vm.userNoteBuffer2Firebase.push({
          tick: vm.$store.getters.getGlobalTick,
          type: "User",
          midiArticInd: aiInp.humanInp.midiArticInd,
        });
      }
    },

    async workerCallback(e) {
      const vm = this;
      const workerStatus = vm.$refs.workerStatus;
      // If the worker is giving us only string
      if (typeof e.data === "string" || e.data instanceof String) {
        if (e.data == "Neural Network is ready to play with you!") {
          vm.$refs.entryBtn.classList.add("fade-in");
          vm.$refs.entryBtn.style.visibility = "visible";
          vm.modelLoadTime = Date.now() - vm.modelLoadTime;

          // try writing to firebase
          try {
            const docRef = await addDoc(collection(db, "data"), {
              userAgent: vm.userAgent,
              pageLoad: vm.pageLoadTime,
              modelLoad: vm.modelLoadTime,
              dataAddTime: Date.now(),
              playData: [],
              feedback: [],
            });
            vm.userDataID = docRef.id;
            vm.$store.commit("writeSessionID", docRef.id);
          } catch (e) {
            this.$toasted.show(
              "Error adding doc to firebase. Error Message in console."
            );
            console.log("Firebase error:", e);
          }
        }
        workerStatus.innerHTML = e.data;
      } else {
        // If the worker is giving us ai prediction
        var aiPrediction = e.data;
        // to delete
        if (aiPrediction.toWrite1A){
          // console.log("toWrite ")
          this.downloadToFile(aiPrediction.toWrite1A.toString(), 'my-new-file1A.txt', 'text/plain');
          this.downloadToFile(aiPrediction.toWrite1B.toString(), 'my-new-file1B.txt', 'text/plain');
          this.downloadToFile(aiPrediction.toWrite2A.toString(), 'my-new-file2A.txt', 'text/plain');
          this.downloadToFile(aiPrediction.toWrite2B.toString(), 'my-new-file2B.txt', 'text/plain');
        }
        // Misalignment Check
        if (aiPrediction.tick !== this.$store.getters.getLocalTickDelayed) {
          this.$toasted.show(
            "Network tick misalignment: expecting " +
              this.$store.getters.getLocalTickDelayed +
              ", get " +
              aiPrediction.tick
          );
        }
        this.$store.dispatch("newAiPrediction", aiPrediction);
        // try writing to firebase, if there's user permission
        if (this.$store.getters.getDataCollectingState) {
          vm.AINoteBuffer2Firebase.push({
            tick: e.data.tick,
            barNum: vm.$store.getters.getBarNumber,
            type: "AI",
            midiArticInd: e.data.midiArticInd,
          });
        }
      }
      this.reset = false; // for explanation see the comment about reset inside runTheWorker()
      this.write = false;
    },

    resetNetwork() {
      this.reset = true;
    },
    writeStates() {
      this.write = true;
    },

    triggerAiSampler() {
      // here, we check the note the AI predicted in the previous tick,
      // for the tick we are now. If the articulation of the predicted note
      // is 1 (hit), then we trigger the AI sampler to play the note.
      // if there is already a note active, we have to triggerRelease first
      // if the predicted note is a rest ... blablabla.
      var aiPrediction = this.$store.getters.getAiPredictionFor(
        this.$store.getters.getLocalTick
      );
      if (aiPrediction.artic == 1) {
        if (aiPrediction.midi != 0) {
          if (!(this.lastNoteOnAi === "")) {
            var payload = {
              name: "AI",
              note: this.lastNoteOnAi,
              time: Tone.now(),
            };
            this.$store.dispatch("samplerOff", payload);
            this.$root.$refs.gameUI.keyUp(this.lastNoteOnAi, false);
          }
          let currentNote = Midi.midiToNoteName(aiPrediction.midi, {
            sharps: true,
          });
          var payload = {
            name: "AI",
            note: currentNote,
            time: Tone.now(),
          };
          this.$store.dispatch("samplerOn", payload);
          this.$root.$refs.gameUI.keyDown(currentNote, false);
          this.lastNoteOnAi = currentNote;
        } else {
          if (!(this.lastNoteOnAi === "")) {
            var payload = {
              name: "AI",
              note: this.lastNoteOnAi,
              time: Tone.now(),
            };
            this.$store.dispatch("samplerOff", payload);
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

    // Initialize clock recursive function.
    // At each clock tick, this method would wait for a tick's time to call next tick.
    async toggleClock() {
      var vm = this;
      vm.localSyncClockStatus = !vm.localSyncClockStatus;
      // Allowing tickNumber to add to itself.
      vm.$store.commit("changeClockStatus");

      // If the clock is not yet initialized...
      if (!vm.$store.getters.getClockInitialized) {
        // Then set it to intialized
        vm.$store.commit("initializeClock");
        // And intialized it.

        // Clock behavior function.
        async function tickBehavior() {
          if (vm.$store.getters.getClockStatus) {
            vm.$store.commit("incrementTick");

            vm.metronomeTrigger();
            vm.triggerAiSampler();

            setTimeout(function () {
              vm.runTheWorker();
            }, parseInt(((60 / vm.$store.getters.getBPM / 4) * 1000) / 4)); // 

            if (vm.$store.getters.getLocalTick % 16 === 0) {
              try {
                const updateBuffer = vm.userNoteBuffer2Firebase.concat(vm.AINoteBuffer2Firebase);
                await updateDoc(
                  doc(db, "data", vm.$store.getters.getSessionID),
                  {
                    playData: arrayUnion.apply(this, updateBuffer),
                  }
                );
                vm.userNoteBuffer2Firebase = [];
                vm.AINoteBuffer2Firebase = [];
              } catch (e) {
                vm.$toasted.show(
                  "Error updating to firebase. Error Message in console."
                );
                console.log("Firebase error:", e);
              }
            }

            vm.$store.commit("clearNotesBuffer");
          }
        }

        function sendOutTicks() {
          tickBehavior();
          setTimeout(sendOutTicks, (60 / vm.$store.getters.getBPM / 4) * 1000);
        }

        sendOutTicks();
      }
    },

    /*
     * metronome status.
     */
    toggleMetronome() {
      // This method would update the status of metronome in Vuex Store.
      this.$store.commit("muteMetronome");
      this.$store.commit("flipMetronomeStatus");
    },
    metronomeTrigger() {
      // This method would trigger the metronome sampler.
      if (
        // 4 here codes the frequency of metronome.
        this.$store.getters.getLocalTick % 4 ==
        0
      ) {
        var currentNote =
          this.$store.getters.getLocalTick % 16 === 0 ? "G0" : "C0";
        const payload = {
          name: "metronome",
          note: currentNote,
          time: Tone.now(),
        };

        this.$store.dispatch("samplerOn", payload);
      }
    },

    onPrivacyAgreeBtn(event) {
      this.$store.commit("changeDataCollectionState", event.value);
    },

    showSettingsModal() {
      this.$modal.show("settingsModal");
    },

    showFeedbackModal() {
      this.$modal.show("feedbackModal");
    },

    showAboutModal() {
      this.$modal.show("aboutModal");
    },

    hideSettingsModal() {
      this.$modal.hide("settingsModal");
    },

    transposeOctUp() {
      this.keyboardUIoctaveStart += 1;
      this.keyboardUIoctaveEnd += 1;
    },

    transposeOctDown() {
      this.keyboardUIoctaveStart -= 1;
      this.keyboardUIoctaveEnd -= 1;
    },

    // Check this function! You could change the prompt if you would like.
    number2RandomnessDescription(num) {
      if (num < 10) {
        return "Not-So-Random";
      } else if (num < 20) {
        return "Getting a bit HOT in here";
      } else if (num < 30) {
        return "Some randomness";
      } else if (num < 40) {
        return "Good balance";
      } else if (num < 50) {
        return "Getting a bit messy...";
      } else if (num < 60) {
        return "A bit on the messy side";
      } else if (num < 70) {
        return "Messy! but not too messy.";
      } else if (num < 80) {
        return "So random!";
      } else if (num < 100) {
        return "A bit too random";
      } else if (num < 150) {
        return "Careful! So much randomness";
      } else {
        return "OMG Maximum RANDOMNESS";
      }
    },

    modalCallback() {
      this.$store.commit("changeModalStatus");
    },

    // For data kill switch in modal.
    async killData() {
      const vm = this;
      try {
        await deleteDoc(doc(db, "data", vm.$store.getters.getSessionID));
      } catch (e) {
        this.$toasted.show(
          "Error deleting doc from firebase. Error Message in console."
        );
        console.error("Firebase error:", e);
      }
      window.location.reload(true);
    },

    async submitFeedback() {
      const vm = this;
      try {
        await updateDoc(doc(db, "data", vm.$store.getters.getSessionID), {
          feedback: arrayUnion({
            rating: vm.feedbackRating,
            text: vm.feedbackText,
            time: Date.now(),
          }),
        });
      } catch (e) {
        this.$toasted.show(
          "Error submitting feedback to firebase. Error Message in console."
        );
        console.log("Firebase error:", e);
      }
      vm.feedbackRating = 5.0;
      vm.feedbackText = "";
      this.$modal.hide("feedbackModal");
      this.$toasted.show("Your feedback is submitted! Thanks.");
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

.loadingTypewriter {
  padding: 0;
  margin: 0;
}

.loadingTypewriter .wrap {
  border-right: 0.03em solid rgb(89, 50, 54);
  color: rgb(89, 50, 54);
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
.settingsSubtitle {
  margin: 0;
  font-weight: 800;
  font-size: 20px;
  padding-top: 30px;
  padding-bottom: 5px;
}
.settingsDiv {
  height: 50px;
  padding-top: 5px;
}
.settingsOptionTitle {
  margin: 0;
  font-weight: 800;
}
.settingsValue {
  margin: 0;
  font-size: 20px;
}
.settingsSlider {
  margin-top: -18px;
  margin-left: 50px;
}
</style>
