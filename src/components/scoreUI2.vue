<template>
  <div id="pianoScores"></div>
</template>

<script>
// import * as vextab from "@/library/vextab-div";
import { Note } from "@tonaljs/tonal";
import * as Vex from 'vexflow'

const CLEF_SEPARATE_AT = "B4"; // Here, we define the separate point between treble clef and bass clef for both staff.

export default {
  name: "scoreUI",
  props: {},

  data() {
    return {
      screenWidth: document.body.clientWidth,
      VF: null,
      renderer: null,
      targetDiv: null,
      visibleNoteGroups: null,
      tickContexts: [],
      context: null,
      staves: [],
      notes: null,
      durations: null
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
      // this.draw();
    },

    init() {
      this.VF = Vex.Flow;
      this.targetDiv = document.getElementById( "pianoScores");
      this.renderer = new this.VF.Renderer(this.targetDiv, this.VF.Renderer.Backends.SVG);
      this.renderer.resize(1000,1000);
      this.context = this.renderer.getContext();

      this.tickContexts.push(new this.VF.TickContext())
      this.tickContexts.push(new this.VF.TickContext())
      

      this.staves.push(new this.VF.Stave(20, 50, 20000)
                          .addClef('treble').setTempo({ name: 'Allegretto', duration: 'h', dots: 1, bpm: 66 }, -13));
      this.staves.push(new this.VF.Stave(20, 190, 20000)
                          .addClef('bass'));


      this.durations = ['8', '4', '2', '1'];
      this.notes = [
          ['c', '#', '5'],
          ['d', 'b', '5'],
          ['e', '', '5'],
          ['f', 'b', '5'],
          ['g', 'bb', '5'],
          ['a', 'b', '5'],
          ['f', 'b', '5'],

          ].map(([letter, acc, octave]) => {
          const note = new this.VF.StaveNote({
              clef: 'treble',
              keys: [`${letter}${acc}/${octave}`],
              duration: this.durations[Math.floor(Math.random()*this.durations.length)],
          })
          // .setStave(this.staveTreble)
          // .setContext(this.context)
          ;
          if(acc) note.addAccidental(0, new this.VF.Accidental(acc));
          // this.tickContextTreble.addTickable(note)
      return note;  
      });
      
      this.context.beginPath() // start recording our pen's moves
        .moveTo(0, 0) // pickup the pen and set it down at X=0, Y=0. NOTE: Y=0 is the top of the screen.
        .lineTo(50, 0) // now add a line to the right from (0, 0) to (50, 0) to our path
        .lineTo(25, 50) // add a line to the left and down from (50, 0) to (25, 50)
        .closePath() // now add a line back to wherever the path started, in this case (0, 0), closing the triangle.
        .fill({ fill: 'black' }); // now fill our triangle in yellow.


      this.xTreble = 20
      this.xBass = 20
      var root = this
      setInterval(() => {
          for (let i=0; i<1; i+=1){
            // console.log(root.notes)
            // console.log(this.notes)
            const noteTreble = this.notes[Math.floor(Math.random() * this.notes.length)];
            const noteBass = this.notes[Math.floor(Math.random() * this.notes.length)];
            console.log(noteTreble)
            noteTreble.setStave(this.staves[0]);
            noteBass.setStave(this.staves[1]);
            noteTreble.setContext(this.context);
            noteBass.setContext(this.context);
            this.tickContexts[0].addTickable(noteTreble)
            this.tickContexts[1].addTickable(noteBass)
            // noteTreble.setPreFormatted(true)
            // noteBass.setPreFormatted(true)


            noteTreble.preFormat()
            noteBass.preFormat()
            // this.tickContextTreble.preFormat().setX(30);
            this.tickContexts[0].setX(this.xTreble);
            this.tickContexts[1].setX(this.xBass);
            

            // this.staveTreble.setBegBarType(Vex.Flow.Barline.type.BEG); 

            // const group = context.openGroup();
            // this.visibleNoteGroups.push(group);
            noteTreble.draw();
            noteBass.draw();
            // context.closeGroup();

            // let barLine = new Vex.Flow.BarNote("single")
            // barLine.setContext(context)
            // barLine.setStave(this.staveTreble)
            // this.tickContextTreble.addTickable(barLine)
            // this.tickContextTreble.setX(this.xTreble + 50);
            // barLine.draw();
            let thickness = 1;
            let topY = this.staves[0].getYForLine(0);
            let botY = this.staves[1].getYForLine(this.staves[1].getNumLines() - 1) + thickness;
            // let width = this.width;
            let x_shift = 60;
            // let topX = this.top_stave.getX();
            this.context.fillRect(this.xTreble+50 + x_shift, topY, 1, botY - topY);
            

            this.xTreble += 100 
            this.xBass += 100
          }
          
      }, 1000);




      var brace = new this.VF.StaveConnector(this.staves[0], this.staves[1]).setType(3);
      var lineLeft = new this.VF.StaveConnector(this.staves[0], this.staves[1]).setType(1);
      brace.setContext(this.context).draw();
      lineLeft.setContext(this.context).draw();

      this.staves[0].setContext(this.context).draw();
      this.staves[1].setContext(this.context).draw();

      this.viewX = 0
      setInterval(() => {
        // const index = visibleNoteGroups.indexOf(group);
        // if(index === -1) return;
        // group.classList.add('too-slow');
          // visibleNoteGroups.shift();
          // console.log("repeat")
          this.context.setViewBox(this.viewX,0,1000,1000)
          this.viewX += 40;   
      }, 1000 );
    },

    draw() {
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
</style>
