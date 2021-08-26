<template>
  <div id="pianoScores"></div>
</template>

<script>
import Vex from "vexflow";

const DEFAULT_HEIGHT = 400;

export default {
  name: "scoreUI",
  props: {
    height: {
      type: Number,
      validator(value) {
        return value > 0 && value < document.body.clientHeight
      },
      default() {
        return DEFAULT_HEIGHT
      }
    }
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

    const VF = Vex.Flow;

    // Create an SVG renderer and attach it to the DIV element named "boo".
    var VFdiv = document.getElementById("pianoScores");
    var VFrenderer = new VF.Renderer(VFdiv, VF.Renderer.Backends.SVG);

    // Size our SVG:
    VFrenderer.resize(this.screenWidth, vm.height);

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