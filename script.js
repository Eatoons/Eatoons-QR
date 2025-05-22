import * as THREE from "https://esm.sh/three@0.155.0";
import { GLTFLoader } from "https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// Grab canvas from DOM
const canvas = document.getElementById("model-canvas");

// Scene setup
const scene = new THREE.Scene();
scene.background = null;

// Camera setup
const camera = new THREE.PerspectiveCamera(50, 200 / 250, 0.1, 1000);
camera.position.set(0, 1.5, 6);

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(200, 250);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
scene.add(dirLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = true;

// GLTF loader
const loader = new GLTFLoader();

// Load TOM model
loader.load(
  "./assets/tom.glb",
  (gltf) => {
    const tom = gltf.scene;
    tom.scale.set(0.2, 0.2, 0.2);
    tom.position.y = -2;

    tom.traverse((node) => {
      if (node.isMesh) node.castShadow = true;
    });

    scene.add(tom);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.6;
    ground.receiveShadow = true;
    scene.add(ground);

    animate(); // Start animation after main model is loaded
  },
  undefined,
  (error) => console.error("TOM load error:", error)
);

// Convert screen coords to world position
function getWorldPositionFromScreen(x, y, z = 0) {
  const vec = new THREE.Vector3(
    (x / renderer.domElement.clientWidth) * 2 - 1,
    -(y / renderer.domElement.clientHeight) * 2 + 1,
    z
  );
  vec.unproject(camera);
  const dir = vec.sub(camera.position).normalize();
  const distance = (z - camera.position.z) / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(distance));
}

// Load BURGER model
loader.load(
  "./assets/burger_new.glb",
  (gltf) => {
    const burger = gltf.scene;
    burger.scale.set(0.2, 0.2, 0.2);
    burger.traverse((node) => {
      if (node.isMesh) node.castShadow = true;
    });

    // Position in top-left corner of the canvas
    const margin = 20; // pixels from top-left
    const position3D = getWorldPositionFromScreen(margin, margin, 0);
    burger.position.copy(position3D);

    scene.add(burger);
  },
  undefined,
  (error) => console.error("BURGER load error:", error)
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
