import * as THREE from "https://esm.sh/three@0.155.0";
import { GLTFLoader } from "https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// Grab canvas directly
const canvas = document.getElementById("model-canvas");

// Scene setup
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(300, 300);
renderer.setPixelRatio(window.devicePixelRatio);

// Light
const light = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;

// Load model
const loader = new GLTFLoader();
loader.load(
  "./assets/unicorn.glb", // change path as needed
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    scene.add(model);
    animate();
  },
  undefined,
  (error) => console.error("Model load error:", error)
);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
