<template>
  <div id="pianoScores">
    <div id="grandStaff"></div>
    <div id="noteBox"></div>
  </div>
</template>

<script>
// import * as vextab from "@/library/vextab-div";
import { Note } from "@tonaljs/tonal";
import * as Vex from 'vexflow'

export default {
  name: "scoreUI",
  props: {},

  data() {
    return {
      screenWidth: document.body.clientWidth,
      VF: Vex.Flow,
      grandStaffDiv: null,
      grandStaffRenderer: null,
      renderer: null,
      targetDiv: null,
      visibleNoteGroups: null,
      tickContexts: [],
      context: null,
      staves: [],
      notes: null,
      durations: null,
      viewX: 30,
      xTreble: 20,
      xBass: 20,
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
      // this.draw();
    },

    init() {
      // Render the grand staff.
      this.grandStaffDiv = document.getElementById("grandStaff");
      this.grandStaffRenderer = new this.VF.Renderer(this.grandStaffDiv, this.VF.Renderer.Backends.SVG);
      this.grandStaffRenderer.resize(100,300);
      var grandStaffContext = this.grandStaffRenderer.getContext();
      var trebleStave = new this.VF.Stave(20,50,100).addClef('treble');
      var bassStave = new this.VF.Stave(20,190,100).addClef('bass');
      trebleStave.setContext(grandStaffContext).draw();
      bassStave.setContext(grandStaffContext).draw();
      var brace = new this.VF.StaveConnector(trebleStave, bassStave).setType(3);
      var lineLeft = new this.VF.StaveConnector(trebleStave, bassStave).setType(1);
      brace.setContext(grandStaffContext).draw();
      lineLeft.setContext(grandStaffContext).draw();

      // Set ground for the notes.
      this.targetDiv = document.getElementById("noteBox");
      this.renderer = new this.VF.Renderer(this.targetDiv, this.VF.Renderer.Backends.SVG);
      this.renderer.resize(this.screenWidth,1000);
      this.context = this.renderer.getContext();

      this.tickContexts.push(new this.VF.TickContext())
      this.tickContexts.push(new this.VF.TickContext())
      
      this.staves.push(new this.VF.Stave(20, 50, 20000));
      this.staves.push(new this.VF.Stave(20, 190, 20000));

      this.context.setViewBox(this.viewX,0,this.screenWidth,1000)
      this.staves[0].setContext(this.context).draw();
      this.staves[1].setContext(this.context).draw();

      setInterval(() => {
        // I created a ref to main in order to access clockStatus. Is this a good way ? Or maybe store clockStatus in vuex ?
        // Yongyi: In the future we should move every variable we tried to call here to Vuex. But let's not worry about them now!
        if (this.$root.$refs.main.clockStatus){
          this.context.setViewBox(this.viewX,0,this.screenWidth,1000)
          // We need to think about this spend more carefully.
          this.viewX += (45 / this.$root.$refs.main.bpm); 
        }
      }, 10);

      // // Note Randomized input.
      // this.durations = ['8', '4', '2', '1'];
      // this.notes = [
      //     ['c', '#', '5'],
      //     ['d', 'b', '5'],
      //     ['e', '', '5'],
      //     ['f', 'b', '5'],
      //     ['g', 'bb', '5'],
      //     ['a', 'b', '5'],
      //     ['f', 'b', '5'],
      //     ].map(([letter, acc, octave]) => {
      //     const note = new this.VF.StaveNote({
      //         clef: 'treble',
      //         keys: [`${letter}${acc}/${octave}`],
      //         duration: this.durations[Math.floor(Math.random()*this.durations.length)],
      //     });
      //     if(acc) note.addAccidental(0, new this.VF.Accidental(acc));
      //     return note;  
      // });
    },

    notesFromThisTick() {
      const vm = this;
      var activeNotes = vm.$store.getters.getActiveNotes;
      if (activeNotes.length < 1){ // Then output rest
        const note = new vm.VF.StaveNote({clef: "treble", keys: ["b/4"], duration: "16r" })
        return note;
      } else {
      var formattedNotes = [];
      activeNotes.forEach(element => {
        // We only have sharps.
        if (element.charAt(1) == "#"){
          formattedNotes.push(element.charAt(0).toLowerCase() + element.charAt(1) + '/' + element.substring(2,element.length));
        } else {
          formattedNotes.push(element.charAt(0).toLowerCase() + '/' + element.substring(1,element.length));
        }
      });
      const note = new vm.VF.StaveNote({clef: "treble", keys: formattedNotes, duration: "16" })
      return note;
      }
    },

    draw() {
      var thisTickNote = this.notesFromThisTick();
      // Yongyi: We need a separater here to separate this to bass clef and treble clef.
      // reference my logic in scoreUI.
      thisTickNote.setStave(this.staves[0]);
      thisTickNote.setContext(this.context);
      this.tickContexts[0].addTickable(thisTickNote);
      thisTickNote.preFormat();

      // noteTreble.setStave(this.staves[0]);
      // noteBass.setStave(this.staves[1]);
      // noteTreble.setContext(this.context);
      // noteBass.setContext(this.context);
      // this.tickContexts[0].addTickable(noteTreble)
      // this.tickContexts[1].addTickable(noteBass)
      // noteTreble.setPreFormatted(true)
      // noteBass.setPreFormatted(true)


      // noteTreble.preFormat()
      // noteBass.preFormat()
      // this.tickContextTreble.preFormat().setX(30);
      this.tickContexts[0].setX(this.xTreble);
      this.tickContexts[1].setX(this.xBass);
      

      // this.staveTreble.setBegBarType(Vex.Flow.Barline.type.BEG); 

      // const group = context.openGroup();
      // this.visibleNoteGroups.push(group);
      thisTickNote.draw();
      // context.closeGroup();

      // Yongyi: Fixed thickness. It should be within fillRect.
      if (this.$store.getters.getLocalTick % 16 === 0){ // If it's time to draw a barline
        let thickness = 1;
        let topY = this.staves[0].getYForLine(0);
        let botY = this.staves[1].getYForLine(this.staves[1].getNumLines() - 1);
        let x_shift = 6;
        // Yongyi: what is this 50 here?
        this.context.fillRect(this.xTreble + 50 + x_shift, topY, thickness, botY - topY);
      }

      // this.context.beginPath() // start recording our pen's moves
      //       .moveTo(this.xTreble+50, 10) // pickup the pen and set it down at X=0, Y=0. NOTE: Y=0 is the top of the screen.
      //       .lineTo(this.xTreble+50+50, 10) // now add a line to the right from (0, 0) to (50, 0) to our path
      //       .lineTo(this.xTreble+50+50-25, 30) // add a line to the left and down from (50, 0) to (25, 50)
      //       .closePath() // now add a line back to wherever the path started, in this case (0, 0), closing the triangle.
      //       .fill({ fill: 'green' }); // now fill our triangle in yellow.

      this.xTreble += 30
      this.xBass += 30
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
  position:fixed;
  top:0;
  left:0;
}
#noteBox {
  z-index: 995;
  position:fixed;
  top:0px;
  left:80px;
}
</style>
