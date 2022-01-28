<template>
  <div id="pianoScores">
    <div id="grandStaff"></div>
    <div id="noteBox"></div>
  </div>
</template>

<script>
// import * as vextab from "@/library/vextab-div";
import { Note, Midi } from "@tonaljs/tonal";
import * as Vex from "vexflow";
const CLEF_SEPARATE_AT = "B3"; // Here, we define the separate point between treble clef and bass clef for both staff.

function NoteFormatter(note) {
  // Expecting input: "C#1" or "C3"
  if (note.charAt(1) == "#") {
    return (
      note.charAt(0).toLowerCase() +
      note.charAt(1) +
      "/" +
      note.substring(2, note.length)
    );
  } else {
    return note.charAt(0).toLowerCase() + "/" + note.substring(1, note.length);
  }
}
function DurationFormatter(duration) {
  // 1 --> 16
  // 2 --> 8
  // 3 --> 8.
  // 4 --> 4 or q
  // 5 --> 4 + need for extra tied sixteenth
  // 6 --> 4.
  // 7 --> 4. + need for extra tied sixteenth
  // 8 --> 2 or h
  // 9 --> 8 + need for extra tied sixteenth
  // 10 --> 8 + need for extra tied eight
  // 11 --> 8 + need for extra tied eigth dotted
  // 12 --> 8.
  // 13 --> 8. + need for extra tied sixteenth
  // 14 --> 8. + need for extra tied eigth
  // 15 --> 8. + need for extra tied eigth dotted
  // 16 --> 1 or w
  var durationTokens;
  var newDurations;
  switch (duration) {
    case 1:
      durationTokens = ["16"];
      newDurations = [1];
      break;
    case 2:
      durationTokens = ["8"];
      newDurations = [2];
      break;
    case 3:
      durationTokens = ["8d"];
      newDurations = [3];
      break;
    case 4:
      durationTokens = ["4"];
      newDurations = [4];
      break;
    case 5:
      durationTokens = ["4", "16"];
      newDurations = [4, 1];
      break;
    case 6:
      durationTokens = ["4d"];
      newDurations = [6];
      break;
    case 7:
      durationTokens = ["4d", "16"];
      newDurations = [6, 1];
      break;
    case 8:
      durationTokens = ["2"];
      newDurations = [8];
      break;
    case 9:
      durationTokens = ["2", "16"];
      newDurations = [8, 1];
      break;
    case 10:
      durationTokens = ["2", "8"];
      newDurations = [8, 2];
      break;
    case 11:
      durationTokens = ["2", "8d"];
      newDurations = [8, 3];
      break;
    case 12:
      durationTokens = ["2d"];
      newDurations = [12];
      break;
    case 13:
      durationTokens = ["2d", "16"];
      newDurations = [12, 1];
      break;
    case 14:
      durationTokens = ["2d", "8"];
      newDurations = [12, 2];
      break;
    case 15:
      durationTokens = ["2d", "8d"];
      newDurations = [12, 3];
      break;
    case 16:
      durationTokens = ["1"];
      newDurations = [16];
      break;

    default:
      console.log("Invalid duration");
  }
  return [durationTokens, newDurations];
}

export default {
  name: "scoreUI",
  props: {},

  data() {
    return {
      // Customizable Properties for score rendering
      lineWidth: 1.5,
      lineColor: "#000000",
      userNoteColor: "#000000",
      AINoteColor: "#FFFFFF",
      currentBarNumber: 0,

      screenWidth: document.body.clientWidth,
      VF: Vex.Flow,
      grandStaffDiv: null,
      grandStaffRenderer: null,
      renderer: null,
      targetDiv: null,
      lastSvgGroupTrebleBar: null,
      lastSvgGroupBassBar: null,
      lastSvgGroupTreble: null,
      lastSvgGroupBass: null,
      lastSvgGroupTrebleXOffset: null,
      lastSvgGroupBassXOffset: null,

      tickContexts: [],
      context: null,
      staves: [],
      notes: null,
      durations: null,
      lastXOffsetOnBar: null, // TODO delete that after I'm done
      viewX: 30,
      xTreble: 30,
      xBass: 30,
      // distance between two 16ths in the score
      tickStepPixels: 30,
      // how often (in milliseconds) we scroll the viewBox
      // smaller --> smoother scrolling
      scrollStepTime: 10,
      // the position of the latest note will be at the 3/4s of the screen's width
      latestNotePosition: 0.75,
      // Scrolling starts once the x cursor has reached the desired latestNotePosition
      scrollEnabled: false,
    };
  },

  created() {
    window.addEventListener("resize", this.resize);
    this.$root.$refs.scoreUI = this;
  },

  destroyed() {
    window.removeEventListener("resize", this.resize);
  },

  mounted() {
    this.init();
    this.resize();
  },

  methods: {
    resize() {
      this.screenWidth = document.body.clientWidth;
    },

    init() {
      const vm = this;
      // Render the grand staff.
      this.grandStaffDiv = document.getElementById("grandStaff");
      this.grandStaffRenderer = new this.VF.Renderer(
        this.grandStaffDiv,
        this.VF.Renderer.Backends.SVG
      );
      this.grandStaffRenderer.resize(100, 300);
      var grandStaffContext = this.grandStaffRenderer.getContext();
      var trebleStave = new this.VF.Stave(20, 50, 100)
        .addClef("treble")
        .setStyle({
          fillStyle: this.lineColor,
          strokeStyle: this.lineColor,
          lineWidth: this.lineWidth,
        });
      var bassStave = new this.VF.Stave(20, 190, 100).addClef("bass").setStyle({
        fillStyle: this.lineColor,
        strokeStyle: this.lineColor,
        lineWidth: this.lineWidth,
      });
      trebleStave.setContext(grandStaffContext).draw();
      bassStave.setContext(grandStaffContext).draw();

      var brace = new this.VF.StaveConnector(trebleStave, bassStave).setType(3);
      var lineLeft = new this.VF.StaveConnector(trebleStave, bassStave).setType(
        1
      );
      brace.setContext(grandStaffContext).draw();
      lineLeft.setContext(grandStaffContext).draw();

      // Set ground for the notes.
      this.targetDiv = document.getElementById("noteBox");
      this.renderer = new this.VF.Renderer(
        this.targetDiv,
        this.VF.Renderer.Backends.SVG
      );
      this.renderer.resize(this.screenWidth, 1000);
      this.context = this.renderer.getContext();

      this.tickContexts.push(new this.VF.TickContext());
      this.tickContexts.push(new this.VF.TickContext());

      this.staves.push(new this.VF.Stave(20, 50, 20000));
      this.staves.push(new this.VF.Stave(20, 190, 20000));

      this.context.setViewBox(this.viewX, 0, this.screenWidth, 1000);
      this.staves[0]
        .setContext(this.context)
        .setStyle({
          fillStyle: this.lineColor,
          strokeStyle: this.lineColor,
          lineWidth: this.lineWidth,
        })
        .draw();
      this.staves[1]
        .setContext(this.context)
        .setStyle({
          fillStyle: this.lineColor,
          strokeStyle: this.lineColor,
          lineWidth: this.lineWidth,
        })
        .draw();

      setInterval(() => {
        // TODO I created a ref to main in order to access clockStatus. Is this a good way ? Or maybe store clockStatus in vuex ?
        // Yongyi: In the future we should move every variable we tried to call here to Vuex. But let's not worry about them now!
        if (this.$root.$refs.main.clockStatus && this.scrollEnabled) {
          this.context.setViewBox(this.viewX, 0, this.screenWidth, 1000);
          this.viewX +=
            (this.scrollStepTime * this.tickStepPixels) /
            ((1000 * 60) / this.$root.$refs.main.bpm / 4);
        }
      }, this.scrollStepTime);
    },

    userNotesFromThisTick() {
      const vm = this;
      // TODO: get AI input, and use similar logic to process
      // TODO: Modify the logic to process 3 states: keydown, key-pressed and keyup
      var activeNotes = vm.$store.getters.getActiveNotes;
      // If there's no active note
      if (activeNotes.length < 1) {
        // Then output rest for both clefs
        const trebleNote = new vm.VF.StaveNote({
          clef: "treble",
          keys: ["b/4"],
          duration: "16r",
        }).setStyle({
          fillStyle: this.userNoteColor,
          strokeStyle: this.userNoteColor,
        });
        const bassNote = new vm.VF.StaveNote({
          clef: "treble", // legacy problem. IGNORE AND USE " treble "
          keys: ["b/4"],
          duration: "16r",
        }).setStyle({
          fillStyle: this.userNoteColor,
          strokeStyle: this.userNoteColor,
        });
        return [trebleNote, bassNote];
      } else {
        // If there are active notes

        // First try to separate them.
        var clefSeparateNum = Note.midi(CLEF_SEPARATE_AT);
        var trebleNoteArray = [];
        var bassNoteArray = [];
        activeNotes.forEach((note) => {
          if (Note.midi(note) <= clefSeparateNum) {
            bassNoteArray.push(note);
          } else {
            trebleNoteArray.push(note);
          }
        });
        // Then format each one
        var formattedTrebleNotes = [];
        var formattedBassNotes = [];
        trebleNoteArray.forEach((element) => {
          formattedTrebleNotes.push(NoteFormatter(element));
        });
        bassNoteArray.forEach((element) => {
          formattedBassNotes.push(NoteFormatter(element));
        });
        // Rule out empty cases.
        const trebleNotes = new vm.VF.StaveNote({
          clef: "treble",
          keys:
            formattedTrebleNotes.length < 1 ? ["b/4"] : formattedTrebleNotes,
          duration: formattedTrebleNotes.length < 1 ? "16r" : "16",
        }).setStyle({
          fillStyle: this.userNoteColor,
          strokeStyle: this.userNoteColor,
        });
        const bassNotes = new vm.VF.StaveNote({
          clef: "treble",
          keys: formattedBassNotes.length < 1 ? ["b/4"] : formattedBassNotes,
          duration: formattedBassNotes.length < 1 ? "16r" : "16",
        }).setStyle({
          fillStyle: this.userNoteColor,
          strokeStyle: this.userNoteColor,
        });

        return [trebleNotes, bassNotes];
      }
    },

    AINotesFromThisTick() {
      const vm = this;
      // Load AI Prediction in.
      var AINoteMIDI =
        this.$store.getters.getAiPredictions[this.$store.getters.getLocalTick]
          .midi;
      // Assuming that NN would always only spit out one note.
      var AINoteName = Midi.midiToNoteName(AINoteMIDI, {
        sharps: true,
      });

      var AINote = new vm.VF.StaveNote({
        clef: "treble", //legacy! don't touch don't change to bass or UI would behave weirdly. FIX IT LATER
        keys: AINoteName === "C-1" ? ["b/4"] : [NoteFormatter(AINoteName)],
        duration: AINoteName === "C-1" ? "16r" : "16",
      }).setStyle({
        fillStyle: this.AINoteColor,
        strokeStyle: this.AINoteColor,
      });
      var EmptyNote = new vm.VF.StaveNote({
        clef: "treble",
        keys: ["b/4"],
        duration: "16r",
      }).setStyle({
        fillStyle: this.AINoteColor,
        strokeStyle: this.AINoteColor,
      });
      // There's an empty note (rest) and a note initialized
      // clef separating logic essentially is to put which one to where
      // if it should go to bass clef, then put the note in the second one
      if (AINoteMIDI <= Note.midi(CLEF_SEPARATE_AT)) {
        return [EmptyNote, AINote];
      } else {
        return [AINote, EmptyNote];
      }
    },

    draw() {
      console.log(this.xTreble);
      // Yongyi: Extremely Untidy, yet completely necessary
      var thisTickUserNotes = this.userNotesFromThisTick();
      var thisTickAINotes = this.AINotesFromThisTick();
      thisTickUserNotes[0].setStave(this.staves[0]);
      thisTickUserNotes[1].setStave(this.staves[1]);
      thisTickAINotes[0].setStave(this.staves[0]);
      thisTickAINotes[1].setStave(this.staves[1]);

      thisTickUserNotes[0].setContext(this.context);
      thisTickUserNotes[1].setContext(this.context);
      thisTickAINotes[0].setContext(this.context);
      thisTickAINotes[1].setContext(this.context);

      this.tickContexts[0].addTickable(thisTickUserNotes[0]);
      this.tickContexts[1].addTickable(thisTickUserNotes[1]);
      this.tickContexts[0].addTickable(thisTickAINotes[0]);
      this.tickContexts[1].addTickable(thisTickAINotes[1]);
      thisTickUserNotes[0].preFormat();
      thisTickUserNotes[1].preFormat();
      thisTickAINotes[0].preFormat();
      thisTickAINotes[1].preFormat();

      this.tickContexts[0].setX(this.xTreble);
      this.tickContexts[1].setX(this.xBass);

      thisTickUserNotes[0].draw();
      thisTickUserNotes[1].draw();
      thisTickAINotes[0].draw();
      thisTickAINotes[1].draw();

      // console.log("drawing number in ",this.$store.getters.getLocalTick)
      // we ll use this method to draw the bar number
      this.context.fillText(
        "0" + this.$store.getters.getLocalTick,
        this.xTreble,
        this.staves[0].getYForLine(0)
      );

      if (this.$store.getters.getLocalTickDelayed % 16 === 0) {
        console.log(
          "drawing line in ",
          this.$store.getters.getLocalTickDelayed
        );
        // If it's time to draw a barline
        let thickness = 1;
        let topY = this.staves[0].getYForLine(0);
        let botY = this.staves[1].getYForLine(this.staves[1].getNumLines() - 1);
        let x_shift = 60;
        // Yongyi: what is this 50 here?
        this.context.fillRect(
          this.xTreble, // + 0 + x_shift,
          topY,
          thickness,
          botY - topY
        );
      }

      this.xTreble += this.tickStepPixels;
      this.xBass += this.tickStepPixels;

      // find the position of the next note in relation with the screenWidth
      var pos = (this.xTreble - this.viewX) / this.screenWidth;
      if (pos > this.latestNotePosition) {
        this.scrollEnabled = true;
      }
    },

    formatQuantizedNote(quantNoteDict, clef = "treble") {
      const vm = this;

      var formName;
      var extraR = "";
      
      // Get formatted name
      if (quantNoteDict.midi === 0) {
        formName = (clef == "treble") ? "b/4" : "d/2";
        extraR = "r";
      } else {
        formName = NoteFormatter(Note.fromMidiSharps(quantNoteDict.midi));
      }

      // get formatted duration
      var durationTokens;
      var durations;
      [durationTokens, durations] = DurationFormatter(quantNoteDict.dur);
      console.log(formName, " ", durationTokens);
      var notes = [];
      for (let i = 0; i < durationTokens.length; i++) {
        let newNote = new vm.VF.StaveNote({
          clef: clef,
          keys: [formName],
          duration: durationTokens[i] + extraR,
        }).setStyle({
          fillStyle: this.userNoteColor,
          strokeStyle: this.userNoteColor,
        });
        if (durationTokens[i].includes("d")) {
          newNote.addDotToAll();
        }
        notes.push(newNote);
      }
      return { notes: notes, durations: durations };
    },

    // TODO drawTop and drawBottom are almost the same. Find a way so we don't have to
    // repeat code

    drawTop(quantNoteDict) {
      var notesToDraw;
      var durations;
      var processed = this.formatQuantizedNote(quantNoteDict, "treble");
      notesToDraw = processed.notes;
      durations = processed.durations;
      this.tickContexts[0].setX(this.xTreble);

      if (durations.length === 1 && durations[0] === 1) {
        // this.xTreble += this.tickStepPixels;
        this.lastSvgGroupTrebleBar = this.$store.getters.getBarTick;
      } else {
        if (this.lastSvgGroupTreble) {
          this.lastSvgGroupTreble.remove();
          this.xTreble = this.lastSvgGroupTrebleXOffset;
          this.tickContexts[0].setX(this.xTreble);
        }
      }
      const group = this.context.openGroup();

      this.lastSvgGroupTreble = group;
      this.lastSvgGroupTrebleXOffset = this.xTreble;

      for (let i = 0; i < notesToDraw.length; i++) {
        let currentNote = notesToDraw[i];
        // console.log(i, " ", currentNote);
        currentNote.setStave(this.staves[0]);
        currentNote.setContext(this.context);
        this.tickContexts[0].addTickable(currentNote);
        currentNote.preFormat();

        currentNote.draw();
        this.xTreble += this.tickStepPixels * durations[i];
        this.tickContexts[0].setX(this.xTreble);
      }

      // TODO : for some uknown reason it doesn't work
      // if (notesToDraw.length == 2){
      //     var curve = new this.VF.Curve({from : notesToDraw[0],
      //                                   to : notesToDraw[1],
      //                                   options: {
      //                                         cps: [
      //                                           { x: 0, y: 20 },
      //                                           { x: 0, y: 20 },
      //                                         ],
      //                                         invert: true,
      //                                         position_end: 'nearTop',
      //                                         y_shift: 20,
      //                                       },
      //                                   });
      //     curve.setContext(this.context);
      //     curve.draw()
      // }
      this.context.closeGroup();
    },

    drawBottom(quantNoteDict) {
      var notesToDraw;
      var durations;
      var processed = this.formatQuantizedNote(quantNoteDict, "bass");
      notesToDraw = processed.notes;
      durations = processed.durations;
      this.tickContexts[1].setX(this.xBass);

      if (durations.length === 1 && durations[0] === 1) {
        // this.xTreble += this.tickStepPixels;
      } else {
        if (this.lastSvgGroupBass) {
          this.lastSvgGroupBass.remove();
          this.xBass = this.lastSvgGroupBassXOffset;
          this.tickContexts[1].setX(this.xBass);
        }
      }
      const group = this.context.openGroup();
      this.lastSvgGroupBass = group;
      this.lastSvgGroupBassXOffset = this.xBass;

      for (let i = 0; i < notesToDraw.length; i++) {
        let currentNote = notesToDraw[i];
        currentNote.setStave(this.staves[1]);
        currentNote.setContext(this.context);
        this.tickContexts[1].addTickable(currentNote);
        currentNote.preFormat();

        currentNote.draw();
        this.xBass += this.tickStepPixels * durations[i];
        this.tickContexts[1].setX(this.xBass);
      }
      this.context.closeGroup();
    },

    draw2() {
      var humanQuantNoteDict = this.$store.getters.getLastHumanNoteQuantized;
      var aiQuantNoteDict = this.$store.getters.getLastAINoteQuantized;
      this.drawTop(humanQuantNoteDict);
      this.drawBottom(aiQuantNoteDict);

      // here we draw the barline and bar-number
      if (this.$store.getters.getLocalTickDelayed % 16 === 0) {
        // Draw Barnumber
        this.currentBarNumber += 1;
        this.context.font="22px Georgia";
        this.context.fillText(
          this.currentBarNumber,
          this.xTreble,
          this.staves[0].getYForLine(0) - 10
        );

        // Draw Barline
        let thickness = 1;
        let topY = this.staves[0].getYForLine(0);
        let botY = this.staves[1].getYForLine(this.staves[1].getNumLines() - 1);
        this.context.fillRect(
          this.xTreble,
          topY,
          thickness,
          botY - topY
        );
        if (this.lastXOffsetOnBar) {
          console.log("we moved ", this.xTreble - this.lastXOffsetOnBar);
        }
        this.lastXOffsetOnBar = this.xTreble;
      }

      // find the position of the next note in relation with the screenWidth
      var pos = (this.xTreble - this.viewX) / this.screenWidth;
      if (pos > this.latestNotePosition) {
        this.scrollEnabled = true;
      }
    },
  },
};
</script>

<style scoped>
#pianoScores {
  z-index: 1;
  background-image: url("/paper-texture.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 50%;
  position: fixed;
  top: 0;
  -webkit-box-shadow: 0px 8px 16px -6px #000000;
  box-shadow: 0px 8px 16px -6px #000000;
}

#grandStaff {
  z-index: 997;
  position: fixed;
  top: 0;
  left: 0;
}
#noteBox {
  z-index: 995;
  position: fixed;
  top: 0px;
  left: 80px;
}
</style>
