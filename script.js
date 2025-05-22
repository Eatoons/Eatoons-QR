import * as THREE from "https://esm.sh/three@0.155.0";
import { GLTFLoader } from "https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// ========== Setup for TOM ==========
const tomCanvas = document.getElementById("model-canvas");
const tomScene = new THREE.Scene();
const tomCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
tomCamera.position.set(0, 1.5, 6);
const tomRenderer = new THREE.WebGLRenderer({
  canvas: tomCanvas,
  alpha: true,
  antialias: true,
});
tomRenderer.setSize(tomCanvas.clientWidth, tomCanvas.clientHeight);
tomRenderer.setPixelRatio(window.devicePixelRatio);

const tomControls = new OrbitControls(tomCamera, tomRenderer.domElement);
tomControls.enableZoom = false;
tomControls.enablePan = false;
tomControls.enableRotate = true;

const tomAmbient = new THREE.AmbientLight(0xffffff, 1.2);
tomScene.add(tomAmbient);
const tomDirLight = new THREE.DirectionalLight(0xffffff, 1);
tomDirLight.position.set(3, 10, 5);
tomScene.add(tomDirLight);

// Load Tom model
const tomLoader = new GLTFLoader();
tomLoader.load("./assets/tom.glb", (gltf) => {
  const model = gltf.scene;
  model.scale.set(0.3, 0.3, 0.3);
  model.position.y = -2;
  model.traverse((node) => node.isMesh && (node.castShadow = true));
  tomScene.add(model);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.6;
  ground.receiveShadow = true;
  tomScene.add(ground);

  animateTom();
});

function animateTom() {
  requestAnimationFrame(animateTom);
  tomControls.update();
  tomRenderer.render(tomScene, tomCamera);
}

// ========== Setup for BURGER ==========
const burgerCanvas = document.getElementById("burger-canvas");
const burgerScene = new THREE.Scene();
const burgerCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
burgerCamera.position.set(0, 1, 5);
const burgerRenderer = new THREE.WebGLRenderer({
  canvas: burgerCanvas,
  alpha: true,
  antialias: true,
});
burgerRenderer.setSize(burgerCanvas.clientWidth, burgerCanvas.clientHeight);
burgerRenderer.setPixelRatio(window.devicePixelRatio);

const burgerControls = new OrbitControls(
  burgerCamera,
  burgerRenderer.domElement
);
burgerControls.enableZoom = false;
burgerControls.enablePan = false;
burgerControls.enableRotate = true;

const burgerLight = new THREE.AmbientLight(0xffffff, 1.2);
burgerScene.add(burgerLight);

// Load Burger model
const burgerLoader = new GLTFLoader();
burgerLoader.load("./assets/burger.glb", (gltf) => {
  const burger = gltf.scene;
  burger.scale.set(0.9, 0.9, 0.9);
  burger.position.y = -1.5;
  burger.traverse((node) => node.isMesh && (node.castShadow = true));
  burgerScene.add(burger);

  animateBurger();
});

function animateBurger() {
  requestAnimationFrame(animateBurger);
  burgerControls.update();
  burgerRenderer.render(burgerScene, burgerCamera);
}
