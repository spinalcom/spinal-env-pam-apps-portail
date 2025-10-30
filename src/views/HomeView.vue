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
  <ApplicationPage :isMobile="isMobile" v-if="isAdministration" />

  <div v-else-if="isPortofolio" class="appContainer">

    <v-tabs v-model="tabs" grow>
      <v-tab>
        <v-icon left>mdi-map-marker-radius</v-icon>
        Maps
      </v-tab>

      <v-tab>
        <v-icon left>mdi-apps</v-icon>
        Applications
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tabs">

      <v-tab-item>
        <!-- <MapComponent :markers="markers" /> -->
        <PortofolioView :portofolioSelected="spaceSelected" @openBosConfig="goToBosConfig" />
      </v-tab-item>

      <v-tab-item>
        <ApplicationPage :isMobile="isMobile" />
      </v-tab-item>

    </v-tabs-items>

  </div>

  <!-- 
    <div v-else class="appContainer">
    <v-card class="detail pa-5 mb-6" rounded="xl" elevation="1">

      <ValueCard icon="mdi-plus" title="hello" value="10000" />

    </v-card>

    <div class="map">
      <MapComponent :markers="markers" />
    </div>

  </div> -->

</template>

<script>
import Vue from "vue";
import ApplicationPage from "./AppsPage.vue";
import { mapState, mapActions } from "vuex";
// import MapComponent from "../components/map.vue";
import ValueCard from '../components/value_card.vue'
import PortofolioView from "../components/PortofolioView.vue";
import { goToBosConfigPortail } from "../requests/building";

export default Vue.extend({
  name: "Home",
  components: {
    ApplicationPage,
    // MapComponent,
    PortofolioView,
    ValueCard
  },
  props: {
    isMobile: {},
  },

  data() {

    return {
      tabs: null,
    };
  },

  methods: {

    goToBosConfig({ buildingId }) {
      goToBosConfigPortail(buildingId);
    }
  },
  computed: {
    ...mapState("appDataStore", ["spaceSelected"]),
    isAdministration() {
      return this.spaceSelected && this.spaceSelected.type.toLowerCase() === "administration";
    },

    isPortofolio() {
      return this.spaceSelected && this.spaceSelected.type.toLowerCase() === "portofolio";
    },

    markers() {
      const buildings = this.isPortofolio ? this.spaceSelected.buildings : [this.spaceSelected];

      return buildings.map((building) => ({
        lat: building?.location?.lat,
        lng: building?.location?.lng,
      }));
    },

  },
  watch: {
    spaceSelected() {
      const type = this.spaceSelected.type;
      console.log("type", this.spaceSelected);
      // switch (type.toLowerCase()) {
      //   case "administration":
      //     this.items = [this.tabsItems.Application];
      //     break;
      //   case "portofolio":
      //     console.log("portofolio", this.spaceSelected);
      //     break;
      //   default:
      //     this.items = [this.tabsItems.Maps];
      //     break;
      // }
    }
  },
});
</script>

<style scoped>
.appContainer {
  width: 100%;
  height: 100%;
}

.appContainer .detail {
  width: 100%;
  height: 100px;
}

.appContainer .map {
  width: 100%;
  height: calc(100% - 100px);
}
</style>

<style lang="scss">
.theme--light.v-tabs-items {
  width: 100%;
  height: calc(100% - 70px);
  background-color: transparent;
}

.v-window-item.v-window-item--active {
  width: 100%;
  height: 100%;
}

.v-window__container {
  width: 100%;
  height: 100%;
}
</style>
