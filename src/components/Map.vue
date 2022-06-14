<script setup>
import { onMounted, onUnmounted } from "vue";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl";
import { GeoJSONVectorTileLayer } from "@maptalks/vt";
import { GLTFMarker, GLTFLayer } from "@maptalks/gltf-layer";
import { TransformControl } from "@maptalks/transform-control";
import "@maptalks/transcoders.draco";
import Stats from "stats.js";
import TWEEN from "@tweenjs/tween.js";

import data from "../../public/map.json";

const state = {
  map: null,
  events: {
    ifEdit: true,
    isAddModule: false,
  },
};
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const init = () => {
  // 初始化
  const map = initMap();
  const groupGLLayer = map.getLayer("groupGLLayer");
  initEvents(map, groupGLLayer);
  state.map = map;
  animate();
  setWeater(groupGLLayer);
};
const initMap = () => {
  const map = maptalks.Map.fromJSON("map", data);

  return map;
};
const initEvents = (map, groupGLLayer) => {
  // 模型操作
  const transformControl = new TransformControl();
  transformControl.addTo(map);
  transformControl.on("transforming", (e) => {
    const target = transformControl.getTransformTarget();
    target.setTRS(e.translate, e.rotation, e.scale);
  });

  transformControl.on("transformend", (e) => {
    console.log("操控模型完成事件");
  });

  const gltfLayer = groupGLLayer.getLayer("gltfs");

  map.on("dom:click", (e) => {
    if (state.events.ifEdit) {
      const identifyData = e.coordinate
        ? groupGLLayer.identify(e.coordinate, {
            layers: [gltfLayer],
            orderByCamera: true,
          })[0]
        : groupGLLayer.identifyAtPoint(e.containerPoint, {
            layers: [gltfLayer],
            orderByCamera: true,
          })[0];
      const target = identifyData && identifyData.data;
      if (target) {
        transformControl.enable();
        transformControl.transform(target);
      } else {
        transformControl.disable();
        console.log("非编辑", e);
        if (state.events.isAddModule) {
          const gltfMarker = new GLTFMarker(e.coordinate, {
            symbol: {
              url: "glb/head.glb",
            },
          });
          gltfMarker.addTo(gltfLayer);
          state.events.isAddModule = false;
        }
      }
    }
  });
};
onMounted(() => {
  init();

  // demo();
});
onUnmounted(() => {
  state.map.remove();
});

let num = 0;
// 动画
const animate = () => {
  stats.update();
  num += 0.5;
  // state.map.setBearing(num);
  TWEEN.update();
  requestAnimationFrame(animate);
};

// 插帧
const tween = () => {
  const coords = { x: 116.90215552606446, y: 39.58353646081784 }; // Start at (0, 0)
  const tween = new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
    .to({ x: 116.90396874747432, y: 39.58049385041008 }, 50000) // Move to (300, 200) in 1 second.
    // .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(() => {
      // Called after tween.js updates 'coords'.
      // Move 'box' to the position described by 'coords' with a CSS translation.
      const groupGLLayer = state.map.getLayer("groupGLLayer");
      if (groupGLLayer) {
        state.map.setCenter(coords);
        state.map
          .getLayer("groupGLLayer")
          .getLayer("gltfs")
          .getGeometryById("car")
          .setCoordinates(coords);
      }
    });
  tween.start(); // Start the tween immediately.
};

const setWeater = (groupGLLayer) => {
  const sceneConfig = groupGLLayer.getSceneConfig();
  console.log(sceneConfig);
  // const weather = {
  //   enable: true,
  //   fog: {
  //     enable: true,
  //     start: 0.1,
  //     end: 100,
  //     color: [0.9, 0.9, 0.9],
  //   },
  //   snow: {
  //     enable: true,
  //     snowGroundTexture: "/weather/perlin.png",
  //   },
  // };

  // 雨天设置报错 雪天正常
  const weather = {
    enable: true,
    fog: {
      enable: true,
      start: 0.1,
      end: 100,
      color: [0.9, 0.9, 0.9],
    },
    rain: {
      enable: true,
      density: 2000,
      windDirectionX: 0,
      windDirectionY: 0,
      rainTexture: "/weather/rain.png",
    },
  };
  sceneConfig.weather = weather;
  groupGLLayer.setSceneConfig(sceneConfig);
};
// 不使用json 可以正常设置天气
const demo = () => {
  const map = new maptalks.Map("map", {
    center: [-0.12416643731910426, 51.52260565445428],
    zoom: 14,
    pitch: 80,
    bearing: 210,
    lights: {
      ambient: {
        resource: {
          url: "/hdr/env.hdr",
        },
        color: [1, 1, 1],
        exposure: 1,
      },
      directional: {
        color: [1, 1, 1],
        lightColorIntensity: 5000,
        direction: [1, -0.4, -1],
      },
    },
  });

  const sceneConfig = {
    environment: { enable: true, mode: 1, level: 1, brightness: 1 },
    shadow: { enable: true, opacity: 0.5, color: [0, 0, 0] },
    postProcess: {
      enable: true,
      antialias: { enable: false },
      ssr: { enable: false },
      bloom: { enable: false },
      outline: { enable: false },
    },
    ground: {
      enable: true,
      renderPlugin: { type: "lit" },
      symbol: {
        polygonOpacity: 1,
        material: {
          baseColorFactor: [0.48235, 0.48235, 0.48235, 1],
          hsv: [0, 0, -0.532],
          roughnessFactor: 0.22,
          metallicFactor: 0.58,
        },
      },
    },
  };

  const weather = {
    enable: true,
    fog: {
      enable: true,
      start: 0.1,
      end: 100,
      color: [0.9, 0.9, 0.9],
    },
    rain: {
      enable: true,
      density: 200,
      windDirectionX: 0.2,
      windDirectionY: 0.2,
      rainTexture: "/weather/rain.png",
    },
  };
  sceneConfig.weather = weather;
  const groupGLLayer = new GroupGLLayer("gl", [], {
    sceneConfig,
  }).addTo(map);
  state.map = map;
  animate();
};
</script>

<template>
  <div id="map"></div>
  <div id="tool">
    <button v-on:click="state.events.isAddModule = true">添加模型</button>
  </div>
</template>

<style scoped lang="less">
#map {
  width: 100%;
  height: 100%;
  background: #11142a;
}
#tool {
  width: 100%;
  height: 50px;
  position: fixed;
  top: 0px;
  background: #11142a;
  button {
    float: right;
  }
}
</style>
