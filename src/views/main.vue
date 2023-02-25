<template>
  <!--
      main.vue, the application's main UI file.
  -->
  <div>
    <div ref="mainLoadingScreen" id="mainLoadingScreen">
      <div id="loadingScreenInjection" class="center">
        <h1 class="loadingTitle">
          <p class="loadingTypewriter" data-period="300"
            data-type='[ "Hello!", "This is BachDuet.", "A Musical Genius.", "Well... Sort of.", "Studied from Bach.", "That Bach.", "No, Really.", "Wanna Try me?"]'>
            <span class="wrap"></span>
          </p>
        </h1>
        <p ref="workerStatus" class="loadingStatus">
          Loading in The Neural Network...
        </p>
        <div style="padding-bottom: 20px">
          <toggle-button color="#74601c" :value="true" @change="onPrivacyAgreeBtn($event)" />
          <span>
            Send us data of your interaction with BachDuet anonymously.</span>
        </div>
        <button @click="entryProgram" ref="entryBtn" class="entryBtn">
          Play with Neural Network
        </button>
        <p v-if="isNotChrome">
          We highly recommend using Chrome for better user experience.
        </p>
        <p v-if="isMobile">
          The model may not perform normally on mobile devices. We recommend
          using Desktop computers.
        </p>
      </div>
    </div>

    <div ref="mainContent" id="mainContent" class="fade-in">
      <div style="
          background-color: black;
          opacity: 0.5;
          display: fixed;
          top: 0;
          right: 0;
          z-index: 999;
        "></div>
      <scoreUI />
      <gameUI />
      <!-- <neuralNet /> -->
      <div style="position: absolute; bottom: 230px; right: 20px">
        <md-button @click="toggleClock" class="md-raised" style="width: 40px">
          <md-icon>{{ localSyncClockStatus? "pause": "play_arrow" }}</md-icon>
          <span> {{ localSyncClockStatus? "Pause": "Play" }}</span>
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
      <md-button v-if="keyboardUIoctaveEnd !== 8" @click="transposeOctUp" class="md-icon-button md-raised"
        style="position: absolute; right: 20px; bottom: 100px">
        <md-icon>arrow_forward</md-icon>
      </md-button>
      <md-button v-if="keyboardUIoctaveStart !== 0" @click="transposeOctDown" class="md-icon-button md-raised"
        style="position: absolute; left: 20px; bottom: 100px">
        <md-icon>arrow_back</md-icon>
      </md-button>
      <keyboardUI id="pianoKeyboard" class="pianoKeyboard" ref="usersKeyboardUIref" :key="keyboardUIKey"
        :octave-start="keyboardUIoctaveStart" :octave-end="keyboardUIoctaveEnd" />
      <modal name="feedbackModal" :minHeight="500" :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <div style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          ">
          <p style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            ">
            Feedback
          </p>
          <hr style="border-top: 1px solid #000; opacity: 12%" />
          <p class="settingsSubtitle">
            How would you rate your experience using BachDuet?
          </p>
          <star-rating v-model="feedbackRating" inactive-color="#e1bad9" active-color="#cc1166" :increment="0.01"
            :fixed-points="2"></star-rating>
          <p class="settingsSubtitle">
            Please tell us more about your experience.
          </p>
          <md-field>
            <label>What's your experience using BachDuet?</label>
            <md-textarea v-model="feedbackText"></md-textarea>
          </md-field>
          <md-button @click="submitFeedback" class="md-raised" style="width: 100%">
            Submit
          </md-button>
        </div>
      </modal>
      <modal name="aboutModal" :minHeight="300" :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <div style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          ">
          <p style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            ">
            About
          </p>
          <hr style="border-top: 1px solid #000; opacity: 12%" />
          <p>
            By
            <a href="http://www2.ece.rochester.edu/projects/air/index.html">AIRLab</a>, University of Rochester.<br />
            Based on original work of Christodoulos Benetatos.
            <a href="http://www2.ece.rochester.edu/projects/air/publications/benetatos20bachduet.pdf">PDF</a><br />
            Website developed by
            <a href="https://github.com/mrmrmrfinch">Yongyi Zang</a>,
            <a href="https://github.com/xribene">Christodoulos Benetatos</a> and
            Tianyu Huang.<br />
          </p>
        </div>
      </modal>
      <modal name="settingsModal" :minHeight="600" :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <div style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          ">
          <p style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            ">
            Settings
          </p>
          <hr style="border-top: 1px solid #000; opacity: 12%" />
          <p class="settingsSubtitle">Audio</p>
          <div class="md-layout md-gutter md-alignment-center">
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">BPM (Max: {{ optimalBPM }})</p>
                <div style="padding-top: 14px">
                  <p class="settingsValue">{{ BPM }}</p>
                  <vue-slider v-model="BPM" :lazy="true" :min="60" :max="120" class="settingsSlider"></vue-slider>
                </div>
              </div>
            </div>
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <span class="settingsOptionTitle">Metronome</span>
                <toggle-button color="#74601c" :value="true" @change="toggleMetronome"
                  style="transform: scale(0.9); padding-top: 17px" />
              </div>
            </div>
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">Your Piano Volume</p>
                <p class="settingsValue">{{ userPianoVolume }}</p>
                <vue-slider v-model="userPianoVolume" :lazy="true" :min="1" :max="10"
                  class="settingsSlider"></vue-slider>
              </div>
            </div>
            <div class="md-layout-item md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">Network Piano Volume</p>
                <p class="settingsValue">{{ AIPianoVolume }}</p>
                <vue-slider v-model="AIPianoVolume" :lazy="true" :min="1" :max="10" class="settingsSlider"></vue-slider>
              </div>
            </div>
          </div>
          <p class="settingsSubtitle">MIDI</p>

          <div class="MIDIInput" v-if="WebMIDISupport">
            <Dropdown :options="activeDevices" v-on:selected="onMIDIDeviceSelectedChange"
              placeholder="Type here to search for MIDI device">
            </Dropdown>
          </div>
          <span v-else="WebMIDISupport">
            Currently, Using MIDI devices in browser is only supported by Google
            Chrome v43+, Opera v30+ and Microsoft Edge v79+. Please update to
            one of those browsers if you want to use Web MIDI
            functionalities.</span>

          <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
            <md-button @click="exportMidi" style="width: 100%">
              <!-- <md-icon>close</md-icon> -->
              <span>Export MIDI</span>
            </md-button>
          </div>

          <p class="settingsSubtitle">Network</p>
          <div class="md-layout md-gutter md-alignment-center">
            <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
              <div class="settingsDiv">
                <p class="settingsOptionTitle">Randomness</p>
                <p style="margin: 0; padding-bottom: 5px">
                  {{ this.number2RandomnessDescription(temperature) }}
                </p>
                <vue-slider v-model="temperature" :lazy="true" :tooltip="'none'" :min="1" :max="200"></vue-slider>
              </div>
            </div>
            <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
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
            <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
              <span>
                If you chose to send us your data, all your data is gathered
                anonymously, and would only be used for research purposes.<br />
                If you want to delete all data sent to our server, click the big
                red button. It would destroy all your play data and all app
                performance data.
              </span>
            </div>
            <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
              <md-button @click="killData" class="md-raised md-accent" style="height: 100%; width: 100%">Kill Your
                Data<br /><br />Session ID:<br />{{
                  this.$store.getters.getSessionID
                }}</md-button>
            </div>
          </div>
        </div>
      </modal>
      <modal name="introModal" :minHeight="600" :adaptive="true" @opened="modalCallback" @closed="modalCallback">
        <div style="
            padding: 20px;
            height: 100%;
            background-color: rgb(243, 225, 190);
          ">
          <p style="
              font-weight: 800;
              font-size: 2rem;
              margin: 0;
              padding-top: 20px;
              padding-bottom: 10px;
            ">
            Introduction
          </p>
          <p>
            Hi! This is BachDuet, your AI partner for collaborative
            improvisation in the style of Bach chorales. We recommend using
            <span style="font-weight: 600">Chrome</span> and desktop/laptop
            computers for best support. <br /><br />

            Simply click on the “Play” button and start playing. You could use
            your computer keyboard, the on-screen keyboard or an external MIDI
            keyboard.
            <br /><br />

            In “Settings”, you can reset or change the randomness of the AI model,
            you can change the metronome, the volume, or choose to delete all of
            your data after playing.
            <br /><br />
            For better results:
          <ul>
            <li>Try to play <i>legato</i></li>
            <li>Try to play in sync with the metronome</li>
            <li>Try to interact with Bachduet. BachDuet aims to be an equal improvisation partner and not a passive
              accompaniment system</li>
            <li>Feel free to change keys. The more naturally you modulate (i.e using a cadence) the better BachDuet will
              follow.</li>
          </ul>
          If you encounter many pop up "bug" messages, it might be because the
          neural network is not running fast enough on your device. You can
          try decreasing the metronome's BPM or using a more powerful device.
          <br /><br />

          If you encounter any problem, please let us know. We would greatly
          appreciate your input!
          <br /><br />
          </p>
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
import MidiWriter from 'midi-writer-js';

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
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase Configurations.
const firebaseConfig = {
  apiKey: "AIzaSyDzY6lKHN69A8xFVljbJeDP75RL3Yz8Zfo",
  authDomain: "bachduet-d6ca6.firebaseapp.com",
  projectId: "bachduet-d6ca6",
  storageBucket: "bachduet-d6ca6.appspot.com",
  messagingSenderId: "630968840698",
  appId: "1:630968840698:web:12c4589bb03536ec857443",
  measurementId: "G-NGJWHLYCS3"
};

const app = initializeApp(firebaseConfig);

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
      modelInferenceTimes: [],
      optimalBPM: 0,
      isNotChrome: navigator.userAgent.indexOf("Chrome") <= -1,
      isMobile:
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
          navigator.userAgent
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          navigator.userAgent.substr(0, 4)
        ),
      firebaseErrCount: 0,
      misalignErrCount: 0,
    };
  },

  components: {
    keyboardUI,
    scoreUI,
    gameUI,
    Dropdown,
    StarRating,
  },

  created() {
      // Start with a new track
      // this.track_human = new MidiWriter.Track();
      // this.track_AI = new MidiWriter.Track();

      // Define an instrument (optional):
      // this.track_human.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));
      // this.track_AI.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));
      
      
  },
  mounted() {
    var vm = this;

    // initialize the midi tracks (vuex states)
    this.$store.commit("initializeMidiTracks")

    // Prevent spacebar trigger any button
    document.querySelectorAll("button").forEach(function (item) {
      item.addEventListener("focus", function () {
        this.blur();
      });
    });

    // spacebar trigger play btn
    document.addEventListener("keypress", function (event) {
      if (event.keyCode == 32 && !vm.$store.getters.getModalStatus) {
        // spacebar could toggle clock
        vm.toggleClock();
      }
    });

    // auth for firebase,  security purposes
    // The way for firebase to allow access only through certain domains is
    // (and only is, for now) to use authentication module, then only allowing
    // those modules to sign in.
    const auth = getAuth();
    signInAnonymously(auth)
      .then()
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
      });

    vm.screenWidth = document.body.clientWidth;
    vm.screenHeight = document.body.clientHeight;

    // Block lower resolutions.
    const loadingScreen = document.getElementById("loadingScreenInjection");
    if (vm.screenWidth < 450 || vm.screenHeight < 450) {
      loadingScreen.innerHTML =
        "<p style='font-size:20px;line-height:35px;padding:40px;'>We are sorry, but BachDuet Web only support larger screens for now.<br />Please visit us on desktop or larger tablets.</p>";
    }

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
    firebaseErrCount: {
      immediate: true,
      handler(newValue) {
        if (newValue == 10) {
          this.$toasted.show(
            "We cannot collect data from your session. Don't worry, your application will still run smoothly!"
          );
        }
      },
    },
    misalignErrCount: {
      immediate: true,
      handler(newValue) {
        if (newValue == 10) {
          this.$toasted.show(
            "Your local machine cannot run inference at this speed. Try lowering the BPM."
          );
        }
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
    downloadToFile(content, filename, contentType) {
      const a = document.createElement("a");
      const file = new Blob([content], { type: contentType });

      a.href = URL.createObjectURL(file);
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
      vm.$modal.show("introModal");
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
      vm.calculateOptimalBPM();
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
            if (vm.firebaseErrCount < 10) {
              this.$toasted.show(
                "Error adding doc to firebase. Error Message in console."
              );
              console.log("Firebase error:", e);
              vm.firebaseErrCount += 1;
            }
          }
        }
        workerStatus.innerHTML = e.data;
      } else {
        // If the worker is giving us ai prediction
        var aiPrediction = e.data;
        if (aiPrediction.predictTime >= 0) {
          vm.modelInferenceTimes.push(aiPrediction.predictTime);
        } else {
          // Misalignment Check
          // Will block first 2 ticks' misalignment error msg
          if ((aiPrediction.tick !== this.$store.getters.getLocalTickDelayed) && (this.$store.getters.getGlobalTick > 2)) {
            this.$toasted.show(
              "Network tick misalignment: expecting " +
              this.$store.getters.getLocalTickDelayed +
              ", get " +
              aiPrediction.tick
            );
            this.misalignErrCount += 1;
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
      }
      this.reset = false; // for explanation see the comment about reset inside runTheWorker()
      this.write = false;
    },

    resetNetwork() {
      this.reset = true;
      this.$store.commit("initializeMidiTracks");
    },

    exportMidi() {

      // Add some notes:
      // const note = new MidiWriter.NoteEvent({pitch: ['C4', 'D4', 'E4'], duration: '1'});
      // const note2 = new MidiWriter.NoteEvent({pitch: ['C4', 'D4', 'E4'], duration: '4'});
      // this.track_human.addEvent(note);
      // this.track_AI.addEvent(note2);

      // Generate a data URI
      const writer = new MidiWriter.Writer([this.$store.getters.getMidiTrackHuman, this.$store.getters.getMidiTrackAI]);
      // console.log(writer.dataUri());

      var downloadLink = document.createElement("a");
      downloadLink.href = writer.dataUri();
      downloadLink.download = "export_bachDuet.mid";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

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
            }, parseInt(((60 / vm.$store.getters.getBPM / 4) * 1000) / 4));

            if (vm.$store.getters.getLocalTick % 16 === 0) {
              try {
                const updateBuffer = vm.userNoteBuffer2Firebase.concat(
                  vm.AINoteBuffer2Firebase
                );
                await updateDoc(
                  doc(db, "data", vm.$store.getters.getSessionID),
                  {
                    playData: arrayUnion.apply(this, updateBuffer),
                  }
                );
                vm.userNoteBuffer2Firebase = [];
                vm.AINoteBuffer2Firebase = [];
              } catch (e) {
                if (vm.firebaseErrCount < 10) {
                  this.$toasted.show(
                    "Error adding doc to firebase. Error Message in console."
                  );
                  console.log("Firebase error:", e);
                  vm.firebaseErrCount += 1;
                }
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
      if (num < 2) {
        return "0" //"Not-So-Random";
      } else if (num < 20) {
        return "1" //"Not-So-Random";
      } else if (num < 40) {
        return "2" //"Getting a bit HOT in here";
      } else if (num < 60) {
        return "3"//"Some randomness";
      } else if (num < 80) {
        return "4"//"Good balance";
      } else if (num < 100) {
        return "5"//"Getting a bit messy...";
      } else if (num < 120) {
        return "6"//"A bit on the messy side";
      } else if (num < 140) {
        return "7"//"Messy! but not too messy.";
      } else if (num < 160) {
        return "8"//"So random!";
      } else if (num < 180) {
        return "9"//"A bit too random";
      } else if (num <= 200) {
        return "10"//"Careful! So much randomness";
      }
    },

    modalCallback() {
      this.$store.commit("changeModalStatus");
    },

    calculateOptimalBPM(){
      const vm = this;
      vm.optimalBPM = vm.modelInferenceTimes.sort(function(a, b){return a-b})[Math.floor(vm.modelInferenceTimes.length * 0.95)];
      vm.optimalBPM = Math.round(60 / vm.optimalBPM * 1000);
    },

    // For data kill switch in modal.
    async killData() {
      const vm = this;
      try {
        await deleteDoc(doc(db, "data", vm.$store.getters.getSessionID));
      } catch (e) {
        if (vm.firebaseErrCount < 10) {
          this.$toasted.show(
            "Error adding doc to firebase. Error Message in console."
          );
          console.log("Firebase error:", e);
          vm.firebaseErrCount += 1;
        }
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
        if (vm.firebaseErrCount < 10) {
          this.$toasted.show(
            "Error adding doc to firebase. Error Message in console."
          );
          console.log("Firebase error:", e);
          vm.firebaseErrCount += 1;
        }
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
  -webkit-animation: scale-down-center 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
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
