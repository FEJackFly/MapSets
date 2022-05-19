<script setup>
import { onMounted, onUnmounted } from "vue";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl";
import { GeoJSONVectorTileLayer } from "@maptalks/vt";
import { GLTFMarker, GLTFLayer } from "@maptalks/gltf-layer";
import { TransformControl } from "@maptalks/transform-control";
import * as Stats from "stats.js";
import "@maptalks/transcoders.draco";

import MapLoader from "../utils/MapLoader";
import data from "../../public/map.json";

const state = {
  map: null,
  events: {
    ifEdit: true,
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
};
const initMap = () => {
  const map = maptalks.Map.fromJSON("map", data);

  return map;
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
    console.log(state.map.toJSON());
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

let num = 0;
// 动画
const animate = () => {
  stats.update();
  num += 0.5;
  state.map.setBearing(num);

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
  background-color: rgb(24, 38, 81);
}
</style>
