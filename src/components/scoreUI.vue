<template>
  <div ref="score" id="pianoScores">
    <div v-touch:swipe.up="triggerCollapse" id="scoreWrapper">
      <div id="fadeBlockStart"></div>
      <div id="grandStaff"></div>
      <div id="noteBox"></div>
      <div id="staveBackground"></div>
      <div id="fadeBlockEnd"></div>
    </div>
    <button type="button" @click="triggerCollapse" id="collapseBtn">
      <i ref="collapseBtnSymbol" class="ri-arrow-up-s-line"></i>
    </button>
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

export default {
  name: "scoreUI",
  props: {},

  data() {
    return {
      // Customizable Properties for score rendering
      lineWidth: 2,
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
      lastSvgGroupTrebleXOffset_lastNote: null,
      lastSvgGroupTrebleXOffset_lastNote_prevBar: null,
      lastSvgGroupBassXOffset: null,
      lastSvgGroupBassXOffset_lastNote: null,
      lastDrawnNote_Human: null,
      lastDrawnNote_Human_prevBar: null,
      afairetisHuman: 0,
      afairetisAI: 0,
      barTieHuman: false,
      barTieAI: true,
      tickContexts: [],
      context: null,
      staves: [],
      notes: null,
      durations: null,
      lastXOffsetOnBar: null, // TODO delete that after I'm done
      viewX: 30,
      xTreble: 30,
      xBass: 30,
      xCurrent: 30,
      // distance between two 16ths in the score
      tickStepPixels: 30,
      // how often (in milliseconds) we scroll the viewBox
      // smaller --> smoother scrolling
      scrollStepTime: 10,
      // the position of the latest note will be at the 3/4s of the screen's width
      latestNotePosition: 0.75,
      // Scrolling starts once the x cursor has reached the desired latestNotePosition
      scrollEnabled: false,
      scrollsCounter: 0,
      scrollsNumberPerMeasure: 400,
      preDur: 1
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
    const vm = this;
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
      this.grandStaffRenderer.resize(200, 300);
      var grandStaffContext = this.grandStaffRenderer.getContext();
      var trebleStave = new this.VF.Stave(30, 50, 200)
        .addClef("treble")
        .setStyle({
          fillStyle: this.lineColor,
          strokeStyle: this.lineColor,
          lineWidth: this.lineWidth,
        });
      var bassStave = new this.VF.Stave(30, 150, 200).addClef("bass").setStyle({
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

      // Set ground for background staves.
      this.targetDiv = document.getElementById("staveBackground");
      this.renderer = new this.VF.Renderer(
        this.targetDiv,
        this.VF.Renderer.Backends.SVG
      );
      this.renderer.resize(this.screenWidth, 300);
      this.context = this.renderer.getContext();

      this.tickContexts.push(new this.VF.TickContext());
      this.tickContexts.push(new this.VF.TickContext());

      this.staves.push(new this.VF.Stave(30, 50, 5000));
      this.staves.push(new this.VF.Stave(30, 150, 5000));

      this.context.setViewBox(this.viewX, 0, this.screenWidth, 300);
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

      // Set ground for the notes.
      this.targetDiv = document.getElementById("noteBox");
      this.renderer = new this.VF.Renderer(
        this.targetDiv,
        this.VF.Renderer.Backends.SVG
      );
      this.renderer.resize(this.screenWidth, 300);
      this.context = this.renderer.getContext();

      this.tickContexts.push(new this.VF.TickContext());
      this.tickContexts.push(new this.VF.TickContext());

      this.staves.push(new this.VF.Stave(30, 50, 0));
      this.staves.push(new this.VF.Stave(30, 150, 0));

      this.staves[0].setContext(this.context);
      this.staves[1].setContext(this.context);

      setInterval(() => {
        if (this.$store.getters.getClockStatus && this.scrollEnabled) {
          this.scrollScore(1);
          this.scrollsCounter += 1;
          this.scrollsNumberPerMeasure =
            ((60 / this.$store.getters.getBPM) * 4 * 1000) /
            this.scrollStepTime;
        }
      }, this.scrollStepTime);
    },

    scrollScore(steps) {
      this.viewX +=
        (steps * (this.scrollStepTime * this.tickStepPixels)) /
        ((1000 * 60) / this.$store.getters.getBPM / 4);
      this.context.setViewBox(this.viewX, 0, this.screenWidth, 300);
    },

    formatQuantizedNote(quantNoteDict, clef = "treble", afairetis = 0) {
      const vm = this;

      var formName;
      var extraR = "";

      // Get formatted name
      if (quantNoteDict.midi === 0) {
        formName = clef == "treble" ? "b/4" : "d/2";
        extraR = "r";
      } else {
        formName = NoteFormatter(Note.fromMidiSharps(quantNoteDict.midi));
      }

      // get formatted duration
      var durationTokens;
      var durations;
      [durationTokens, durations] = this.DurationFormatter(
        quantNoteDict.dur - afairetis
      );
      // console.log(formName, " ", durationTokens);
      // stem_direction vm.VF.StaveNote.STEM_UP
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
        if (formName.charAt(1) == "#") {
          newNote.addAccidental(0, new vm.VF.Accidental("#"));
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
      var processed = this.formatQuantizedNote(
        quantNoteDict,
        "treble",
        this.afairetisHuman
      );
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

      // TODO we can't use a Formatter here (or maybe we can for each measure)
      // So I have to replicate some of its functionallity manually.
      // One problem is that the current X position of the note is not
      // stored as a class field, and that's why I have to maintain the external
      // variables first_x, last_x
      const group = this.context.openGroup();

      this.lastSvgGroupTreble = group;
      this.lastSvgGroupTrebleXOffset = this.xTreble;
      var first_x = this.xTreble;
      for (let i = 0; i < notesToDraw.length; i++) {
        let currentNote = notesToDraw[i];
        // console.log(i, " ", currentNote);
        currentNote.setStave(this.staves[0]);
        currentNote.setContext(this.context);
        this.tickContexts[0].addTickable(currentNote);
        currentNote.preFormat();

        currentNote.draw();
        this.lastSvgGroupTrebleXOffset_lastNote = this.xTreble;
        this.xTreble += this.tickStepPixels * durations[i];
        this.tickContexts[0].setX(this.xTreble);
        if (i == 0 && this.barTieHuman == true) {
          // let last_x = this.xTreble;
          // console.log("IN BAR CURVE");
          var curve = new this.VF.Curve(
            this.lastDrawnNote_Human_prevBar,
            notesToDraw[0],

            {
              cps: [
                { x: 0, y: 20 },
                { x: 0, y: 20 },
              ],
              // invert: true,
              // position_end: 'nearTop',
              x_shift: 2 * notesToDraw[0].getWidth(),
              y_shift: 20,
            }
          );
          curve.setContext(this.context);
          // curve.draw()
          curve.renderCurve({
            first_x: this.lastSvgGroupTrebleXOffset_lastNote_prevBar + 40,
            last_x: this.xTreble + 40,
            first_y: this.lastDrawnNote_Human_prevBar.getYs()[0],
            last_y: notesToDraw[0].getYs()[0],
            direction: -1,
          });
          this.barTieHuman = false;
          // first_x = last_x;
        }

        if (i > 0) {
          let last_x = this.xTreble;
          // TODO : this indexing here is not generic, it works only if we have 2 notesToDraw
          var curve = new this.VF.Curve(notesToDraw[0], notesToDraw[1], {
            cps: [
              { x: 0, y: 20 },
              { x: 0, y: 20 },
            ],
            // invert: true,
            // position_end: 'nearTop',
            x_shift: 2 * notesToDraw[0].getWidth(),
            y_shift: 20,
          });
          curve.setContext(this.context);
          // curve.draw()
          curve.renderCurve({
            first_x: first_x + 40,
            last_x: last_x + 40,
            first_y: notesToDraw[0].getYs()[0],
            last_y: notesToDraw[1].getYs()[0],
            direction: -1,
          });
          first_x = last_x;
        }
      }
      // TODO fix the names and maybe group all the Human and AI variables in one.
      // this.lastSvgGroupTrebleXOffset_lastNote = this.xTreble;
      this.lastDrawnNote_Human = notesToDraw[notesToDraw.length - 1];
      this.context.closeGroup();
    },

    drawBottom(quantNoteDict) {
      var notesToDraw;
      var durations;
      var processed = this.formatQuantizedNote(
        quantNoteDict,
        "bass",
        this.afairetisAI
      );
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
        currentNote.setStemDirection(this.VF.StaveNote.STEM_DOWN)
        this.tickContexts[1].addTickable(currentNote);
        currentNote.preFormat();

        currentNote.draw();
        this.xBass += this.tickStepPixels * durations[i];
        this.tickContexts[1].setX(this.xBass);
      }
      this.context.closeGroup();
    },

    draw() {
      var humanQuantNoteDict = this.$store.getters.getLastHumanNoteQuantized;
      var aiQuantNoteDict = this.$store.getters.getLastAINoteQuantized;

      if (aiQuantNoteDict.startTick == -1){
        aiQuantNoteDict.dur = this.preDur
        this.preDur += 1
      }
      // TODO some if's are redudant.
      if (humanQuantNoteDict.dur == 1) {
        this.afairetisHuman = 0;
        this.barTieHuman = false;
      }
      if (aiQuantNoteDict.dur == 1) {
        this.afairetisAI = 0;
        this.barTieAI = false;
      }
      if (this.$store.getters.getLocalTickDelayed % 16 === 0) {
        // this.lastDrawnNote_Human_prevBar = this.lastDrawnNote_Human;
        // this.lastSvgGroupTrebleXOffset_lastNote_prevBar = this.lastSvgGroupTrebleXOffset_lastNote;
        if (humanQuantNoteDict.dur == 1) {
          this.afairetisHuman = 0;
          this.barTieHuman = false;
        } else if (humanQuantNoteDict.dur > 1) {
          this.afairetisHuman = humanQuantNoteDict.dur - 1;
          this.barTieHuman = true;
        }
        if (aiQuantNoteDict.dur == 1) {
          this.afairetisAI = 0;
          this.barTieAI = false;
        } else if (aiQuantNoteDict.dur > 1) {
          this.afairetisAI = aiQuantNoteDict.dur - 1;
          this.barTieAI = true;
        }
      }

      this.drawTop(humanQuantNoteDict);
      this.drawBottom(aiQuantNoteDict);

      this.xCurrent += this.tickStepPixels * 1;
      // here we draw the barline and bar-number
      if (this.$store.getters.getLocalTickDelayed % 16 === 0) {
        // Draw Barnumber
        // this.xCurrent +=
        this.currentBarNumber += 1;
        this.context.font = "22px Georgia";
        this.context.fillText(
          this.currentBarNumber,
          this.xCurrent + Math.floor(this.tickStepPixels / 2),
          this.staves[0].getYForLine(0) - 20
        );

        // Draw Barline
        let thickness = 1;
        let topY = this.staves[0].getYForLine(0);
        let botY = this.staves[1].getYForLine(this.staves[1].getNumLines() - 1);
        this.context.fillRect(
          this.xCurrent + this.tickStepPixels / 2,
          topY,
          thickness,
          botY - topY
        );
        // Scrolling problem. The setTimeout function doesn't behave accurately.
        // At 60bpm and 10ms interval, it should run 400 (scrolls) per measure, however
        // it doesn't. Notice that in a previous version of the code we didn't have this problem
        // The solution I implement here is that at the end of each bar, check how many scrolls are missing,
        // and srcoll accordingly. The problem is that this creates sudden "jumps".
        // To fix that we can try to perform this check more often (i.e every beat)

        if (this.scrollEnabled == true) {
          let scrollsDiff = this.scrollsNumberPerMeasure - this.scrollsCounter;
          // console.log(scrollsDiff);
          this.scrollScore(scrollsDiff);
          this.scrollsCounter = 0;
        }

        this.lastXOffsetOnBar = this.xCurrent;
      }

      // find the position of the next note in relation with the screenWidth
      var pos = (this.xCurrent - this.viewX) / this.screenWidth;
      if (pos > this.latestNotePosition) {
        // console.log(pos);
        this.scrollEnabled = true;
      }

      if (this.$store.getters.getLocalTickDelayed % 16 === 15) {
        this.lastDrawnNote_Human_prevBar = this.lastDrawnNote_Human;
        this.lastSvgGroupTrebleXOffset_lastNote_prevBar =
          this.lastSvgGroupTrebleXOffset_lastNote;
      }
    },

    triggerCollapse() {
      const btnSymbol = this.$refs.collapseBtnSymbol.classList;
      const score = this.$refs.score;
      const scoreClass = score.classList;
      if (scoreClass.contains("slide-up")) {
        scoreClass.replace("slide-up", "slide-down");
        btnSymbol.replace("ri-arrow-down-s-line", "ri-arrow-up-s-line");
      } else if (scoreClass.contains("slide-down")) {
        scoreClass.replace("slide-down", "slide-up");
        btnSymbol.replace("ri-arrow-up-s-line", "ri-arrow-down-s-line");
      } else {
        scoreClass.add("slide-up");
        btnSymbol.replace("ri-arrow-up-s-line", "ri-arrow-down-s-line");
      }
    },

    DurationFormatter(duration) {
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
      const vm = this;
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
          vm.$toasted.show("ScoreUI error: Invalid Duration.");
          console.error("Invalid duration");
      }
      return [durationTokens, newDurations];
    },
  },
};
</script>

<style scoped>
#pianoScores {
  overflow: hidden;
  z-index: 1;
  width: calc(100% - 20px);
  height: 350px;
  position: absolute;
  left: 10px;
  top: 0;
}

#scoreWrapper {
  position: absolute;
  height: 300px;
  width: 100%;
  overflow-x: hidden;
  -webkit-box-shadow: -4px 6px 15px -9px #000000;
  box-shadow: -4px 6px 15px -9px #000000;

  background-color: rgb(233, 197, 147);
  -webkit-border-bottom-right-radius: 40px;
  -webkit-border-bottom-left-radius: 40px;
  -moz-border-radius-bottomright: 40px;
  -moz-border-radius-bottomleft: 40px;
  border-bottom-right-radius: 40px;
  border-bottom-left-radius: 40px;
}

#grandStaff {
  z-index: 997;
  position: absolute;
  top: 0;
  left: 0;
}
#noteBox {
  z-index: 995;
  position: absolute;
  top: 0px;
  left: 50px;
}
#staveBackground {
  z-index: 993;
  position: absolute;
  top: 0px;
  left: 50px;
}

#collapseBtn {
  z-index: 999;
  width: 60px;
  height: 40px;
  position: absolute;
  top: 300px;
  left: calc(50% - 30px);
  -webkit-box-shadow: -4px 6px 15px -9px #000000;
  box-shadow: -4px 6px 15px -9px #000000;
  background-color: rgb(233, 197, 147);
  color: white;
  font-size: 35px;
  -webkit-border-bottom-right-radius: 20px;
  -webkit-border-bottom-left-radius: 20px;
  -moz-border-radius-bottomright: 20px;
  -moz-border-radius-bottomleft: 20px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  border-style: hidden;
}

#fadeBlockStart {
  z-index: 996;
  display: block;
  width: 150px;
  height: 300px;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(
    270deg,
    rgba(233, 197, 147, 0) 0%,
    rgba(233, 197, 147, 1) 50%
  );
}

#fadeBlockEnd {
  z-index: 999;
  display: inline-block;
  width: 60px;
  height: 300px;
  position: absolute;
  top: 0;
  left: calc(100% - 60px);
  background: linear-gradient(
    90deg,
    rgba(233, 197, 147, 0) 0%,
    rgba(233, 197, 147, 1) 70%
  );
}

.slide-up {
  -webkit-animation: slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1) both;
  animation: slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1) both;
}

.slide-down {
  -webkit-animation: slide-down 0.5s cubic-bezier(0.19, 1, 0.22, 1) both;
  animation: slide-down 0.5s cubic-bezier(0.19, 1, 0.22, 1) both;
}

@-webkit-keyframes slide-up {
  0% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  100% {
    -webkit-transform: translateY(-300px);
    transform: translateY(-300px);
  }
}
@keyframes slide-up {
  0% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  100% {
    -webkit-transform: translateY(-300px);
    transform: translateY(-300px);
  }
}

@-webkit-keyframes slide-down {
  0% {
    -webkit-transform: translateY(-300px);
    transform: translateY(-300px);
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}
@keyframes slide-down {
  0% {
    -webkit-transform: translateY(-300px);
    transform: translateY(-300px);
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}
</style>
