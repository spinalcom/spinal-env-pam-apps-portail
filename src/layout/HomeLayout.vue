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
  <v-container class="homeContainer"
               fluid>
    <div class="header">
      <div class="nav">
        <NavBar />
      </div>

      <div class="select">
        <select-component @selected="changeApps"></select-component>
      </div>

    </div>

    <router-view class="content"></router-view>

  </v-container>

</template>
<script>
import { mapActions, mapState } from "vuex";
import NavBar from "../components/nav.vue";
import SelectComponent from "../components/select.vue";
export default {
  components: {
    NavBar,
    SelectComponent,
  },
  async mounted() {
    await this.init();
  },
  methods: {
    ...mapActions("appDataStore", [
      "getApps",
      "getBos",
      "getUserInfo",
      "selectSpace",
    ]),

    init() {
      return Promise.all([this.getApps(), this.getBos(), this.getUserInfo()]);
    },

    changeApps(selectedId) {
      this.selectSpace(selectedId);
    },
  },
  computed: {
    ...mapState("appDataStore", ["appsDisplayed", "userInfo"]),
  },
};
</script>
<style scoped>
.homeContainer {
  width: 100%;
  height: 100%;
  padding: 0px;
}

.homeContainer .header {
  width: 100%;
  height: 70px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.homeContainer .header .nav {
  width: 40%;
  height: 100%;
  display: flex;
  align-items: center;
}

.homeContainer .header .select {
  width: 500px;
  height: 100%;
  display: flex;
  margin: 5px;
  justify-content: flex-end;
  align-items: center;
}

.homeContainer .content {
  width: 100%;
  padding: 0 10px;
  height: calc(100vh - 80px);
  max-height: calc(100vh - 80px);
}
</style>