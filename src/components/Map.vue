<!--
 * @Author: luofei luofei@trunk.tech
 * @Date: 2022-06-16 16:12:58
 * @LastEditors: luofei luofei@trunk.tech
 * @LastEditTime: 2022-07-22 18:39:15
 * @FilePath: /MapSets/src/components/Map.vue
 * @Description:
 *
 * Copyright (c) 2022 by 北京主线科技有限公司京ICP备19025226号-1, All Rights Reserved.
-->
<script setup>
import { onMounted, onUnmounted } from "vue";
import * as maptalks from "maptalks";
import "../../node_modules/maptalks/dist/maptalks.css";
import {
    GroupGLLayer,
    GeoJSONVectorTileLayer,
    VectorTileLayer,
    PolygonLayer,
    GLTFMarker,
    GLTFLayer,
    TransformControl,
} from "@maptalks/gl-layers";
import "@maptalks/transcoders.draco";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";
import {
    bezierSpline,
    bearing,
    degreesToRadians,
    point,
    randomPolygon,
    transformRotate,
} from "@turf/turf";
import Stats from "stats.js";
import TWEEN from "@tweenjs/tween.js";
import data from "../../public/map.json";
import axios from "axios";

import { calcPoints, fromLatLon } from "../utils/mapTools.js";
const state = {
    map: null,
    groupGLLayer: null,
    threeLayer: null,
    events: {
        ifEdit: true,
        isAddModule: false,
        weatherEnable: false,
    },
};
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

onMounted(() => {
    init();
});
onUnmounted(() => {
    state.map.remove();
});
/**
 * @description: 初始化
 * @return {*}
 */
const init = () => {
    const map = initMap();
    const groupGLLayer = map.getLayer("groupGLLayer");
    const geojsonMap = groupGLLayer.getLayer("geojsonMap");

    axios({
        method: "get",
        url: geojsonMap.options.data,
        responseType: "json",
    }).then((res) => {
        console.log(res);
    });
    state.map = map;
    state.groupGLLayer = groupGLLayer;
    initEvents(map, groupGLLayer);
    // initGeojsonMap(groupGLLayer);
    initThreeLayer(groupGLLayer);
    animate();
};
/**
 * @description: 初始化
 * @return {*}
 */
const initMap = () => {
    const map = maptalks.Map.fromJSON("map", data);

    return map;
};
/**
 * @description: 初始化地图事件
 * @param {*} map
 * @param {*} groupGLLayer
 * @return {*}
 */
const initEvents = (map, groupGLLayer) => {
    // 画图工具
    initDraw(map, groupGLLayer);

    // 模型操作
    const transformControl = new TransformControl();
    transformControl.addTo(map);
    transformControl.on("transforming", (e) => {
        const target = transformControl.getTransformTarget();
        target.setTRS(e.translate, e.rotation, e.scale, e.coordinates);
    });

    transformControl.on("transformend", (e) => {});

    const gltfLayer = groupGLLayer.getLayer("gltfs");
    const vectorLayer = groupGLLayer.getLayer("vector");
    const drawLayer = map.getLayer("vector");

    map.on("click", (e) => {
        console.log(fromLatLon(e.coordinate).point);

        const polygon = new maptalks.Polygon(
            calcPoints({
                width: 10,
                height: 20,
                point: fromLatLon(e.coordinate).point,
                yaw: 1,
            }),
            {
                symbol: {
                    fill: "#ff0000",
                    "fill-opacity": 0.5,
                    "line-color": "#ff0000",
                    "line-width": 2,
                },
            }
        );
        console.log(polygon);
        polygon.addTo(drawLayer);
        //范围检测
        // map.identify(
        //     {
        //         coordinate: e.coordinate,
        //         layers: [drawLayer],
        //     },
        //     (geos) => {
        //         if (geos.length == 0 && drawLayer) {
        //             const geometrys = drawLayer.getGeometries();
        //             if (geometrys.length > 0) {
        //                 geometrys.forEach((geometry) => {
        //                     geometry.endEdit();
        //                 });
        //             }
        //         } else {
        //             geos[0].startEdit();
        //             map.setPitch(0);
        //         }
        //     }
        // );
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
                if (target.feature?.geometry.type == "LineString") return;

                target.setCoordinates(e.coordinate);
                target.setSymbol({
                    ...target.getSymbol(),
                    translation: [0, 0, 0],
                });
                transformControl.enable();
                transformControl.transform(target);
            } else {
                transformControl.disable();

                if (state.events.isAddModule) {
                    const gltfMarker = new GLTFMarker(e.coordinate, {
                        symbol: {
                            url: "glb/head.glb",
                            shadow: true,
                        },
                    });
                    gltfMarker.addTo(gltfLayer);
                    state.events.isAddModule = false;
                }
            }
        }
    });

    // 全局键盘事件绑定
    document.onkeydown = (e) => {
        const vectorLayer = map.getLayer("vector");

        const geometrys = vectorLayer.getGeometries();
        console.log(n);
        geometrys.forEach((geometry) => {
            geometry.remove();
            if (e.key == "w") {
                const json = transformRotate(geometry.toGeoJSON(), 1);
                maptalks.GeoJSON.toGeometry(json).addTo(vectorLayer);
            }
            if (e.key == "s") {
                const json = transformRotate(geometry.toGeoJSON(), -1);
                maptalks.GeoJSON.toGeometry(json).addTo(vectorLayer);
            }
        });
    };
};

/**
 * @description: 初始化three图层
 * @return {*}
 */
const initThreeLayer = (groupGLLayer) => {
    const threeLayer = new ThreeLayer("threelayer", {
        identifyCountOnEvent: 1,
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
    });
    threeLayer.prepareToDraw = function (gl, scene, camera) {
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, -10, 10).normalize();
        scene.add(light);
        scene.add(new THREE.AmbientLight("#fff", 0.5));
    };
    threeLayer.addTo(groupGLLayer);
    state.threeLayer = threeLayer;
};
/**
 * @description:  初始化Geojson地图
 * @param {*} groupGLLayer
 * @return {*}
 */
const initGeojsonMap = (groupGLLayer) => {
    const pointLayer = groupGLLayer.getLayer("map_point");
    const lineLayer = groupGLLayer.getLayer("map_line");
    const polygonLayer = groupGLLayer.getLayer("map_polygon");
    cdMap.features.forEach((item) => {
        switch (item.geometry.type) {
            case "Point":
                pointLayer.addGeometry(item.geometry);
                break;
            case "LineString":
                lineLayer.addGeometry(item.geometry);
                break;
            case "Polygon":
                polygonLayer.addGeometry(item.geometry);
                break;
            default:
                break;
        }
    });
};

const addPolygon = () => {
    const { map, groupGLLayer, threeLayer } = state;
    const vectorLayer = groupGLLayer.getLayer("vector");
    const bbox = map.getExtent();
    const polygongeojson = randomPolygon(1000, {
        bbox: [bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax],
        max_radial_length: 0.001,
        num_vertices: 4,
    });
    const polygon = maptalks.GeoJSON.toGeometry(polygongeojson);
    const material = new THREE.MeshBasicMaterial({
        color: "#4CCDFF",
        transparent: true,
        opacity: 0.6,
    });
    polygon.forEach((item) => {
        if (threeLayer) {
            const extrudePolygons = threeLayer.toExtrudePolygon(
                item,
                { topColor: "#fff", height: 100, interactive: false },
                material
            );

            threeLayer.addMesh(extrudePolygons);
        }
        // vectorLayer.addGeometry(item);
    });
};

/**
 * @description: 初始化画图工具
 * @return {*}

 */
const initDraw = (map, groupGLLayer) => {
    const drawLayer = map.getLayer("vector");
    const planIngLayer = groupGLLayer.getLayer("planningLine");
    const drawTool = new maptalks.DrawTool({
        mode: "Point",
    })
        .addTo(map)
        .disable();

    drawTool.on("drawend", function (param) {
        if (param.geometry.type == "LineString") {
            const line = param.geometry.toGeoJSON();
            const curved = bezierSpline(line, {
                resolution: 2500, //time in milliseconds between points
                sharpness: 1, //	a measure of how curvy the path should be between splines
            });
            let curverLine = maptalks.GeoJSON.toGeometry(curved);
            curverLine.setSymbol({
                lineBloom: true,
                lineCap: "butt",
                lineColor: [0.12, 0.56, 1, 1],
                lineGapWidth: 0,
                lineJoin: "round",
                lineOpacity: 1,
                lineWidth: 10,
                linePatternGap: 0,
            });
            planIngLayer.addGeometry(curverLine);
        } else {
            param.geometry.setSymbol({
                polygonFill: "red",
                polygonOpacity: 0.2,
                textName: "A",
                textFill: "red",
                textSzie: {
                    stops: [
                        [1, 0],
                        [12, 24],
                    ],
                },
            });
            param.geometry
                .on("mouseenter", function (e) {
                    //update markerFill to highlight
                    e.target.updateSymbol({
                        polygonFill: "#f00",
                    });
                })
                .on("mouseout", function (e) {
                    //reset color
                    e.target.updateSymbol({
                        polygonFill: "#0e595e",
                    });
                });
            drawLayer.addGeometry(param.geometry);
            param.geometry.config({
                draggable: true,
            });
            param.geometry.on("dragend", (e) => {});

            console.log(param.geometry);
            const { threeLayer } = state;
            if (threeLayer) {
                const material = new THREE.MeshBasicMaterial({
                    color: "#4CCDFF",
                    transparent: true,
                    opacity: 0.6,
                });
                const extrudePolygons = threeLayer.toExtrudePolygon(
                    param.geometry.toGeoJSON(),
                    { height: 10 },
                    material
                );
                threeLayer.addMesh(extrudePolygons);
            }
        }
        drawTool.disable();
    });

    const items = [
        "Point",
        "LineString",
        "Polygon",
        "Circle",
        "Ellipse",
        "Rectangle",
        "FreeHandLineString",
        "FreeHandPolygon",
    ].map(function (value) {
        return {
            item: value,
            click: function () {
                drawTool.setMode(value).enable();
            },
        };
    });
    const toolbar = new maptalks.control.Toolbar({
        position: "bottom-right",
        reverseMenu: true,
        items: [
            {
                item: "Shape",
                children: items,
                click: function () {
                    map.setPitch(0);
                },
            },
            {
                item: "Disable",
                click: function () {
                    drawTool.disable();
                },
            },
            {
                item: "Clear",
                click: function () {
                    drawLayer.clear();
                },
            },
        ],
    }).addTo(map);
};
/**
 * @description: 动画
 * @return {*}
 */
const animate = () => {
    stats.update();
    TWEEN.update();

    const { threeLayer } = state;
    if (threeLayer) {
        threeLayer._needsUpdate = !threeLayer._needsUpdate;
        if (threeLayer._needsUpdate && !threeLayer.isRendering()) {
            threeLayer.redraw();
        }
    }
    requestAnimationFrame(animate);
};
/**
 * @description: 动画补帧
 * @return {*}
 */
const tween = () => {
    const groupGLLayer = state.map.getLayer("groupGLLayer");
    const planIngLayer = groupGLLayer.getLayer("planningLine");
    const line = planIngLayer.getGeometries()[0].getCoordinates();
    console.log(line.length);
    let a = 0;
    line.forEach((item, i) => {
        i++;
        let time = 100;
        let coords = line[i]; // Start at (0, 0)

        if (coords) {
            a++;
            const tween = new TWEEN.Tween(item) // Create a new tween that modifies 'coords'.
                .to(coords, time) // Move to (300, 200) in 1 second.
                // .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
                .onUpdate((e) => {
                    // Called after tween.js updates 'coords'.
                    // Move 'box' to the position described by 'coords' with a CSS translation.
                    if (groupGLLayer) {
                        const car = groupGLLayer
                            .getLayer("gltfs")
                            .getGeometryById("car");

                        if (car) {
                            var point1 = point([
                                car.getCoordinates().x,
                                car.getCoordinates().y,
                            ]);
                            var point2 = point([coords.x, coords.y]);

                            var bearingnum = bearing(point2, point1);
                            let yaw = degreesToRadians(bearingnum);
                            if (bearingnum !== 0) {
                                let deg = (180 / Math.PI) * (Math.PI / 2 - yaw);
                                console.log(deg);
                                car.setCoordinates(coords);
                                car.setRotation([0, 0, deg]);
                                state.map.setCenter(coords);
                            }
                        } else {
                            let carMarker = new GLTFMarker(coords, {
                                id: "car",
                                symbol: {
                                    url: "glb/head.glb",
                                },
                            });
                            carMarker.addTo(groupGLLayer.getLayer("gltfs"));
                        }
                    }
                });
            tween.delay(i * time).start(); // Start the tween immediately.
        }
    });
    console.log(a);
    // 多线拆分
    // Get the vertices for each line.
    // var vertices = line.geometry.vertices;
    // // Specify the duration for each tween.
    // var duration = 500;
    // // Iterate through each vertex in the line, starting at 1.
    // for (var i = 1, len = vertices.length; i < len; i++) {
    //     // Set the position of the sphere to the previous vertex.
    //     sphere.position.copy(vertices[i - 1]);
    //     // Create the tween from the current sphere position to the current vertex.
    //     new TWEEN.Tween(sphere.position).to(vertices[i], duration).delay(i * duration).start();
    // }
    // const coords = { x: 117.06002705149763, y: 39.411335812920896 }; // Start at (0, 0)
    // const tween = new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
    //     .to({ x: 117.06692421157948, y: 39.40989524937308 }, 50000) // Move to (300, 200) in 1 second.
    //     // .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    //     .onUpdate(() => {
    //         // Called after tween.js updates 'coords'.
    //         // Move 'box' to the position described by 'coords' with a CSS translation.
    //         if (groupGLLayer) {
    //             state.map.setCenter(coords);
    //             // state.map
    //             //     .getLayer("groupGLLayer")
    //             //     .getLayer("gltfs")
    //             //     .getGeometryById("car")
    //             //     .setCoordinates(coords);
    //         }
    //     });
    // tween.start(); // Start the tween immediately.
};

/**
 * @description: 天气设置
 * @return {*}
 */
const setWeater = () => {
    const groupGLLayer = state.map.getLayer("groupGLLayer");
    const sceneConfig = groupGLLayer.getSceneConfig();
    state.events.weatherEnable = !state.events.weatherEnable;
    const weatherEnable = state.events.weatherEnable;
    sceneConfig.postProcess.bloom.enable = weatherEnable;

    const resources = {
        snow: {
            enable: weatherEnable,
            snowGroundTexture: "/weather/perlin.png",
        },
        rain: {
            enable: weatherEnable,
            density: 2000,
            windDirectionX: 0,
            windDirectionY: 0,
            rainTexture: "/weather/rain.png",
        },
    };

    const weather = {
        enable: weatherEnable,
        fog: {
            enable: weatherEnable,
            start: 0.1,
            end: 100,
            color: [0.38, 0, 0.5],
        },
        rain: {
            enable: weatherEnable,
            density: 2000,
            windDirectionX: 0,
            windDirectionY: 0,
            rainTexture: "/weather/rain.png",
        },
    };
    sceneConfig.weather = weather;
    console.log(sceneConfig);
    groupGLLayer.setSceneConfig(sceneConfig);
};

/**
 * @description: 地图导出
 * @return {*}
 */
const exportMap = () => {
    const map = state.map;
    const mapData = map.toJSON();
    const json = JSON.stringify(mapData);
    const blob = new Blob([json], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "map.json";
    a.click();
};
</script>

<template>
    <div id="map"></div>
    <div id="tool">
        <button v-on:click="state.events.isAddModule = true">添加模型</button>
        <button v-on:click="setWeater">天气设置</button>
        <button v-on:click="exportMap">导出地图</button>
        <button v-on:click="tween">运行</button>
        <button v-on:click="addPolygon">多边形</button>
    </div>
</template>

<style scoped lang="less">
#map {
    width: 100%;
    height: 100%;
    // background: #11142a;
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
