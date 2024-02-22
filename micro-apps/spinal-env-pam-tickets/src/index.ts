/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import "./polyfills";
import { SpinalAPI } from "./services/spinalAPI/SpinalAPI";

SpinalAPI.getInstance(process.env.SPINAL_API_URL);
import Vue from "vue";
import App from "./App.vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

import { store } from "./services/store";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

import colors from "vuetify/lib/util/colors";
import "@mdi/font/css/materialdesignicons.css";

import SpinalComponents from "spinal-components";
import "spinal-components/dist/spinal-components.css";
import "../../../assets/scss/style.scss";

Vue.use(SpinalComponents, {});

Vue.use(FloatingVue);
Vue.use(Vuetify);
const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.red.darken1, // #E53935
        secondary: colors.red.lighten4, // #FFCDD2
        accent: colors.blueGrey.darken1, // #3F51B5 blue-grey darken-1
        good: colors.teal.accent3, // #1DE9B6
        moderate: colors.yellow.lighten1, // #FFEE58
        unhealthy: colors.orange.lighten1, // #FFA726
        hazardous: colors.red.accent3, // #FF1744
        semiTransparent: colors.red.accent3, // FF1744
      },
    },
  },
  icons: {
    iconfont: "mdi",
  },
});
// import './css/basic/main.less';
// import './css/basic/reset.css';
// import './css/component/navPickerApp.less';

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
