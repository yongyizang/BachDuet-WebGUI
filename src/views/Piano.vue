<template>
  <div class="home">
    <div id="pianoScores"></div>
    <div id="pianoRoll"></div>
    <!-- This could be further customized -->
    <piano
      id="pianoKeyboard"
      class="pianoKeyboard"
      :key="keyboardUIKey"
      :octave-start="keyboardUIoctaveStart"
      :octave-end="keyboardUIoctaveEnd"
    />
    
    <!-- logic handled by this file for decoupling purposes. -->
    <div class="octaveControls">
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
      <button class="octs" @click="toggleMetronome">
        {{ metronomeMessage }}
      </button>
      <button class="octs" @click="togglePlayback">
      {{ playbackMessage }}
    </button>
    </div>
  </div>
</template>


<script>
import * as Tone from "tone";
import { Buffer, Sequence, Transport, Event, Draw, context } from "tone";
import { Midi } from "@tonejs/midi";
import Piano from "@/components/Piano.vue";
import Instruments from "@/library/instruments";
import pianoState, { reset } from "@/library/piano-state";
import pianoRoll from "pixi-piano-roll";
import Vex from 'vexflow';

const scoreHeight = 400;

// Initialize pianoRoll's View.
var pianoRollView = pianoRoll({
  width: document.body.clientWidth,
  height: document.body.clientHeight - 200 - scoreHeight,
  pianoKeyWidth: 40,
  noteColor: 0xdb000f,
  gridLineColor: 0x333333,
  backgroundColor: 0x1a0002,
  bpm: 140,
  antialias: true,
  zoom: 4,
  resolution: 15,
  time: "0:0:0",
  renderer: "WebGLRenderer",
  noteFormat: "String",
  noteData: [
    ["0:0:0", "C4", "2n"],
    ["0:0:0", "D4", "2n"],
    ["0:0:0", "E4", "2n"],
    ["0:2:0", "B4", "4n"],
    ["0:15:0", "A#0", "4n"],
  ],
});

export default {
  name: "piano-view",

  data() {
    return {
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 1,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: false,
      metronomeMessage: "METRONOME ON",
      playbackMessage: "Start THE Playback",
      playing: false,
    };
  },

  components: {
    Piano,
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
        console.log(octaves);
        this.keyboardUIoctaveEnd = this.keyboardUIoctaveStart + octaves;
        // force keyboardUI re-render itself.
        this.keyboardUIKey += 1;
        pianoRollView.width = newValue;
      },
    },
    keyboardUIoctaveStart: {
      immediate: true,
      handler(newValue) {
        this.keyboardUIKey += 1;
      },
    },
  },

  methods: {
    toggleMetronome() {
      // Right now it only updates the message.
      // Easy to customize into doing other stuff in the future.
      if (this.metronomeStatus) {
        this.metronomeMessage = "METRONOME ON";
      } else {
        this.metronomeMessage = "METRONOME OFF";
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
  },

  mounted() {
    document.getElementById("pianoRoll").appendChild(pianoRollView.view);

    const VF = Vex.Flow;

    // Create an SVG renderer and attach it to the DIV element named "boo".
    var VFdiv = document.getElementById("pianoScores")
    var VFrenderer = new VF.Renderer(VFdiv, VF.Renderer.Backends.SVG);

    // Size our SVG:
    VFrenderer.resize(this.screenWidth, scoreHeight);

    // And get a drawing context:
    var VFcontext = VFrenderer.getContext();

    // Create a stave at position 10, 40 of width 400 on the canvas.
    var VFstave1 = new VF.Stave(30, 10, this.screenWidth - 60);
    VFstave1.addClef("treble").addTimeSignature("4/4");
    var VFstave2 = new VF.Stave(30, 100, this.screenWidth - 60);
    VFstave2.addClef("bass").addTimeSignature("4/4");

    // Create a stave at position 10, 40 of width 400 on the canvas.
    var VFstave3 = new VF.Stave(30, 180, this.screenWidth - 60);
    VFstave3.addClef("treble").addTimeSignature("4/4");
    var VFstave4 = new VF.Stave(30, 260, this.screenWidth - 60);
    VFstave4.addClef("bass").addTimeSignature("4/4");


    var lineLeft = new Vex.Flow.StaveConnector(VFstave1, VFstave2).setType(1);
    var brace = new Vex.Flow.StaveConnector(VFstave1, VFstave2).setType(3); // 3 = brace

    var lineLeft2 = new Vex.Flow.StaveConnector(VFstave3, VFstave4).setType(1);
    var brace2 = new Vex.Flow.StaveConnector(VFstave3, VFstave4).setType(3); // 3 = brace

    // Connect it to the rendering context and draw!
    VFstave1.setContext(VFcontext).draw();
    VFstave2.setContext(VFcontext).draw();
    VFstave3.setContext(VFcontext).draw();
    VFstave4.setContext(VFcontext).draw();
    lineLeft.setContext(VFcontext).draw();
    brace.setContext(VFcontext).draw();
    lineLeft2.setContext(VFcontext).draw();
    brace2.setContext(VFcontext).draw();


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
      piano.toMaster();

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
      return this.music[this.currentNoteIndex];
    },
  },
};
</script>

<style scoped>

.pianoKeyboard {
  z-index:1;
  position: fixed;
  bottom: 0;
  border-radius: 2px;
  -webkit-box-shadow: 0px 3px 19px 8px rgba(0,0,0,0.68); 
  box-shadow: 0px 3px 19px 8px rgba(0,0,0,0.68);
}

.octaveControls {
  z-index:3;
  position: fixed;
  right: 30px;
  bottom: 170px;
}

.timingControls {
  z-index:3;
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

#pianoScores {
  z-index:1;
  background-image:url('/paper-texture.jpg');
  background-repeat:no-repeat;
  background-size:cover;
  background-position:center;
  width: 100%;
  position: fixed;
  top: 0;
  -webkit-box-shadow: 0px 8px 16px -6px #000000; 
  box-shadow: 0px 8px 16px -6px #000000;
}
</style>