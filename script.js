import * as THREE from "https://esm.sh/three@0.155.0";
import { GLTFLoader } from "https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// === Setup ===
const canvas = document.getElementById("model-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 1000);
camera.position.set(0, 3, 10);
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// === Lights ===
const light = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light);

// === Controls (Optional for debug) ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false;

// === Loaders ===
const loader = new GLTFLoader();
let tom, jerry;
let tomMixer, jerryMixer;
let clock = new THREE.Clock();

// === Load Tom ===
loader.load("/assets/tom.glb", (gltf) => {
  tom = gltf.scene;
  tom.scale.set(1, 1, 1);
  scene.add(tom);

  tomMixer = new THREE.AnimationMixer(tom);
  gltf.animations.forEach((clip) => {
    tomMixer.clipAction(clip).play();
  });

  checkStart();
});

// === Load Jerry ===
loader.load("/assets/jerry.glb", (gltf) => {
  jerry = gltf.scene;
  jerry.scale.set(0.8, 0.8, 0.8);
  scene.add(jerry);

  jerryMixer = new THREE.AnimationMixer(jerry);
  gltf.animations.forEach((clip) => {
    jerryMixer.clipAction(clip).play();
  });

  checkStart();
});

let started = false;
function checkStart() {
  if (tom && jerry && !started) {
    started = true;
    tom.position.set(0, 0, 0);
    jerry.position.set(3, 0, 0);
    animate();
    moveJerryRandomly();
  }
}

// === Move Jerry Randomly ===
function moveJerryRandomly() {
  setInterval(() => {
    const newX = (Math.random() - 0.5) * 10;
    const newZ = (Math.random() - 0.5) * 10;
    jerry.lookAt(newX, 0, newZ);

    jerry.userData.target = new THREE.Vector3(newX, 0, newZ);
  }, 3000); // Change position every 3 seconds
}

// === Animate Loop ===
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  tomMixer?.update(delta);
  jerryMixer?.update(delta);

  if (jerry?.userData?.target) {
    jerry.position.lerp(jerry.userData.target, 0.02);
  }

  if (tom && jerry) {
    // Make Tom chase Jerry
    tom.lookAt(jerry.position);
    tom.position.lerp(
      jerry.position.clone().add(new THREE.Vector3(-0.5, 0, -0.5)),
      0.015
    );
  }

  renderer.render(scene, camera);
}
