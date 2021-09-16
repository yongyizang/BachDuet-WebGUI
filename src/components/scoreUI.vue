<template>
  <div id="pianoScores"></div>
</template>

<script>
import Vex from "vexflow";
import noteHelper from "@/library/note-helper";

/*
  TODO: There is a way of managing score using VexTab, a language provided within vexflow.
  Everytime we need to update anything, we just maintain a structure and a parser to parse that structure to VexTab,
  Then ask vexflow to parse VexTab to Canvas.

  Performance cost? sure, but it's literally just drawing lines.

  So now we just need to figure out a way to manage the structure of the ongoing script.
  How to do that?

  Thoughts:
  - An array of arrays. Saving stuff within each measure in an array, then save each note with its length within that measure.
*/

const DEFAULT_HEIGHT = 400;

const barWidth = 400;

var measureNum = 1;

const VF = Vex.Flow;

export default {
  name: "scoreUI",
  props: {
    height: {
      type: Number,
      validator(value) {
        return value > 0 && value < document.body.clientWidth;
      },
      default() {
        return DEFAULT_HEIGHT;
      },
    },
  },

  data() {
    return {
      screenWidth: document.body.clientWidth,
    };
  },

  watch: {
    screenWidth: {
      immediate: true,
      handler(newValue) {
        console.log("changed");
      },
    },
  },

  

  mounted() {
    const vm = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        vm.screenWidth = window.screenWidth;
      })();
    };

    // Create an SVG renderer and attach it to the DIV element named "pianoScores".
    var div = document.getElementById("pianoScores");
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(this.screenWidth, vm.height);
    var context = renderer.getContext();

    // Define the first measure.
    var userTrebleStave = new VF.Stave(30, 10, barWidth);
    userTrebleStave
      .addClef("treble")
      .addTimeSignature("4/4")
      .setContext(context)
      .draw();
    var userBassStave = new VF.Stave(30, 100, barWidth);
    userBassStave
      .addClef("bass")
      .addTimeSignature("4/4")
      .setContext(context)
      .draw();
    var userLineLeft = new Vex.Flow.StaveConnector(
      userTrebleStave,
      userBassStave
    )
      .setType(1)
      .setContext(context)
      .draw();
    var userBrace = new Vex.Flow.StaveConnector(userTrebleStave, userBassStave)
      .setType(3)
      .setContext(context)
      .draw(); // 3 = brace

    var AITrebleStave = new VF.Stave(30, 180, barWidth);
    AITrebleStave.addClef("treble")
      .addTimeSignature("4/4")
      .setContext(context)
      .draw();
    var AIBassStave = new VF.Stave(30, 260, barWidth);
    AIBassStave.addClef("bass")
      .addTimeSignature("4/4")
      .setContext(context)
      .draw();
    var AILineLeft = new Vex.Flow.StaveConnector(AITrebleStave, AIBassStave)
      .setType(1)
      .setContext(context)
      .draw();
    var AIBrace = new Vex.Flow.StaveConnector(AITrebleStave, AIBassStave)
      .setType(3)
      .setContext(context)
      .draw(); // 3 = brace

    // var staveMeasure1 = new Vex.Flow.Stave(10, 0, 300);
    // staveMeasure1
    //   .addClef("treble")
    //   .setContext(VFcontext)
    //   .draw();

    // var notesMeasure1 = [
    //   new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q" }),
    //   new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),
    //   new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr" }),
    //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
    // ];

    // // Helper function to justify and draw a 4/4 voice
    // Vex.Flow.Formatter.FormatAndDraw(VFcontext, staveMeasure1, notesMeasure1);

    // // measure 2 - juxtaposing second measure next to first measure
    // var staveMeasure2 = new Vex.Flow.Stave(
    //   staveMeasure1.width + staveMeasure1.x,
    //   0,
    //   400
    // );
    // staveMeasure2.setContext(VFcontext).draw();

    // var notesMeasure2_part1 = [
    //   new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "8" }),
    //   new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "8" }),
    //   new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8" }),
    //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "8" }),
    // ];

    // var notesMeasure2_part2 = [
    //   new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "8" }),
    //   new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "8" }),
    //   new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8" }),
    //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "8" }),
    // ];

    // // create the beams for 8th notes in 2nd measure
    // var beam1 = new Vex.Flow.Beam(notesMeasure2_part1);
    // var beam2 = new Vex.Flow.Beam(notesMeasure2_part2);

    // var notesMeasure2 = notesMeasure2_part1.concat(notesMeasure2_part2);

    // Vex.Flow.Formatter.FormatAndDraw(VFcontext, staveMeasure2, notesMeasure2);

    // // Render beams
    // beam1.setContext(VFcontext).draw();
    // beam2.setContext(VFcontext).draw();
  },

  methods: {
    newMeasure() {},
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
  position: fixed;
  top: 0;
  -webkit-box-shadow: 0px 8px 16px -6px #000000;
  box-shadow: 0px 8px 16px -6px #000000;
}
</style>
