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
  <v-card class="creation_container">
    <div class="header">
      <div class="left">
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

        <h2 style="margin-left : 20px">Créer un portefeuille</h2>
      </div>
      <div class="right">
        <v-btn class="button"
               color="#14202c"
               @click="savePortofolio"
               :disabled="disableBtn">
          <v-icon class="btnIcon">
            mdi-content-save-outline
          </v-icon>

          Enregister
        </v-btn>
      </div>
    </div>

    <div class="content">

      <v-stepper vertical
                 v-model="stepperData"
                 flat
                 max-height="100%"
                 min-height="300px">
        <v-stepper-step editable
                        step="1">Informations du Portefeuille</v-stepper-step>
        <v-stepper-content step="1">
          <v-row class="name">
            <v-col cols="6">
              <v-text-field dense
                            block
                            outlined
                            v-model="portofolio.name"
                            required
                            label="Nom du Portefeuille"></v-text-field>
            </v-col>
          </v-row>
        </v-stepper-content>

        <!-- Second Step -->

        <v-stepper-step editable
                        step="2">
          Selection des routes disponibles
        </v-stepper-step>
        <v-stepper-content step="2">
          <v-row class="rows">
            <v-col cols="12"
                   class="right-col">

              <div class="toolbar">
                <div class="title">APIs Patrimoniales</div>
                <div class="search">
                  <v-text-field dense
                                v-model="apiSearchText"
                                append-icon="mdi-magnify"
                                label="rechercher"
                                single-line
                                hide-details></v-text-field>
                </div>
              </div>

              <v-data-table v-model="portofolio.apiIds"
                            :headers="apiHeaders"
                            :items="apisSearched"
                            item-key="id"
                            selectable-key="id"
                            disable-pagination
                            hide-default-footer
                            show-select
                            class="tableDiv"
                            no-data-text="Aucune route API à afficher">

              </v-data-table>

            </v-col>
          </v-row>
        </v-stepper-content>

        <!-- Third Step -->

        <v-stepper-step editable
                        step="3">
          Selection des applications disponibles
        </v-stepper-step>
        <v-stepper-content step="3">

          <v-row class="rows">
            <v-col cols="12"
                   class="left-col">

              <div class="toolbar">
                <div class="title">Application Patrimoniales</div>
                <div class="search">
                  <v-text-field dense
                                v-model="appSearchText"
                                append-icon="mdi-magnify"
                                label="rechercher"
                                single-line
                                hide-details></v-text-field>
                </div>
              </div>

              <v-data-table v-model="portofolio.appIds"
                            class="tableDiv"
                            :headers="appHeaders"
                            :items="appsSearched"
                            item-key="id"
                            selectable-key="id"
                            disable-pagination
                            hide-default-footer
                            show-select
                            no-data-text="Aucune application à afficher">
              </v-data-table>

            </v-col>
          </v-row>

        </v-stepper-content>

      </v-stepper>

    </div>

  </v-card>
</template>

<script lang="ts">
import { log } from "console";
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { IApiRoute } from "../../interfaces/IApiRoute";
import { IApp } from "../../interfaces/IApp";
import { IPortofolio } from "../../interfaces/IBuilding";

const appsStoreModule = namespace("appsStore");

@Component({})
class PortofolioCreation extends Vue {
  // @appsStoreModule.State portofolioApps!: IApp[];
  // @appsStoreModule.State portofolioApis!: IApiRoute[];

  // @appsStoreModule.Action getPortofolioApps!: () => Promise<IApp[]>;
  // @appsStoreModule.Action getPortofolioApis!: () => Promise<IApiRoute[]>;

  @Prop() edit!: boolean;
  @Prop() portofolioSelected!: IPortofolio;

  stepperData: number = 1;

  appsSearched: IApp[] = [];
  appSearchText: string = "";

  apisSearched: IApiRoute[] = [];
  apiSearchText: string = "";

  appHeaders = [{ text: "Nom", value: "name" }];
  apiHeaders = [{ text: "Route", value: "route" }];

  portofolio: any = {};

  async mounted() {
    await this.init();
    if (this.edit) {
      this.portofolio.name = this.portofolioSelected.name;
      this.portofolio.appIds = Object.assign([], this.portofolioSelected.apps);
      this.portofolio.apiIds = Object.assign([], this.portofolioSelected.apis);
    }
  }

  async init() {
    this.portofolio = {
      name: "",
      appIds: [],
      apiIds: [],
    };
    await Promise.all([
      this.$store.dispatch("appsStore/getPortofolioApps"),
      this.$store.dispatch("appsStore/getPortofolioApis"),
    ]);

    this._filterApps();
    this._filterApis();
  }

  goBack() {
    this.$emit("cancel");
  }

  savePortofolio() {
    if (!this.edit) return this.$emit("save", this._getCreationInfo());

    const data = this._getEditInfo();
    this.$emit("edit", { id: this.portofolioSelected.id, data });
  }

  get disableBtn() {
    if (!this.portofolio.name || !this.portofolio.name.trim()) return true;
    // if (
    //   this.portofolio.appIds.length === 0 &&
    //   this.portofolio.apiIds.length === 0
    // )
    //   return true;

    return false;
  }

  _filterApps() {
    const val = this.appSearchText.trim().toLocaleLowerCase();
    if (!val) {
      this.appsSearched = Object.assign(
        [],
        this.$store.state.appsStore.portofolioApps
      );
      return;
    }

    this.appsSearched = this.$store.state.appsStore.portofolioApps.filter(
      ({ name }) => name.toLocaleLowerCase().includes(val)
    );
  }

  _filterApis() {
    const val = this.apiSearchText.trim().toLocaleLowerCase();
    if (!val) {
      this.apisSearched = Object.assign(
        [],
        this.$store.state.appsStore.portofolioApis
      );
      return;
    }

    this.apisSearched = this.$store.state.appsStore.portofolioApis.filter(
      ({ route }) => route.toLocaleLowerCase().includes(val)
    );
  }

  _getCreationInfo() {
    return {
      name: this.portofolio.name.trim(),
      appIds: this.portofolio.appIds.map((el) => el.id),
      apiIds: this.portofolio.apiIds.map((el) => el.id),
    };
  }

  _getEditInfo() {
    const appData = this._formatIds(this.portofolio.appIds);
    const apiData = this._formatIds(this.portofolio.apiIds);

    return {
      name: this.portofolio.name,
      authorizeAppIds: appData.ids,
      authorizeApiIds: apiData.ids,
      unauthorizeAppIds: this._getListToRemove(
        this.portofolioSelected.apps,
        appData.obj
      ),
      unauthorizeApiIds: this._getListToRemove(
        this.portofolioSelected.apis,
        apiData.obj
      ),
    };
  }

  _getListToRemove(liste1: any[], obj: { [key: string]: string }) {
    return liste1.reduce((liste, { id }) => {
      if (!obj[id]) liste.push(id);

      return liste;
    }, []);
  }

  _formatIds(liste): { ids: string[]; obj: { [key: string]: string } } {
    const obj = {};
    const ids = liste.map(({ id }) => {
      obj[id] = id;
      return id;
    });

    return {
      obj,
      ids,
    };
  }

  // @Watch("portofolioApps")
  // watchPortofolioApps() {
  //   this._filterApps();
  // }

  // @Watch("portofolioApis")
  // watchPortofolioApis() {
  //   this._filterApis();
  // }

  @Watch("appSearchText")
  watchAppSearchText() {
    this._filterApps();
  }

  @Watch("apiSearchText")
  watchApiSearchText() {
    this._filterApis();
  }
}

export default PortofolioCreation;
</script>

<style lang="scss" scoped>
$header-height: 75px;
$toolbar-height: 50px;

.creation_container {
  width: 99%;
  height: calc(100% - #{$header-height + 10px});
  margin: auto;
  margin-top: $header-height;
  border-radius: 20px !important;
  .header {
    width: 100%;
    height: $header-height;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    .left,
    .right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .button {
        color: #fff;

        .btnIcon {
          margin-right: 5px;
        }
      }
    }
  }

  .content {
    width: 100%;
    height: calc(100% - #{$header-height});
    padding: 0 20px;

    .name {
      width: 100%;
      height: $header-height;
      margin-bottom: 5px;
    }

    .rows {
      width: 100%;
      height: calc(100% - #{$header-height + 10px});
      margin-top: 5px;
      padding: 0 5px;

      .left-col,
      .right-col {
        padding: 5px;
        height: 100%;

        .toolbar {
          width: 100%;
          height: $toolbar-height;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .title,
          .search {
            width: 40%;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .v-stepper__content {
      min-height: 30px;
      max-height: 600px;

      .tableDiv {
        width: 100%;
        height: calc(550px - #{$toolbar-height}) !important;
        // height: calc(100% - #{$toolbar-height});
        position: relative;
        overflow: auto;
      }
    }
  }
}
</style>

