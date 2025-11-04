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
  <div class="_container">
    <div class="content">

      <!-- <v-select style="padding-left: 200px;padding-right: 200px;font-weight: bold;font-size: 20px;"
        label="Selectionner un indicateur" v-model="SelectedCP" :items="tabInfo"></v-select> -->


      <!-- <v-list rounded v-if="buildings && buildings.length > 0"> -->
      <!-- <div v-for="portofolio in portofolios" :key="portofolio.id" :value="true"
          v-if="myportfolio === portofolio.name"> -->

      <!-- <v-list-item-content> -->
      <div class="building-content" v-for="building in buildings" :key="building.id">
        <BuildingCard :SelectedCP="SelectedCP" :dataCP="dataCP" :data="building" @viewOnMap="viewOnMap"
          @clickParent="clickParent" :isSelected="building.id === buildingSelected" />
      </div>

      <div class="empty" v-if="!buildings || buildings.length === 0">
        Aucun bâtiment dans ce portefeuille
      </div>
      <!-- </v-list-item-content> -->
      <!-- </div> -->
      <!-- </v-list> -->

      <!-- <div v-else class="emptyPortofolio">
        Aucun Portefeuille à afficher
      </div> -->

    </div>
  </div>
</template>



<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
//@ts-ignore
import { IBuilding, IPortofolio } from "../../interfaces/IBuilding";
import BuildingCard from "./building-card.vue";

@Component({
  components: {
    BuildingCard,
  },
})
class BuildingListView extends Vue {
  @Prop() buildings!: IBuilding[];
  @Prop() tabInfo: [];
  @Prop() dataCP: [];
  @Prop() buildingSelected!: String | null;


  searchText: string = "";

  SelectedCP: string = ""

  // get myportfolio(): string {
  //   const patrimoine = localStorage.getItem("patrimoine");
  //   try {
  //     const patrimoineObject = patrimoine ? JSON.parse(patrimoine) : null;
  //     return patrimoineObject?.name ?? "";
  //   } catch {
  //     return "";
  //   }
  // }




  // addPortofolio() {
  //   this.$emit("createPortofolio");
  // }

  // editPortofolio(item: IPortofolio) {
  //   this.$emit("editPortofolio", item);
  // }

  clickParent(item) {
    this.$emit("elementClique", item);
  }

  // deletePortofolio(item: IPortofolio) {
  //   this.$emit("deletePortofolio", item);
  // }

  // Building
  // addBuilding(portofolio: IPortofolio) {
  //   this.$emit("addBuilding", portofolio);
  // }

  viewOnMap(item: IBuilding) {
    this.$emit("viewOnMap", item);
  }

  // editBuilding(portofolio: IPortofolio, building: IBuilding) {
  //   this.$emit("editBuilding", { building, portofolio });
  // }

  // deleteBuilding(portofolio: IPortofolio, building: IBuilding) {
  //   this.$emit("deleteBuilding", { portofolio, building });
  // }

  @Watch("SelectedCP")
  callback(val) {
    this.$emit("selectedCP", val);
  }




}

export default BuildingListView;
</script>


<style lang="scss" scoped>
._container {
  // width: 98%;
  height: 100%;
  // display: flex;
  // flex-direction: column;
  // justify-content: center;
  // align-items: center;

  .header {
    height: 70px;
    background: #14202c;
    padding: 0 10px;
    border-radius: 10px;
    margin-bottom: 10px;
    margin-top: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;

    .header_col.left {
      flex: 0 0 60%;
    }

    .header_col.right {
      flex: 0 0 39%;
      display: flex;
      justify-content: end;
    }

    .addButton {
      width: 100%;
      height: 40px;
      border: 1px solid #fff;
      border-radius: 10px;
      text-transform: uppercase;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .content {
    // width: 97%;
    // height: calc(100% - 90px);
    height: 100%;
    padding: 20px 0;
    background: #f1f5f5;
    border-radius: 10px;
    overflow: auto;

    .v-list {
      background: transparent !important;
    }

    .v-list-item__action--stack {
      flex-direction: row;
    }

    .emptyPortofolio {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.6em;
    }
  }

  .empty {
    text-align: center;
  }
}
</style>