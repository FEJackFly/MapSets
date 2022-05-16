import { onMounted, onUnmounted } from 'vue';
import * as maptalks from 'maptalks';
import '@maptalks/gl';
import '@maptalks/gltf-layer';
import * as Stats from 'stats.js';
import '@maptalks/transcoders.draco';

import json from '../../public/map.json';

class MapLoader {
  constructor(map) {
    this.map = map;
  }
  loadMap = (mapJson) => {
    const layerCopied = maptalks.Layer.fromJSON(json.layers[0].layers[0]);
    console.log(layerCopied);

    this.map.addLayer(layerCopied);
  };
}

export default MapLoader;
