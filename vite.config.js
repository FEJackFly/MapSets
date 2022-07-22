/*
 * @Author: luofei luofei@trunk.tech
 * @Date: 2022-05-30 10:34:31
 * @LastEditors: luofei luofei@trunk.tech
 * @LastEditTime: 2022-07-20 11:14:24
 * @FilePath: /MapSets/vite.config.js
 * @Description:
 *
 * Copyright (c) 2022 by 北京主线科技有限公司京ICP备19025226号-1, All Rights Reserved.
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [vue()],
    server: {
        host: true,
    },
});
