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
  <div class="list_container">
    <div class="mapContainer">
      <Map :buildings="buildings" />
    </div>

    <div class="listContainer">
      <PortofolioView :portofolios="portofolios"
                      @createPortofolio="createPortofolio"
                      @editPortofolio="editPortofolio"
                      @deletePortofolio="deletePortofolio"
                      @addBuilding="addBuilding"
                      @editBuilding="editBuilding"
                      @deleteBuilding="deleteBuilding" />

    </div>
  </div>
</template>

<script lang="ts">
import { log } from "console";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { IBuilding, IPortofolio } from "../interfaces/IBuilding";
import Map from "./map/MapView.vue";
import PortofolioView from "./portofolio/PortofolioView.vue";

@Component({
  components: {
    Map,
    PortofolioView,
  },
})
class ListComponent extends Vue {
  async mounted() {
    await this.$store.dispatch("portofolioStore/getAllportofolio");
  }

  get portofolios(): IPortofolio[] {
    if (!this.$store.state.portofolioStore.portofolios) return [];

    return this.$store.state.portofolioStore.portofolios;
  }

  get buildings(): IBuilding[] {
    if (!this.$store.state.portofolioStore.portofolios) return [];

    return this.$store.state.portofolioStore.portofolios.reduce(
      (liste: IBuilding[], { buildings }: IPortofolio) => {
        liste.push(...buildings);
        return liste;
      },
      []
    );
  }

  createPortofolio(data) {
    this.$emit("createPortofolio", data);
  }

  editPortofolio(data) {
    this.$emit("editPortofolio", data);
  }

  deletePortofolio(data) {
    this.$emit("deletePortofolio", data);
  }

  addBuilding(data) {
    this.$emit("addBuilding", data);
  }

  editBuilding(data) {
    this.$emit("editBuilding", data);
  }

  deleteBuilding(data) {
    this.$emit("deleteBuilding", data);
  }
}

export default ListComponent;
</script>

<style scoped lang="scss">
.list_container {
  width: 100%;
  height: 100%;
  flex-direction: row;
  display: flex;
  .mapContainer {
    height: 100%;
    padding: 0px !important;
    overflow: hidden;
    flex: 0 0 50vw;
  }

  .listContainer {
    height: 100%;
    padding: 0px !important;
    overflow: hidden;
    flex: 0 0 50vw;
  }
}
</style>