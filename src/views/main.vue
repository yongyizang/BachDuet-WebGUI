<template>
  <div class="home">
    <!-- This could be further customized -->
    <piano
      class="pianoKeyboard"
      :key="keyboardUIKey"
      :octave-start="keyboardUIoctaveStart"
      :octave-end="keyboardUIoctaveEnd"
    />
    <button @click="togglePlayback">
      {{ playbackMessage }}
    </button>
    <!-- logic handled by template. -->
    <div class="octaveControls">
      <button class="octs" v-if="keyboardUIoctaveEnd !== 8" @click="transposeOctUp">
        OCT UP
      </button>
      <button class="octs" v-if="keyboardUIoctaveStart !== 0" @click="transposeOctDown">
        OCT DOWN
      </button>
    </div>
    <div class="timingControls">
      <button class="octs" @click="toggleMetronome">
        {{ metronomeMessage }}
      </button>
    </div>
  </div>
</template>


<script>
import * as Tone from 'tone'
import { Buffer, Sequence, Transport, Event, Draw, context } from "tone";
import { Midi } from "@tonejs/midi";
import Piano from "@/components/Piano.vue";
import Instruments from "@/library/instruments";
import pianoState, { reset } from "@/library/piano-state";

export default {
  name: "piano-view",

  data() {
    return {
      screenWidth: document.body.clientWidth,
      ScreenHeight: document.body.clientHeight,
      keyboardUIKey: 0,
      keyboardUIoctaveStart: 1,
      keyboardUIoctaveEnd: 6,
      metronomeStatus: false,
      metronomeMessage: "METRONOME ON",
      playbackMessage: "Start Playback",
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
  },

  methods: {
    toggleMetronome() {
      // Right now it only updates the message.
      // Easy to customize into doing other stuff in the future.
      if (this.metronomeStatus) {
        this.metronomeMessage = "METRONOME ON"
      } else {
        this.metronomeMessage = "METRONOME OFF"
      }
      this.metronomeStatus = !this.metronomeStatus
    },

    togglePlayback() {
      Tone.start();
      if (this.playing) {
        Transport.pause();
        this.playbackMessage = "Start Playback";
      } else {
        Transport.start();
        this.playbackMessage = "Pause Playback";
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

      // A bare minimum room reverb.
      const reverb = new Tone.Reverb({
        predelay: 0.125,
        decay: 1.3,
        wet: 0.5
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
      return this.music[this.currentNoteIndex];
    },
  },
};
</script>

<style scoped>
.pianoKeyboard {
  position: fixed;
  bottom: 0;
}

.octaveControls {
  position: fixed;
  right: 30px;
  bottom: 170px;
}

.timingControls {
  position: fixed;
  left: 30px;
  bottom: 170px;
}

.octs {
  background-color:rgba(0,0,0,0);
  color:white;
  padding:5px;
}
</style>