<template>
  <div class="home">
    <!-- This could be further customized -->
    <piano :octave-start=keyboardUI.octaveStart :octave-end=keyboardUI.octaveEnd />
    <button  @click="togglePlayback"> DEMO PLAYBACK </button>
    <button @click="transposeOctUp"> OCT UP </button>
    <button @click="transposeOctDown"> OCT DOWN </button>
    <p>Width: {{ window.width }} px</p>
  </div>
</template>


<script>
import Tone, { Buffer, Sequence, Transport, Event, Draw, context } from "tone"
import { Midi } from "@tonejs/midi"
import Piano from "@/components/Piano.vue"
import Instruments from "@/library/instruments"
import pianoState, { reset } from "@/library/piano-state"


export default {
  name: "piano-view",

  data() {
    return {
      window: {
        width: 0,
        height: 0
      },
      keyboardUI: {
        octaveStart: 1,
        octaveEnd: 6
      },
      music: [
        ["C2", "D#2", "G2", "C3", "G2", "D#2"], // Cm (i)
        ["B1", "D2", "G2", "B2", "G2", "D2"], // G (V)
        ["A#1", "D2", "F2", "A#2", "F2", "D2"], // Bb (VII)
        ["A1", "C2", "F2", "A2", "F2", "C2"], // F (V / VII)
        ["G#1", "C2", "D#2", "G#2", "D#2", "C2"], // Ab (VI)
        ["G1", "C2", "D#2", "G2", "D#2", "C2"], // Cm (i)
        ["F#1", "C2", "D#2", "F#2", "D#2", "C2"], // F#dim7 (vii° / V)
        ["G1", "C2", "D2", "G2", "D2", "B1"] // Gsus4 (?) -> G (V)
      ],
      tempo: 60, // BPM
      playing: false,
      currentNoteIndex: 0
    }
  },

  components: {
    Piano
  },

  methods: {
    togglePlayback() {
      if (this.playing) {
        Transport.pause()
      } else {
        Transport.start()
      }
      this.playing = !this.playing
    },

    transposeOctUp() {
      let octStartNow = this.keyboardUI.octaveStart;
      let octEndNow = this.keyboardUI.octaveEnd;
      this.$set(this.keyboardUI, "octaveStart", octStartNow + 1);
      this.$set(this.keyboardUI, "octaveEnd", octEndNow + 1);
    },

    transposeOctDown() {
      let octStartNow = this.keyboardUI.octaveStart;
      let octEndNow = this.keyboardUI.octaveEnd;
      this.$set(this.keyboardUI, "octaveStart", octStartNow - 1);
      this.$set(this.keyboardUI, "octaveEnd", octEndNow - 1);
    },

    handleResize() {
        this.window.width = window.innerWidth;
        this.window.height = window.innerHeight;

        let windowWidth = this.window.width;
        let octaves;
        if (windowWidth <= 1024){
          // for iPads. 1024 * 768.
            octaves = 5;
        } else if (windowWidth <= 1366){
          // for iPad Pros. 1366 * 1024.
            octaves = 6;
        } else if (windowWidth <= 1920){
          // for 1920 * 1080 screens.
            octaves = 7;
        } else {
            octaves = 8;
        }
        this.keyboardUI.octaveEnd = this.keyboardUI.octaveStart + octaves - 1;
    }
  },

  created() {
    // For window size detection.
    window.addEventListener("resize", this.handleResize);
    this.handleResize();

    // Flatten the music... in the non-musical sense. o_O
    this.music = this.music.flat()

    const instruments = new Instruments()

    instruments.createSampler("piano", piano => {
      piano.release = 2
      piano.toMaster()

      const now = Tone.now() + 0.5
      // Transcribe midi to tone.js
      Midi.fromUrl("/audio/midi/bach_846.mid")
        .then(midi => {
          midi.tracks.forEach(track => {
            track.notes.forEach(note => {
              Transport.schedule(() => {
                piano.triggerAttackRelease(
                  note.name,
                  note.duration,
                  Tone.now(),
                  note.velocity
                )
              }, note.time + now)

              Transport.schedule(time => {
                Draw.schedule(() => {
                  pianoState[note.name] = true
                }, time)
              }, note.time + now)

              Transport.schedule(time => {
                Draw.schedule(() => {
                  pianoState[note.name] = false
                }, time)
              }, note.time + note.duration + now)
            })
          })
        })
        .catch(console.error)
    })

    Buffer.on("error", error => {
      console.error(error)
    })
  },

  destroyed() {
      window.removeEventListener("resize", this.handleResize);
  },

  computed: {
    pianoState() {
      return pianoState
    },

    previousNote() {
      let lastNote

      if (this.currentNoteIndex === 0) {
        lastNote = this.music.length - 1
      } else {
        lastNote = Math.max(0, this.currentNoteIndex - 1)
      }

      return this.music[lastNote]
    },

    activeNote() {
      return this.music[this.currentNoteIndex]
    }
  }
}
</script>