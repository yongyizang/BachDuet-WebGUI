<template>
  <div id="pianoScores"></div>
</template>

<script>
import Vex from "vexflow";

export default {
  name: "scoreUI",

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
    const that = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        that.screenWidth = window.screenWidth;
      })();
    };

    const VF = Vex.Flow;

    // Create an SVG renderer and attach it to the DIV element named "boo".
    var VFdiv = document.getElementById("pianoScores");
    var VFrenderer = new VF.Renderer(VFdiv, VF.Renderer.Backends.SVG);

    // Size our SVG:
    VFrenderer.resize(this.screenWidth, 400);

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

