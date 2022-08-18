<!--
Copyright 2022 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <v-container class="appContainer" fluid>
    <div class="navbar">
      <NavBar />
    </div>

    <!-- <iframe  -->
    <iframe v-if="appPath" class="iframeContainer" :src="appPath"></iframe>

    <div v-else class="iframeContainer notFoundDiv">
      <h1 class="code">404</h1>
      <h1>No app found for {{ appSelected.name }}</h1>
    </div>
  </v-container>
</template>

<script>
import NavBar from "../components/nav.vue";
import { getAppById } from "../requests/userData";
import { default as apps } from "../../.config_env/apps.json";
import { SET_SELECTED_APP } from "../store/appDataStore";


export default {
  components: {
    NavBar,
  },
  data() {
    return {
      appSelected: {},
      appPath: undefined,
    };
  },
  async mounted() {
    this.appSelected = await this.getAppInfo();
    this.appPath = this.getAppPath();
    this.$store.commit(`appDataStore/${SET_SELECTED_APP}`, this.appSelected);
  },

  methods: {
    getAppInfo() {
      const { query, params } = this.$route;
      const appId = query.id;

      if (params.id && params.id === appId) return Promise.resolve(params);
      return getAppById(appId);
    },
    getAppPath() {
      const entry = apps[this.appSelected.name];
      return entry;
    },
  },
};
</script>
<style scoped>
.appContainer {
  width: 100%;
  height: 99%;
  padding: 0px;
  /* background: red; */
}

.appContainer .iframeContainer {
  width: 100%;
  height: 100%;
  /* background: yellow; */
}

.appContainer .iframeContainer.notFoundDiv {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.appContainer .iframeContainer.notFoundDiv .code {
  font-size: 5em;
}

.appContainer .navbar {
  width: 450px;
  height: 60px;
  position: absolute;
  top: 5px;
  left: 0px;
}
</style>