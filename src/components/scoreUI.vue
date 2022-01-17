<template>
  <div id="pianoScores"></div>
</template>

<script>
import * as vextab from "@/library/vextab-div";
import { Note } from "@tonaljs/tonal";
const CLEF_SEPARATE_AT = "C4"; // Here, we define the separate point between treble clef and bass clef for both staff.

/*
  data need to be in this format as shown in fakeHumanData and fakeAIData, and we currently only support 2n, 4n, 8n and 16n.
  functionailities such as automatically adding barlines, automactially coupling same notes together are not (and should not) being handled here;
  this is just the front-end display.
*/

const fakeHumanData = [
  [["D4", "C3"], "4n"], // This encode a multi-voice note.
  [["C#4"], "8n"], // This is a single note.
  [0], // This would encode a barline
  [-1, "4n"], // This would encode a rest
  [["D4", "C3"], "16n"],
  [["C#4"], "8n"],
];

const fakeAIData = [
  [["E4", "C3"], "4n"],
  [["C#4"], "8n"],
  [0],
  [-1, "4n"],
  [["D4", "C3"], "16n"],
  [["C#4"], "8n"],
];

function note2Symbol(note) {
  // Expecting input like "C#4", would give out "C#/4"
  return (
    note.substring(0, note.length - 1) + "/" + note.charAt(note.length - 1)
  );
}

function multipleNote2Symbol(notes) {
  // Expect input array, like ["D4","C3"], would give out "(D#4.C#3)"
  let result = "(";
  notes.forEach((note) => {
    note = note2Symbol(note); // convert note into symbol
    result = result + note + ".";
  });
  return result.substring(0, result.length - 1) + ")";
}

function noteLength2Symbol(length) {
  // This function would convert 16n, 8n, 4n and 2n to the corresponding vextab grammar.
  switch (length) {
    case "16n":
      return ":16";
    case "8n":
      return ":8";
    case "4n":
      return ":q";
    case "2n":
      return ":h";
    default:
      throw new Error(
        "note-length-to-symbol function is having trouble with the note length you passed in. You passed in: " +
          length +
          ". We could only process 16n, 8n, 4n or 2n."
      );
  }
}

function clefSeparater(notes) {
  // This function would separate the input data into two sets, one for treble clef and one for bass clef.
  // Init the notes array.
  let trebleNotes = [];
  let bassNotes = [];
  let clefSeparateNum = Note.midi(CLEF_SEPARATE_AT);
  notes.forEach((note) => {
    if (note[0] == 0 || note[0] == -1) {
      // If we have a barline, or a rest, which is equal on both clefs
      trebleNotes.push(note);
      bassNotes.push(note);
    } else {
      if (note[0].length == 1) {
        // If there's only one note
        if (Note.midi(note[0][0]) <= clefSeparateNum) {
          // If that note is lower than or equal to the clef separating note
          bassNotes.push(note); // put the note to bass clef
          trebleNotes.push([-1, note[1]]); // put a rest to the treble clef
        } else {
          // If it's higher
          trebleNotes.push(note); // put the note to treble clef
          bassNotes.push([-1, note[1]]); // put a rest to the bass clef
        }
      } else if (note[0].length > 1) {
        // If there's more than one note
        // initialize two arrays waiting to be pushed
        let trebleVoices = [];
        let bassVoices = [];

        note[0].forEach((note) => {
          if (Note.midi(note) <= clefSeparateNum) {
            // If that note is lower than or equal to the clef separating note
            bassVoices.push(note); // put it to bass voices
          } else {
            // If it's higher
            trebleVoices.push(note); // put it to treble voices
          }
        });

        // In case any one is empty
        if (trebleVoices.length == 0) {
          trebleVoices = -1;
        }
        if (bassVoices.length == 0) {
          bassVoices = -1;
        }

        // If none is empty, then push the voices into corresponding clefs
        trebleNotes.push([trebleVoices, note[1]]);
        bassNotes.push([bassVoices, note[1]]);
      }
    }
  });
  return [trebleNotes, bassNotes];
}

function note2VexTabNote(note) {
  if (note[0] == 0) {
    // If we have a barline,
    return " | "; // return barline vextab symbol.
  } else if (note[0] == -1) {
    // If we have a rest,
    return noteLength2Symbol(note[1]) + " ##";
  } else {
    // If we have a note
    if (note[0].length == 1) {
      // If there's only 1 note currently played
      return noteLength2Symbol(note[1]) + " " + note2Symbol(note[0][0]);
    } else if (note[0].length > 1) {
      console.log(note);
      // If there's more than 1 note being played
      return noteLength2Symbol(note[1]) + " " + multipleNote2Symbol(note[0]);
    } else {
      throw new Error(
        "note-to-vextab-note function is having trouble processing your input. You passed in: " +
          note
      );
    }
  }
}

function notes2vextabContent(
  width = 400,
  scale = 1.0,
  space = 40,
  notation = true,
  tablature = false,
  humanNotes,
  AINotes
) {
  // This would convert lines to vextab content.
  // all parameters are the same as vextab.
  /*
    keyword	        values/descriptions
    width	        Set the width of the stave in pixels.
    scale	        The zoom level of the notation. Default is 1.0.
    space	        Adds space (given in pixels) before the next stave.
    notation	    true/false
    tablature	    true/false
    clef	        treble, alto, tenor, bass, percussion
    key	            C, Am, F, Dm, Bb, Gm, Eb, Cm, Ab, Fm, Db, Bbm, Gb, Ebm, Cb, Abm, G, Em, D, Bm, A, F#m, E, C#m, B, G#m, F#, D#m, C#, A#m
    time	        C, C|, #/#
    tuning	        standard, dropd, eb, E/5,B/4,G/4,D/4,A/3,E/3
    */

  humanNotes = clefSeparater(humanNotes);
  var humanTrebleClef = "";
  var humanBassClef = "";
  humanNotes[0].forEach((note) => {
    humanTrebleClef = humanTrebleClef + note2VexTabNote(note);
  });
  humanNotes[1].forEach((note) => {
    humanBassClef = humanBassClef + note2VexTabNote(note);
  });

  AINotes = clefSeparater(AINotes);
  var AITrebleClef = "";
  var AIBassClef = "";
  AINotes[0].forEach((note) => {
    AITrebleClef = AITrebleClef + note2VexTabNote(note);
  });
  AINotes[1].forEach((note) => {
    AIBassClef = AIBassClef + note2VexTabNote(note);
  });

  var result =
    "options font-size=18 width = " +
    width +
    " scale = " +
    scale +
    " space = " +
    space +
    "\ntabstave notation=" +
    notation +
    " tablature=" +
    tablature +
    " clef=treble" +
    "\nnotes" +
    humanTrebleClef +
    "\ntext .0,You are Playing:" +
    "\ntabstave notation=" +
    notation +
    " tablature=" +
    tablature +
    " clef=bass" +
    "\nnotes" +
    humanBassClef +
    "\noptions font-size=18 width = " +
    width +
    " scale = " +
    scale +
    " space = " +
    (space + 50) +
    "\ntabstave notation=" +
    notation +
    " tablature=" +
    tablature +
    " clef=treble" +
    "\nnotes" +
    AITrebleClef +
    "\ntext .0, BachDuet is Playing:" +
    "\ntabstave notation=" +
    notation +
    " tablature=" +
    tablature +
    " clef=bass" +
    "\nnotes" +
    AIBassClef;

  return result;
}

export default {
  name: "scoreUI",
  props: {
  },

  data() {
    return {
      screenWidth: document.body.clientWidth,
      VF: null,
      Renderer: null,
      artist: null,
      tab: null,
      targetDiv: null,
    };
  },

  created() {
    window.addEventListener("resize", this.resize);
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
        this.draw();
    },

    init() {
      this.VF = vextab.Flow;
      this.Renderer = this.VF.Renderer;
      this.targetDiv = new this.Renderer(
        $("#pianoScores")[0],
        this.Renderer.Backends.SVG
      );
      this.artist = new vextab.Artist(50, 50, this.screenWidth, {
        scale: 1,
      });
      this.tab = new vextab.VexTab(this.artist);
    },

    draw() {
      this.tab.reset();
      this.artist.reset();
      this.tab.parse(
        notes2vextabContent(
          this.screenWidth - 50,
          1.0,
          0,
          true,
          false,
          fakeHumanData,
          fakeAIData
        )
      );
      this.artist.render(this.targetDiv);
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
  position: fixed;
  top: 0;
  -webkit-box-shadow: 0px 8px 16px -6px #000000;
  box-shadow: 0px 8px 16px -6px #000000;
}
</style>
