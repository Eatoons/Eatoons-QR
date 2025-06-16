import * as THREE from "https://esm.sh/three@0.155.0";
import { GLTFLoader } from "https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// === Setup ===
const canvas = document.getElementById("model-canvas");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
const canvasContainer = document.getElementById("model-canvas");
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
camera.updateProjectionMatrix();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// === Lights ===
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// === Floor ===
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.1;
floor.receiveShadow = true;
scene.add(floor);

// === Controls (disabled) ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = true;

// === Loaders ===
const loader = new GLTFLoader();
let tom, jerry;
let tomMixer, jerryMixer;
let clock = new THREE.Clock();

let speed = 0.06;
let tomOffset = 3.5;

let jerryBounceHeight = 0.3;
let jerryBaseY = -2;
let direction = 1; // 1: right, -1: left

// === Load Tom ===
loader.load("./assets/tom.glb", (gltf) => {
  tom = gltf.scene;
  tom.scale.set(1.5, 1.5, 1.5);
  tom.position.set(-11, -2, 1);
  tom.traverse((n) => n.isMesh && (n.castShadow = true));
  scene.add(tom);

  tomMixer = new THREE.AnimationMixer(tom);
  gltf.animations.forEach((clip) => tomMixer.clipAction(clip).play());
  checkStart();
});

// === Load Jerry ===
loader.load("./assets/jerry.glb", (gltf) => {
  jerry = gltf.scene;
  jerry.scale.set(0.2, 0.2, 0.2);
  jerry.position.set(-11, jerryBaseY, 1);
  jerry.traverse((n) => n.isMesh && (n.castShadow = true));
  scene.add(jerry);

  jerryMixer = new THREE.AnimationMixer(jerry);
  gltf.animations.forEach((clip) => jerryMixer.clipAction(clip).play());
  checkStart();
});

let started = false;
function checkStart() {
  if (tom && jerry && !started) {
    started = true;
    animate();
  }
}

// === Animate ===
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.elapsedTime;

  tomMixer?.update(delta);
  jerryMixer?.update(delta);

  if (jerry && tom) {
    // Reverse direction when hitting bounds
    if (jerry.position.x > 8 && direction === 1) {
      direction = -1;
      tom.rotation.y += Math.PI;
      jerry.rotation.y += Math.PI;
    } else if (jerry.position.x < -11 && direction === -1) {
      direction = 1;
      tom.rotation.y -= Math.PI;
      jerry.rotation.y -= Math.PI;
    }

    // Speed multiplier logic
    const currentSpeed = direction === -1 ? speed * 2.5 : speed;

    // Jerry bouncing
    jerry.position.x += currentSpeed * direction;
    jerry.position.y = jerryBaseY + Math.sin(time * 10) * jerryBounceHeight;

    // Tom follows with offset
    const targetX = jerry.position.x - tomOffset * direction;
    tom.position.x = THREE.MathUtils.lerp(tom.position.x, targetX, 0.08); // make Tom more reactive during fast run

    // Look direction
    tom.lookAt(jerry.position);
    jerry.lookAt(
      jerry.position.x + direction,
      jerry.position.y,
      jerry.position.z
    );
  }

  renderer.render(scene, camera);
}
