/*
 * @Author: luofei luofei@trunk.tech
 * @Date: 2022-05-30 10:34:31
 * @LastEditors: luofei luofei@trunk.tech
 * @LastEditTime: 2022-07-20 11:26:37
 * @FilePath: /MapSets/src/utils/MapLoader.js
 * @Description:
 *
 * Copyright (c) 2022 by 北京主线科技有限公司京ICP备19025226号-1, All Rights Reserved.
 */
import { onMounted, onUnmounted } from "vue";
import * as maptalks from "maptalks";
import "@maptalks/gl";
import "@maptalks/gltf-layer";
import * as Stats from "stats.js";
import "@maptalks/transcoders.draco";

import json from "../../public/mapUTM.json";

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
