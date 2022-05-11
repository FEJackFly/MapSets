<script setup>
import { onMounted, onUnmounted } from 'vue';
import * as maptalks from 'maptalks';
import { GroupGLLayer } from '@maptalks/gl';
import { GLTFMarker, GLTFLayer } from '@maptalks/gltf-layer';
import { TransformControl } from '@maptalks/transform-control';
import * as Stats from 'stats.js';
import '@maptalks/transcoders.draco';

const state = {
  map: null,
  mapConfig: {
    center: [-0.113049, 51.498568],
    spatialReference: {},
    lights: {
      directional: {
        direction: [1, 0, -1],
        color: [1, 1, 1],
      },
      ambient: {
        resource: {
          url: '/hdr/env.hdr',
          sh: [
            0.24474610063681917, 0.32115384670346975, 0.40525010696354086,
            0.0204494374531686, 0.011639124894616857, 0.007904154556549333,
            0.04210623283538904, 0.028445546201752714, 0.01951303032759883,
            -0.01036706582884306, 0.0018392637833096377, 0.01630117798108209,
            -0.0017000197301937506, -0.0001370016800420307, 0.00118491874770844,
            -0.0058426257845160786, -0.004118263767397141,
            -0.0031268382092201137, 0.013117593095335462, 0.004496614935685468,
            -0.0003262775591732822, -0.041157476583825, 0.0010309220676732547,
            0.03982223069378102, -0.014053046452343603, -0.011277575549746541,
            -0.008628347725032457,
          ],
        },
        exposure: 1,
        hsv: [0, 0, 0],
        orientation: 0,
        prefilterCubeSize: 128,
      },
    },
    seamlessZoom: true,
    zoomable: true,
    draggable: true,
    renderable: true,
    zoom: 21.713569954192142,
    bearing: 154.80000000000018,
    pitch: 70.80000000000008,
  },
  sceneConfig: {
    environment: {
      enable: true,
      mode: 0,
      level: 0,
      brightness: 0,
    },
    shadow: {
      type: 'esm',
      enable: true,
      quality: 'high',
      opacity: 0.5,
      color: [0, 0, 0],
      blurOffset: 1,
    },
    postProcess: {
      enable: true,
      antialias: {
        enable: true,
        taa: true,
        jitterRatio: 0.25,
      },
      ssr: {
        enable: true,
      },
      bloom: {
        enable: true,
        threshold: 0,
        factor: 0.4,
        radius: 0.304,
      },
      ssao: {
        enable: true,
        bias: 0.08,
        radius: 0.08,
        intensity: 1.5,
      },
      sharpen: {
        enable: true,
        factor: 0.2,
      },
      outline: {
        enable: true,
        outlineFactor: 0.3,
        highlightFactor: 0.2,
        outlineWidth: 1,
        outlineColor: [1, 1, 0],
      },
    },
    ground: {
      enable: true,
      renderPlugin: {
        type: 'lit',
      },
      symbol: {
        polygonFill: [0.54, 0.54, 0.54, 1],
        polygonOpacity: 1,
        ssr: false,
        material: {
          baseColorTexture: null,
          baseColorFactor: [0, 0, 0, 1],
          hsv: [0, 0, 0],
          baseColorIntensity: 1,
          contrast: 1,
          outputSRGB: 1,
          metallicRoughnessTexture: null,
          roughnessFactor: 0.4,
          metallicFactor: 0,
          normalTexture: null,
          uvScale: [1, 1],
          uvOffset: [0, 0],
          uvRotation: 0,
          uvOffsetAnim: [0, 0],
          normalMapFactor: 1,
          normalMapFlipY: 0,
          clearCoatThickness: 5,
          clearCoatFactor: 0,
          clearCoatIor: 1.4,
          clearCoatRoughnessFactor: 0.04,
          occlusionTexture: null,
          emissiveTexture: null,
          emissiveFactor: [0, 0, 0],
          emitColorFactor: 1,
          emitMultiplicative: 0,
        },
      },
      extras: {
        currentMaterial: '',
      },
    },
  },
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
  const groupGLLayer = initLayer();
  map.addLayer(groupGLLayer);
  initEvents(map, groupGLLayer);
  state.map = map;
  animate();
};
const initMap = () => {
  const map = new maptalks.Map('map', state.mapConfig);

  return map;
};
const initLayer = () => {
  const url = '/glb/head.glb';
  const symbol = {
    url: url,
    scale: [2, 2, 2],
    shadow: true,
  };
  const position = [-0.113049, 51.498568];

  const gltfLayer = new GLTFLayer('gltf', {
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
  const groupGLLayer = new GroupGLLayer('gl', [gltfLayer], {
    sceneConfig: state.sceneConfig,
  });
  return groupGLLayer;
};
const initEvents = (map, groupGLLayer) => {
  const transformControl = new TransformControl();
  transformControl.addTo(map);
  transformControl.on('transforming', (e) => {
    const target = transformControl.getTransformTarget();
    target.setTRS(e.translate, e.rotation, e.scale);
  });

  transformControl.on('transformend', (e) => {
    console.log('操控模型完成事件');
  });

  const gltfLayer = groupGLLayer.getLayer('gltf');

  map.on('click', (e) => {
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
