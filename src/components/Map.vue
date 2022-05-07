<script setup>
import { onMounted, onUnmounted } from "vue";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl";
import { GLTFMarker, GLTFLayer } from "@maptalks/gltf-layer";
import { TransformControl } from "@maptalks/transform-control";

const state = {
  map: null,
  mapConfig: {
    center: [-0.113049, 51.498568],
    zoom: 14,
    pitch: 80,
    bearing: 180,
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
  },
  sceneConfig: {
    hitDetect: false,
    geometryEvents: false,
    sceneConfig: {
      environment: { enable: true, mode: 1, level: 1, brightness: 1 },
      shadow: { enable: true, opacity: 0.5, color: [0, 0, 0] },
      postProcess: {
        enable: true,
        antialias: { enable: true },
        ssr: { enable: true },
        bloom: { enable: true },
        outline: { enable: true },
        // ssao: {
        //   enable: true,
        // },
        sharpen: {
          enable: true,
        },
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
    },
  },
  events: {
    ifEdit: false,
  },
};
const init = () => {
  // 初始化
  const map = initMap();
  const groupGLLayer = initLayer();
  map.addLayer(groupGLLayer);
  initEvents(map, groupGLLayer);
  state.map = map;
};
const initMap = () => {
  const map = new maptalks.Map("map", state.mapConfig);

  return map;
};
const initLayer = () => {
  const url = "/glb/alien.glb";
  const symbol = {
    url: url,
    scale: [2, 2, 2],
  };
  const position = [-0.113049, 51.498568];

  const gltfLayer = new GLTFLayer("gltf", {
    hitDetect: false,
    geometryEvents: false,
  });
  const gltfMarker = new GLTFMarker(position, {
    symbol: symbol,
  });
  const gltfMarker1 = new GLTFMarker(position, {
    symbol: symbol,
  });
  gltfLayer.addGeometry([gltfMarker, gltfMarker1]);
  const groupGLLayer = new GroupGLLayer("gl", [gltfLayer], state.sceneConfig);
  return groupGLLayer;
};
const initEvents = (map, groupGLLayer) => {
  const transformControl = new TransformControl();
  transformControl.addTo(map);
  transformControl.on("transforming", (e) => {
    const target = transformControl.getTransformTarget();
    target.setTRS(e.translate, e.rotation, e.scale);
  });

  transformControl.on("transformend", (e) => {
    console.log("操控模型完成事件");
  });

  const gltfLayer = groupGLLayer.getLayer("gltf");

  map.on("click", (e) => {
    console.log(e);
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
      }
    }
  });
};
onMounted(() => {
  init();
});
onUnmounted(() => {
  state.map.remove();
});
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
