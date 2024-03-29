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
  <v-card class="creationContainer">
    <div class="header">
      <div class="leftDiv">
        <div class="back">
          <v-btn rounded
                 outlined
                 color="#14202c"
                 dark
                 @click="goBack">
            <v-icon left>
              mdi-arrow-left-thin
            </v-icon>
            Retour
          </v-btn>
        </div>
        <div class="_title">ajouter un profil d'utilisateur</div>
        <div class="description">
          <p>Entrez un nom de profil d'utilisateur</p>
          <p>Sélectionnez son périmètre ci-dessous :</p>
        </div>
        <div class="searchDiv">
          <v-text-field solo
                        outlined
                        flat
                        label="nom du profil"
                        hide-details="auto"
                        v-model.trim="profileName"></v-text-field>
        </div>
      </div>

      <div class="rightDiv">
        <v-btn class="button"
               color="#14202c"
               @click="saveProfile"
               :disabled="disableSaveButton">
          <v-icon class="btnIcon">
            mdi-content-save-outline
          </v-icon>

          Enregister le profil
        </v-btn>
      </div>
    </div>

    <div class="profileContent">
      <TabsComponent :portofolios="portofoliosCopy"
                     @selectPortofolio="selectPortofolio"
                     :portofolioSelected="portofolioSelected"
                     :profileSelected="profileSelected"
                     :edit="edit" />
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

import { State } from "vuex-class";
import TreeViewComponent from "./treeView.vue";
import PortofolioList from "./portofolioList.vue";
import TabsComponent from "./tabsComponent.vue";

@Component({
  components: {
    TreeViewComponent,
    PortofolioList,
    TabsComponent,
  },
})
class CreationComponent extends Vue {
  @Prop() edit!: boolean;
  @Prop() profileSelected!: any;

  tabsObject = Object.freeze({
    Applications: "Applications de Portefolios",
    Batiments: "Applications de Batiments",
  });

  profileName = "";

  headers: any = [
    {
      text: "Nom de l'application",
      sortable: false,
      value: "name",
    },
  ];

  @State portofolios!: any;

  portofolioSelected: any = null;
  portofoliosCopy: any = null;

  tabItems: string[] = Object.values(this.tabsObject);

  tab = this.tabsObject.Applications;
  buildingTab = null;

  mounted() {
    this._initProfile();
  }

  selectPortofolio(portofolio: any) {
    this.portofolioSelected = portofolio;
  }

  goBack() {
    this.$emit("goBack");
  }

  saveProfile() {
    if (!this.edit) {
      const data = this._getProfileCreationData();
      return this.$emit("create", data);
    }

    this.$emit("edit", {
      profileId: this.profileSelected.id,
      data: this._getDiffBetweenProfile(),
    });
  }

  _initProfile() {
    this.profileName = !this.edit ? "" : this.profileSelected.name;
    this.portofoliosCopy = this.createCopy(this.portofolios);
  }

  createCopy(liste: any) {
    if (!liste) return [];
    return liste.map((el: any) => {
      const copy = this._addSelectedAttr(el);
      copy.apps = copy.apps.map((app: any) => this._addSelectedAttr(app));
      if (copy.buildings) copy.buildings = this.createCopy(copy.buildings);
      return copy;
    });
  }

  getItemToSelect(parentId: string, isBuilding = false) {
    if (!this.edit) return [];

    if (!isBuilding) {
      const found = this.profileSelected.authorized.find(
        (el: any) => el.id === parentId
      );

      return found ? found.apps : [];
    }
  }

  get getPortofolioBuilding() {
    return this.portofolioSelected.buildings.map((el: any) => el.name);
  }

  get disableSaveButton() {
    if (this.profileName.length === 0) return true;

    return false;
  }

  @Watch("portofolios")
  watchPortofolios() {
    this._initProfile();
  }

  // @Watch("bos")
  // watchBos(newValue: any) {
  //   this._initBos(newValue);
  // }

  @Watch("edit")
  watchEditMode(newValue: boolean) {
    this._initProfile();
  }

  _getDiffBetweenProfile() {
    const toCreate = this._getProfileCreationData();
    const obj = this._convertProfileToObj(this.profileSelected);

    for (const portofolio of toCreate.authorize) {
      const appsIds = portofolio.appsIds;
      const objData = obj[portofolio.portofolioId]?.apps || {};

      portofolio.unauthorizeAppsIds = this._getAppsToUnauthorize(
        appsIds,
        objData
      );

      for (const building of portofolio.building) {
        const buildingAppsIds = building.appsIds;
        const buildingObjData =
          obj[portofolio.portofolioId]?.buildings[building.buildingId] || {};

        building.unauthorizeAppsIds = this._getAppsToUnauthorize(
          buildingAppsIds,
          buildingObjData
        );
      }
    }

    return toCreate;
  }

  _getAppsToUnauthorize(apps: any, obj: any) {
    if (Object.keys(obj).length === 0) return [];
    for (const app of apps) {
      delete obj[app];
    }

    return Object.keys(obj);
  }

  _addSelectedAttr(element: any) {
    const copy = JSON.parse(JSON.stringify(element));
    copy.selected = false;
    return copy;
  }

  _getProfileCreationData() {
    return this.portofoliosCopy.reduce(
      (liste: any, item: any) => {
        const obj = this._formatData(item);
        liste.authorize.push(obj);

        return liste;
      },
      { name: this.profileName, authorize: [] }
    );
  }

  _formatData(item: any, idAttr = "portofolioId") {
    const obj: any = {
      [idAttr]: item.id,
      appsIds: this._getSelected(item.apps),
    };

    if (item.buildings) {
      obj.building = item.buildings.map((el: any) =>
        this._formatData(el, "buildingId")
      );
    }

    return obj;
  }

  _getSelected(arr: any) {
    return arr.reduce((liste: any[], item: any) => {
      if (item.selected) liste.push(item.id);
      return liste;
    }, []);
  }

  _convertProfileToObj(profile: any) {
    console.log(profile);
    const obj: any = {};
    for (const { id, apps, buildings } of profile.authorized) {
      obj[id] = {};
      obj[id]["apps"] = this._convertAppsToObj(apps);
      obj[id]["buildings"] = this._convertBuildings(buildings);
    }

    return obj;
  }

  _convertBuildings(buildings: any) {
    const obj: { [key: string]: any } = {};
    for (const { id, apps } of buildings) {
      obj[id] = this._convertAppsToObj(apps);
    }

    return obj;
  }

  _convertAppsToObj(apps: any) {
    const obj: { [key: string]: any } = {};

    for (const item of apps) {
      obj[item.id] = item;
    }

    return obj;
  }
}

export default CreationComponent;
</script>

<style lang="scss" scoped>
$header-margin-top: 70px;
$header-height: 190px;
$header-margin-bottom: 10px;

.creationContainer {
  width: 100%;
  height: calc(100% - #{$header-margin-top});
  margin-top: $header-margin-top !important;
  background: #f9f9f9;
  padding: 15px;

  .header {
    height: $header-height !important;
    display: flex;
    justify-content: space-between;
    margin-bottom: $header-margin-bottom;
    .leftDiv {
      width: 35%;

      .back {
        height: 40px;
        margin-bottom: 5px;
      }
      ._title {
        text-transform: uppercase;
        font-size: 0.9em;
        margin-bottom: 15px;
      }

      .description {
        font-size: 0.8em;
        line-height: 5px;
      }
    }

    .rightDiv {
      width: 40%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .button {
        color: #fff;

        .btnIcon {
          margin-right: 5px;
        }
      }
    }
  }

  .profileContent {
    width: 100%;
    height: calc(100% - #{$header-height + $header-margin-bottom});
    // display: flex;
    // justify-content: space-between;

    // .portofolioList {
    //   width: 20%;
    //   height: 100%;
    //   border-right: 1px solid grey;
    // }

    // .content {
    //   width: 79%;
    //   height: 100%;
    //   .empty {
    //     width: 100%;
    //     height: 100%;
    //     display: flex;
    //     align-items: center;
    //     justify-content: center;
    //     font-size: 1.6em;
    //   }

    //   .tabs {
    //     width: 100%;
    //     height: 100%;

    //     .tabsHeader {
    //       width: 100%;
    //       height: 50px;
    //     }

    //     .tabsItems {
    //       width: 100%;
    //       height: calc(100% - 50px);
    //       overflow: auto;

    //       // .v-window__container {
    //       //   height: 100% !important;
    //       //   background: yellow;
    //       // }

    //       .buildingTabsDiv {
    //         width: 100%;
    //         height: 100%;
    //         .empty {
    //           width: 100%;
    //           height: 100%;
    //         }
    //         .buildingTabItems {
    //           width: 100%;
    //           height: 100%;
    //         }
    //         .buildingTabs {
    //           width: 100%;
    //           height: 50px;
    //         }
    //       }
    //     }
    //   }
    // }

    // display: flex;
    // justify-content: space-between;
  }
}
</style>

<style>
.v-window__container {
  height: 100%;
}

.v-window-item {
  height: calc(100% - 50px);
}

.buildingTabItems .v-window-item {
  height: 100%;
}
</style>