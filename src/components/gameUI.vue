<template>
<div>
  <div ref="canvas"></div>
</div>
</template>
<script>
import * as THREE from 'three'

const geometry = new THREE.PlaneGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( {color: 0x1FB7EE, side: THREE.DoubleSide} )
const aiMaterial = new THREE.MeshBasicMaterial( {color: 0xFFB729, side: THREE.DoubleSide} )

const KeyboardUIHeight = 200;
const NoteAnimationMargin = 10;

export default {
  name: 'gameUI',

  data() {
    return {
      lastUpdateTime: 0,
      currentNotes: {},
      cube: null,
      renderer: null,
      scene: null,
      camera: null
    }
  },

  created() {
    this.$root.$refs.gameUI = this;
  },

  methods: {
    init() {
      this.scene = new THREE.Scene()
      this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000)
      this.camera.position.z = 1;
      this.camera.lookAt (new THREE.Vector3(0,0,0));

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setPixelRatio( window.devicePixelRatio )
      this.renderer.setClearColor(0x000000, 0)
      this.renderer.sortObjects = false
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.$refs.canvas.appendChild(this.renderer.domElement)

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      this.cube = new THREE.Mesh(geometry, material)
      this.scene.add(this.cube)
    },

    animate() {
      const delta = Date.now() - this.lastUpdateTime;
      this.lastUpdateTime = Date.now();
      requestAnimationFrame(this.animate)
      this.camera.position.y += 1 / 10 * delta
      this.renderer.render(this.scene, this.camera)
    },

    keyDown(noteInput, AI){
      // Get the note's position.
      const notePosition = document.getElementsByClassName(noteInput.replace("#","s"))[0].getBoundingClientRect();
      console.log("KeyDown at Note" + noteInput);
      const selector = noteInput + AI ? "AI" : "Human";
      if (!this.currentNotes.hasOwnProperty(selector)){
        this.currentNotes[selector] = [];
      }
      const initialScaling = 10000;
      const plane = new THREE.Mesh(geometry, AI ? aiMaterial : material);
      const noteWidth = notePosition.right - notePosition.left - NoteAnimationMargin * 2;
      plane.scale.set(noteWidth, initialScaling, 1);
      plane.position.z = 0;
      plane.position.x = notePosition.left + noteWidth / 2 + NoteAnimationMargin;
      plane.position.y = window.innerHeight + this.camera.position.y + initialScaling / 2;
      this.scene.add(plane);

      this.currentNotes[selector].push({
        plane: plane,
        position: this.camera.position.y
      })
    },

    keyUp(noteInput, AI){
      console.log("KeyUp at Note " + noteInput);
      const selector = noteInput + AI ? "AI" : "Human";
      if (this.currentNotes[selector] && this.currentNotes[selector].length){
        const note = this.currentNotes[selector].shift();
        const plane = note.plane;
        const position = note.position
        plane.scale.y = Math.max(this.camera.position.y - position, 5);
        plane.position.y = this.$refs.canvas.clientHeight + KeyboardUIHeight + position + plane.scale.y / 2;
      }
    },

    resize(){
      this.camera.left = 0;
      this.camera.bottom = this.$refs.canvas.clientHeight;
      this.camera.right = this.$refs.canvas.clientWidth;
      this.camera.top = 0;

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight - KeyboardUIHeight)
    }
  },

  mounted() {
    this.init()
    this.animate();
    this.resize();
  },

  computed: {
    bottom: function (){
      return this.camera.position.y + this.$refs.canvas.clientHeight;
    }
  }
}
</script>