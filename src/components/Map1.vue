<script setup>
import { onMounted, onUnmounted } from 'vue';
import * as maptalks from 'maptalks';
import { GroupGLLayer } from '@maptalks/gl';
import { GLTFMarker, GLTFLayer } from '@maptalks/gltf-layer';
import { TransformControl } from '@maptalks/transform-control';
import * as Stats from 'stats.js';
import '@maptalks/transcoders.draco';

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
  // state.map.setBearing(num);

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
