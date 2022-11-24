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
    <div class="header">
      <div class="header_col left">
        <v-text-field label="Search"
                      dark
                      append-icon="mdi-magnify"
                      v-model="searchText"></v-text-field>
      </div>

      <div class="header_col right">
        <button class="addButton"
                @click="addPortofolio">Ajouter un portefolio</button>
      </div>
    </div>

    <div class="content">

      <v-list rounded>
        <v-list-group prepend-icon="mdi-office-building"
                      :eager="true"
                      v-for="portofolio in portofolios"
                      :key="portofolio.id">

          <template v-slot:activator>
            <v-list-item-title>{{portofolio.name}}</v-list-item-title>
            <v-list-item-action>
              <v-btn icon
                     title="ajouter un batiment"
                     color="primary"
                     @click.stop="addBuilding(portofolio)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>

              <v-btn icon
                     title="modifier le portefolio"
                     color="primary"
                     @click.stop="editPortofolio(portofolio)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <v-btn icon
                     title="supprimer le portefolio"
                     color="error"
                     @click.stop="deletePortofolio(portofolio)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>

          <v-list-item-content>
            <div class="building-content"
                 v-for="building in portofolio.buildings"
                 :key="building.id">
              <BuildingCard :data="building"
                            @viewOnMap="viewOnMap"
                            @edit="(data) => editBuilding(portofolio,data)"
                            @delete="(data) => deleteBuilding(portofolio,data)" />
            </div>

            <div class="empty"
                 v-if="!portofolio.buildings || portofolio.buildings.length === 0">
              Aucun batiment dans ce portefolio
            </div>

          </v-list-item-content>

        </v-list-group>
      </v-list>

      <!-- <patrimoine-card v-for="building in buildings"
                       :key="building.id"
                       :data="building"
                       @viewOnMap="viewOnMap"
                       @edit="editBuilding"
                       @delete="deleteBuilding"></patrimoine-card> -->
    </div>
  </div>
</template>


<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import { IBuilding, IPortofolio } from "../../interfaces/IBuilding";
import BuildingCard from "../../components/building-card.vue";

@Component({
  components: {
    BuildingCard,
  },
})
class PortofolioView extends Vue {
  @Prop() portofolios!: IPortofolio[];

  searchText: string = "";

  addPortofolio() {
    this.$emit("createPortofolio");
  }

  editPortofolio(item: IPortofolio) {
    this.$emit("editPortofolio", item);
  }

  deletePortofolio(item: IPortofolio) {
    this.$emit("deletePortofolio", item);
  }

  // Building
  addBuilding(portofolio: IPortofolio) {
    this.$emit("addBuilding", portofolio);
  }

  viewOnMap(item: IBuilding) {
    this.$emit("viewOnMap", item);
  }

  editBuilding(portofolio: IPortofolio, building: IBuilding) {
    this.$emit("editBuilding", { building, portofolio });
  }

  deleteBuilding(portofolio: IPortofolio, building: IBuilding) {
    this.$emit("deleteBuilding", { portofolio, building });
  }

  // @Watch("portofolios")
  // callback() {
  //   console.log("this.portofolios", this.portofolios);
  // }
}

export default PortofolioView;
</script>


<style lang="scss" scoped>
._container {
  width: 98%;
  height: calc(100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .header {
    width: 97%;
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
    width: 97%;
    height: calc(100% - 90px);
    padding: 10px 0;
    background: #f1f5f5;
    border-radius: 10px;
    overflow: auto;

    .v-list {
      background: transparent !important;
    }

    .v-list-item__action--stack {
      flex-direction: row;
    }
  }

  .empty {
    text-align: center;
  }
}
</style>