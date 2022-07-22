/*
 * @Author: luofei luofei@trunk.tech
 * @Date: 2022-07-22 14:13:05
 * @LastEditors: luofei luofei@trunk.tech
 * @LastEditTime: 2022-07-22 18:01:14
 * @FilePath: /MapSets/src/utils/mapTools.js
 * @Description: maptools 地图工具
 *
 * Copyright (c) 2022 by 北京主线科技有限公司京ICP备19025226号-1, All Rights Reserved.
 */
import * as utm from "utm";
import { polygon } from "@turf/turf";

// UTM坐标转换参数
const utmOptions = {
    zoneNum: 50,
    zoneLetter: "S",
};
/**
 * @description: 经纬度转UTM坐标
 * @param {*} point
 * @return {*}
 */
const fromLatLon = (point) => {
    const res = utm.fromLatLon(point.y, point.x, utmOptions.zoneNum);
    return {
        point: {
            x: res.easting,
            y: res.northing,
        },
        zoneNum: res.zoneNum,
        zoneLetter: res.zoneLetter,
    };
};
/**
 * @description: UTM坐标转换为经纬度
 * @param {*} point
 * @return {*}
 */
const toLatLon = (point) => {
    const res = utm.toLatLon(
        point.x,
        point.y,
        utmOptions.zoneNum,
        utmOptions.zoneLetter
    );
    return {
        point: {
            x: res.longitude,
            y: res.latitude,
        },
    };
};

/**
 * @description: 包络计算
 * @param {*} options
 * @return {*}
 * todo 待完善
 * ! 注意：只适合UTM坐标系使用
 */
const calcPoints = (options) => {
    let { width, height, point, yaw } = options;
    console.log(width, height, point, yaw);
    let x = point.x;
    let y = point.y;
    // yaw 旋转90度
    let xo = Math.cos(yaw);
    let yo = Math.sin(yaw);
    let y1 = x + (height / 2) * yo;
    let x1 = y - (height / 2) * xo;
    let y2 = x - (height / 2) * yo;
    let x2 = y + (height / 2) * xo;
    // return [
    //     [y1 - (width / 2) * xo, x1 - (width / 2) * yo],
    //     [y2 - (width / 2) * xo, x2 - (width / 2) * yo],
    //     [y2 + (width / 2) * xo, x2 + (width / 2) * yo],
    //     [y1 + (width / 2) * xo, x1 + (width / 2) * yo],
    // ];
    const p1 = toLatLon({
            x: y1 - (width / 2) * xo,
            y: x1 - (width / 2) * yo,
        }).point,
        p2 = toLatLon({
            x: y2 - (width / 2) * xo,
            y: x2 - (width / 2) * yo,
        }).point,
        p3 = toLatLon({
            x: y2 + (width / 2) * xo,
            y: x2 + (width / 2) * yo,
        }).point,
        p4 = toLatLon({
            x: y1 + (width / 2) * xo,
            y: x1 + (width / 2) * yo,
        }).point;
    return [
        [
            [p1.x, p1.y],
            [p2.x, p2.y],
            [p3.x, p3.y],
            [p4.x, p4.y],
            [p1.x, p1.y],
        ],
    ];
};

const polygonData = calcPoints({
    width: 10,
    height: 1,
    point: { x: 502608.11789596087, y: 4363792.687264067 },
    yaw: 1,
});
export { fromLatLon, toLatLon, calcPoints, polygonData };
