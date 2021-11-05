<template>
  <div>
    <canvas id="game"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";

var scene;
var canvas;
var renderer;
var camera;

const geometry = new THREE.PlaneGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( {color: 0x1FB7EC, side: THREE.DoubleSide} )
const aiMaterial = new THREE.MeshBasicMaterial( {color: 0xFFB729, side: THREE.DoubleSide} )

window.zero = new THREE.Vector3(0, 0, 0);

var lastUpdate;

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#eee");
  canvas = document.getElementById("game");
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000)
  camera.position.z = 1;
  camera.lookAt(new THREE.Vector3(0, 0, 0));


}

export default {
  name: "gameUI",

  mounted() {
    initScene();
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    const cube2 = new THREE.Mesh(geometry, material);
    const cube3 = new THREE.Mesh(geometry, material);
    const cube4 = new THREE.Mesh(geometry, material);
    const cube5 = new THREE.Mesh(geometry, material);
    const cube6 = new THREE.Mesh(geometry, material);
    scene.add(cube);
    scene.add(cube2);
    scene.add(cube3);
    scene.add(cube4);
    scene.add(cube5);
    scene.add(cube6);
    function animate() {
      cube.rotation.y += 0.01;
      cube2.rotation.y += 0.3;
      cube3.rotation.y -= 0.04;
      cube4.rotation.y += 0.02;
      cube5.rotation.y += 0.1;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  },

  methods: {},
};
</script>

<style scoped>
#game {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
