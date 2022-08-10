/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
import { defineConfig } from 'vite';
const { createVuePlugin } = require('vite-plugin-vue2');
import { default as apps } from "./micro-apps.json";
// import commonjs from '@rollup/plugin-commonjs';
// import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [createVuePlugin()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "portail": "index.html",
        ...Object.keys(apps).reduce((obj, item) => {
          const key = item.toString();
          obj[key] = apps[key].toString();
          return obj;
        }, {})
      }
    }
  },
  // optimizeDeps: {
  //   include: ["vue-places"],
  //   esbuildOptions: {
  //     plugins: [
  //       esbuildCommonjs(["vue-places"])
  //     ]
  //   }
  // }
});


// const { defineConfig } = require('@vue/cli-service')
// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
  // transpileDependencies: [
    // 'vuetify'
  // ]
// })