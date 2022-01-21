<!--
    This is the vue component of gameUI, a musical game style interface for interaction.

    This component is inspired by and referenced based on AI Duet's implementation of the same feature
    with some significant changes to the code.
-->
<template>
  <div>
    <div ref="canvas"></div>
  </div>
</template>
<script>
// This project mainly uses Three.js to generate the canvas.
import * as THREE from "three";

// Define basic parameters.
const colorForAI = 0x7dd87d;
const colorForHuman = 0x4c9173;
const backgroundColor = 0xffffff;
const backgroundOpacity = 1; // between 0 to 1.
const initialScaling = 10000; // a constant in scaling the noteblock.
const KeyboardUIHeight = 200;
const NoteAnimationMargin = 10; // margin of noteblock plane compared to the width of the key.

// Define basic "material" for three.js to build note blocks.
const geometry = new THREE.PlaneGeometry(1, 1, 1); // A basic plane.
const material = new THREE.MeshBasicMaterial({
  color: colorForAI,
  side: THREE.DoubleSide,
});
const aiMaterial = new THREE.MeshBasicMaterial({
  color: colorForHuman,
  side: THREE.DoubleSide,
});

export default {
  name: "gameUI",

  data() {
    return {
      lastUpdateTime: 0,
      /*
        We use lastUpdateTime to log the time traveled beturn frame generations
        to determine how far the note block should 'rise' in the page.

        See the method animate().
      */
      currentNotes: {},
      /*
        We don't actually note anything here.
        
        This is mainly just a flag... We use this to track the noteblocks generated.
        See the method KeyDown() for how this data is used.
      */
      // The rest here are basically just parameters Three.js need.
      renderer: null,
      scene: null,
      camera: null,
    };
  },

  created() {
    // Here's a trick to 'broadcast' the methods here to all components
    // so they could do this:
    // this.$root.$refs.gameUI.keyDown(currentNote, true);
    // See keyDown() and keyUp() method for more details here.
    this.$root.$refs.gameUI = this;
  },

  mounted() {
    // Just calls all methods that we need.
    this.init();
    this.animate();
    this.resize();
  },

  methods: {
    init() {
      // Initialize the scene, camera and renderer.
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000);
      this.camera.position.z = 1;
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(backgroundColor, backgroundOpacity);
      this.renderer.sortObjects = false;
      this.$refs.canvas.appendChild(this.renderer.domElement);
    },

    resize() {
      // Every time we need to resize, this method takes care of that.
      this.camera.left = 0;
      this.camera.right = this.$refs.canvas.clientWidth;
      this.camera.top = 0;
      this.camera.bottom = this.$refs.canvas.clientHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(
        this.$refs.canvas.clientWidth,
        this.$refs.canvas.clientHeight - KeyboardUIHeight
      );
    },

    animate() {
      // Update lastUpdate time and compute the time difference since last update.
      const delta = Date.now() - this.lastUpdateTime;
      this.lastUpdateTime = Date.now();

      // Tell three.js to give us another frame!
      requestAnimationFrame(this.animate);

      // Update camera position.
      // Camera moves down to give the illusion that every noteblock goes up.
      this.camera.position.y += (1 / 10) * delta;

      // Tell renderer to re-render.
      this.renderer.render(this.scene, this.camera);
    },

    keyDown(noteInput, AI) {
      // Get the note's position.
      /* 
        NOTE: this is a **temporary hack**!
        for now, PLEASE AVOID USING 'C4' 'Cs4' style CSS class anywhere!
        This line of code would automatically find the first element with a matching note name CSS class
        and get the 'noteblock' plane to go there.

        I know this is not elegant. I know there must be better ways. I just can't think of them right now.
      */
      console.log("in gameUI DOWN is ", noteInput, " human ", AI);
      if (document.getElementsByClassName(noteInput.replace("#", "s"))[0]) {
        const notePosition = document
          .getElementsByClassName(noteInput.replace("#", "s"))[0]
          .getBoundingClientRect();

        // Define the noteblock plane.
        const plane = new THREE.Mesh(geometry, AI ? aiMaterial : material);
        const noteWidth =
          notePosition.right - notePosition.left - NoteAnimationMargin * 2;
        plane.scale.set(noteWidth, initialScaling, 1);

        // Define the plane's position.
        plane.position.x =
          notePosition.left + noteWidth / 2 + NoteAnimationMargin;
        plane.position.y =
          window.innerHeight + this.camera.position.y + initialScaling / 2;
        plane.position.z = 0;

        // Add that plane to the scene.
        this.scene.add(plane);

        // Register this noteblock to the currentNotes data.
        const selector = AI ? "AI" + noteInput : "Human" + noteInput;
        if (!this.currentNotes.hasOwnProperty(selector)) {
          this.currentNotes[selector] = [];
        }
        this.currentNotes[selector].push({
          plane: plane,
          position: this.camera.position.y,
        });
      }
    },

    keyUp(noteInput, AI) {
      // Retrieve the noteblock from the currentNotes data.
      console.log("in gameUI UP is ", noteInput, " human ", AI);
      const selector = AI ? "AI" + noteInput : "Human" + noteInput;
      // If there is the noteblock we are looking for:
      if (this.currentNotes[selector] && this.currentNotes[selector].length) {
        const note = this.currentNotes[selector].shift();
        console.log(note);
        // Change its scale and position.
        note.plane.scale.y = Math.max(
          this.camera.position.y - note.position,
          5
        );
        note.plane.position.y =
          this.$refs.canvas.clientHeight +
          KeyboardUIHeight +
          note.position +
          note.plane.scale.y / 2;
      }
    },
  },
};
</script>
