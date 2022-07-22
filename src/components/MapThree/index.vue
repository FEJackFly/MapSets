<script setup>
import { onMounted, onUnmounted } from "vue";
import * as Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 解压缩
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
onMounted(() => {
  init();
});
onUnmounted(() => {});
const state = {
  scene: null,
  camera: null,
  renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
  controls: null,
  events: {
    ifEdit: true,
  },
};
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const init = () => {
  // 初始化
  //   const ele = document.getElementById("map");
  //   console.log(ele);
  //   const scene = new THREE.Scene();
  //   const camera = new THREE.PerspectiveCamera(
  //     75,
  //     window.innerWidth / window.innerHeight,
  //     0.1,
  //     1000
  //   );
  //   const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  //   ele.appendChild(renderer.domElement);
  //   const geometry = new THREE.BoxGeometry();
  //   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  //   const cube = new THREE.Mesh(geometry, material);
  //   scene.add(cube);
  //   camera.position.z = 5;
  //   const light = new THREE.AmbientLight("#00000"); // soft white light
  //   scene.add(light);
  //   // Instantiate a loader
  //   const loader = new GLTFLoader();
  //   // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  //   const dracoLoader = new DRACOLoader();
  //   dracoLoader.setDecoderPath(
  //     "../../../node_modules/three/examples/js/libs/draco/"
  //   );
  //   loader.setDRACOLoader(dracoLoader);
  //   // Load a glTF resource
  //   loader.load(
  //     // resource URL
  //     "glb/head.glb",
  //     // called when the resource is loaded
  //     function (gltf) {
  //       const pointLight = new THREE.PointLight("write", 10, 1000);
  //       pointLight.position.set(0, 50, 0);
  //       gltf.scene.add(pointLight);
  //       scene.add(gltf.scene);
  //     },
  //     // called while loading is progressing
  //     function (xhr) {
  //       console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //     },
  //     // called when loading has errors
  //     function (error) {
  //       console.log("An error happened");
  //     }
  //   );
  //   const controls = new OrbitControls(camera, renderer.domElement);
  //   function animate() {
  //     requestAnimationFrame(animate);
  //     cube.rotation.x += 0.01;
  //     cube.rotation.y += 0.01;
  //     controls.update();
  //     stats.update();
  //     renderer.render(scene, camera);
  //   }
  //   animate();
  initScene();
};

const initScene = () => {
  // 初始化场景
  state.scene = new THREE.Scene();
  state.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  state.camera.position.z = 5;
  const light = new THREE.AmbientLight("#000000"); // soft white light
  state.scene.add(light);
  state.controls = new OrbitControls(state.camera, state.renderer.domElement);
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  const ele = document.getElementById("map");
  ele.appendChild(state.renderer.domElement);
  animate();
  addCube(state.scene);
  addGlb(state.scene);
};

const addCube = (scene) => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
};

const addGlb = (scene) => {
  const loader = new GLTFLoader();
  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "../../../node_modules/three/examples/js/libs/draco/"
  );
  loader.setDRACOLoader(dracoLoader);
  // Load a glTF resource
  loader.load(
    // resource URL
    "glb/head.glb",
    // called when the resource is loaded
    function (gltf) {
      const pointLight = new THREE.PointLight("write", 10, 1000);
      pointLight.position.set(0, 50, 0);
      gltf.scene.add(pointLight);
      scene.add(gltf.scene);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );
};
// 动画
const animate = () => {
  stats.update();
  state.renderer.render(state.scene, state.camera);
  requestAnimationFrame(animate);
};
</script>

<template>
  <div id="map"></div>
</template>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
