import * as THREE from "https://unpkg.com/three@0.176.0/build/three.module.js";
import { ARButton } from "https://unpkg.com/three@0.176.0/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "https://unpkg.com/three@0.176.0/examples/jsm/loaders/GLTFLoader.js";

let camera, scene, renderer;
let reticle;
let controller;

init();
animate();

function init() {

// SCENE INITIALISATION
  scene = new THREE.Scene();

// ##### LIGHTNING START ####
// Soften the hemisphere light
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(light);

// Adjust directional light and position it slightly
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// ##### LIGHTNING END ####

// ##### CAMERA START ####
// Set the camera position and orientation
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  // ##### CAMERA END ####

  // ##### RENDERER START ####
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(
    ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
    })
  );
  // ##### RENDERER END ####

  

  const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x0fff00 });
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  controller = renderer.xr.getController(0);//
  controller.addEventListener("select", onSelect);
  scene.add(controller);
}

function onSelect() {
  if (reticle.visible) {
    // const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // const material = new THREE.MeshPhongMaterial({
    //   color: 0xffffff * Math.random(),
    // });
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.setFromMatrixPosition(reticle.matrix);
    // mesh.scale.y = Math.random() * 2 + 1;
    // scene.add(mesh);

    const loader = new GLTFLoader();
    loader.load(
      "test.gltf",
      function (gltf) {
        const model = gltf.scene;
        model.position.setFromMatrixPosition(reticle.matrix);
        scene.add(model);
      },
      undefined,
      function (error) {
        console.error("An error happened while loading the model:", error);
      }
    );

  }
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
if (frame && hitTestSource) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const hitTestResults = frame.getHitTestResults(hitTestSource);

    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(referenceSpace);
      const matrix = pose.transform.matrix;

      reticle.visible = true;
      reticle.matrix.fromArray(matrix);

      // Move box with reticle
      box.visible = true;
      box.position.setFromMatrixPosition(reticle.matrix);
    } else {
      reticle.visible = false;
      box.visible = false;
    }
  }

  renderer.render(scene, camera);
}

let hitTestSource = null;
let hitTestSourceRequested = false;
