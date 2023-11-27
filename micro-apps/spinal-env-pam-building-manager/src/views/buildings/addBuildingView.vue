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

      <v-btn class="button"
             color="#14202c"
             @click="save"
             :disabled="disableBtn">
        <v-icon class="btnIcon">
          mdi-content-save-outline
        </v-icon>

        Enregister
      </v-btn>
    </div>

    <v-card class="content">
      <div class="backDiv">
        <v-btn rounded
               outlined
               color="#14202c"
               dark
               @click="cancel">
          <v-icon left>
            mdi-arrow-left-thin
          </v-icon>
          Retour
        </v-btn>

        <h2>Ajouter un Bâtiment au portefolio</h2>

      </div>

      <div class="selection">
        <v-stepper v-model="stepperData"
                   vertical
                   flat
                   max-height="100%"
                   min-height="300px">
          <v-stepper-step step="1"
                          editable>
            Informations du bâtiment
          </v-stepper-step>

          <v-stepper-content step="1">
            <div class="form">
              <v-row>
                <v-col cols="6">
                  <v-text-field dense
                                hide-details
                                label="Name"
                                v-model.trim="building.name"
                                outlined></v-text-field>

                  <v-text-field dense
                                hide-details
                                label="BOS Url"
                                v-model.trim="building.bosUrl"
                                outlined></v-text-field>

                </v-col>

                <v-col cols="6">
                  <v-text-field dense
                                hide-details
                                label="Alias"
                                v-model.trim="building.aliasName"
                                outlined></v-text-field>

                  <v-text-field dense
                                hide-details
                                label="API Url"
                                v-model.trim="building.apiUrl"
                                outlined></v-text-field>

                </v-col>

                <v-col cols="12"
                       class="placesCol">
                  <places ref="places"
                          class="addressInput"
                          v-model="building.address"
                          placeholder="Address">
                  </places>
                </v-col>

                <v-col cols="12">
                  <v-textarea dense
                              outlined
                              v-model.trim="building.description"
                              no-resize
                              rows="3"
                              label="Description"></v-textarea>
                </v-col>
              </v-row>
            </div>
          </v-stepper-content>

          <v-stepper-step step="2"
                          editable>
            Selection des routes disponibles sur ce bâtiment
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-row class="rows">

              <v-col cols="12"
                     class="right-col">

                <div class="toolbar">
                  <div class="title">Apis du bâtiment</div>
                  <div class="search">
                    <v-text-field dense
                                  v-model="apiSearchText"
                                  append-icon="mdi-magnify"
                                  label="Search"
                                  single-line
                                  hide-details></v-text-field>
                  </div>
                </div>

                <v-data-table v-model="building.apiIds"
                              :headers="apiHeaders"
                              :items="apisSearched"
                              item-key="id"
                              selectable-key="id"
                              disable-pagination
                              hide-default-footer
                              show-select
                              class="tableDiv"></v-data-table>

              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-step step="3"
                          editable>
            Selection des applications disponibles sur ce bâtiment
          </v-stepper-step>

          <v-stepper-content step="3">
            <v-row class="rows">
              <v-col cols="12"
                     class="left-col">

                <div class="toolbar">
                  <div class="title">Applications du bâtiment</div>
                  <div class="search">
                    <v-text-field dense
                                  v-model="appSearchText"
                                  append-icon="mdi-magnify"
                                  label="rechercher"
                                  single-line
                                  hide-details></v-text-field>
                  </div>
                </div>

                <v-data-table v-model="building.appIds"
                              :headers="appHeaders"
                              :items="appsSearched"
                              item-key="id"
                              selectable-key="id"
                              disable-pagination
                              hide-default-footer
                              show-select
                              class="tableDiv"></v-data-table>

              </v-col>

            </v-row>
          </v-stepper-content>

        </v-stepper>
      </div>

      <!-- 

      <div class="selection">
        <v-row class="rows">
          <v-col cols="6"
                 class="left-col">

            <div class="toolbar">
              <div class="title">Applications du bâtiment</div>
              <div class="search">
                <v-text-field dense
                              v-model="appSearchText"
                              append-icon="mdi-magnify"
                              label="rechercher"
                              single-line
                              hide-details></v-text-field>
              </div>
            </div>

            <v-data-table v-model="building.appIds"
                          :headers="appHeaders"
                          :items="appsSearched"
                          item-key="id"
                          selectable-key="id"
                          disable-pagination
                          hide-default-footer
                          show-select
                          class="tableDiv"></v-data-table>

          </v-col>

          <v-col cols="6"
                 class="right-col">

            <div class="toolbar">
              <div class="title">Apis du bâtiment</div>
              <div class="search">
                <v-text-field dense
                              v-model="apiSearchText"
                              append-icon="mdi-magnify"
                              label="Search"
                              single-line
                              hide-details></v-text-field>
              </div>
            </div>

            <v-data-table v-model="building.apiIds"
                          :headers="apiHeaders"
                          :items="apisSearched"
                          item-key="id"
                          selectable-key="id"
                          disable-pagination
                          hide-default-footer
                          show-select
                          class="tableDiv"></v-data-table>

          </v-col>
        </v-row>
      </div> -->
    </v-card>

  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Places from "vue-places";

import { Component, Prop } from "vue-property-decorator";
import { IApiRoute } from "../../interfaces/IApiRoute";
import { IApp } from "../../interfaces/IApp";
import { IBuilding, IPortofolio } from "../../interfaces/IBuilding";

@Component({
  components: {
    Places,
  },
})
class AddBuilding extends Vue {
  @Prop() portofolioSelected!: IPortofolio;
  @Prop() buildingSelected!: any;
  @Prop() edit!: boolean;

  stepperData: number = 1;

  building: any = {};

  appsSearched: IApp[] = [];
  appSearchText: string = "";

  apisSearched: IApiRoute[] = [];
  apiSearchText: string = "";

  appHeaders = [{ text: "Nom", value: "name" }];
  apiHeaders = [{ text: "Route", value: "route" }];

  async mounted() {
    await this.init();
    if (this.edit) {
      this.building = Object.assign({}, this.buildingSelected);
      this.building.appIds = this.building.apps;
      this.building.apiIds = this.building.apis;
    }
  }

  async init() {
    this.$refs["places"].placesAutocomplete.on("locate", this.locateOnMap);

    this.building = {
      name: "",
      aliasName: "",
      bosUrl: "",
      apiUrl: "",
      clientId: "",
      clientSecret: "",
      address: "",
      // concerned_user: "",
      description: "",
      location: {},
      appIds: [],
      apiIds: [],
    };

    await Promise.all([
      this.$store.dispatch("appsStore/getBuildingApps"),
      this.$store.dispatch("appsStore/getBuildingApis"),
    ]);

    this._filterApps();
    this._filterApis();
  }

  save() {
    if (!this.edit) {
      return this.$emit("save", {
        portofolioId: this.portofolioSelected.id,
        data: this._getCreationData(),
      });
    }

    this.$emit("edit", {
      portofolioId: this.portofolioSelected.id,
      buildingId: this.buildingSelected.id,
      data: this._getEditData(),
    });
  }

  cancel() {
    this.$emit("cancel");
  }

  _getEditData() {
    const appData = this._formatIds(this.building.appIds);
    const apiData = this._formatIds(this.building.apiIds);

    delete this.building.apps;
    delete this.building.apis;
    delete this.building.appIds;
    delete this.building.apiIds;

    return {
      ...this.building,
      authorizeAppIds: appData.ids,
      authorizeApiIds: apiData.ids,
      unauthorizeAppIds: this._getListToRemove(
        this.buildingSelected.apps,
        appData.obj
      ),
      unauthorizeApiIds: this._getListToRemove(
        this.buildingSelected.apis,
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

  _getCreationData() {
    return {
      name: this.building.name,
      aliasName: this.building.aliasName,
      bosUrl: this.building.bosUrl,
      apiUrl: this.building.apiUrl,
      address: this.building.address,
      // concerned_user: "",
      description: this.building.description,
      location: this.building.location,
      appIds: this.building.appIds.map((el) => el.id),
      apiIds: this.building.apiIds.map((el) => el.id),
    };
  }

  _filterApps() {
    const val = this.appSearchText.trim().toLocaleLowerCase();
    if (!val) {
      this.appsSearched = Object.assign(
        [],
        this.$store.state.appsStore.buildingsApps
      );
      return;
    }

    this.appsSearched = this.$store.state.appsStore.buildingsApps.filter(
      ({ name }) => name.toLocaleLowerCase().includes(val)
    );
  }

  _filterApis() {
    const val = this.apiSearchText.trim().toLocaleLowerCase();
    if (!val) {
      this.apisSearched = Object.assign(
        [],
        this.$store.state.appsStore.buildingsApis
      );
      return;
    }

    this.apisSearched = this.$store.state.appsStore.buildingsApis.filter(
      ({ route }) => route.toLocaleLowerCase().includes(val)
    );
  }

  get disableBtn() {
    return false;
  }

  locateOnMap(res) {
    this.$emit("geoLocate");
  }
}

export default AddBuilding;
</script>

<style scoped lang="scss">
$form-header: 70px;

._container {
  width: 100%;
  height: calc(100%);

  .header {
    width: 100%;
    height: $form-header;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .button {
      color: #fff;
      margin-right: 10px;

      .btnIcon {
        margin-right: 5px;
      }
    }
  }

  .content {
    $backDiv-height: 40px;
    width: 99%;
    height: calc(100% - #{$form-header + 10px});
    padding: 10px;
    border-radius: 15px;
    margin: auto;
    .backDiv {
      width: 100%;
      height: $backDiv-height;
      display: flex;
      h2 {
        margin-left: 20px;
      }
    }

    .selection {
      $toolbar-height: 50px;
      width: 100%;
      height: calc(100% - #{$backDiv-height});

      .form {
        width: 100%;
        height: 35%;
        .v-input {
          margin: 12px 0;
        }
        .placesCol {
          padding: 0 12px;
          .addressInput {
            height: 40px;
            // margin-bottom: 20px;
            border: 1px solid grey;
          }
        }
      }

      .rows {
        width: 100%;
        height: 100%;
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
          height: calc(550px - #{$toolbar-height});
          // height: calc(100% - #{$toolbar-height});
          position: relative;
          overflow: auto;
        }
      }
    }
  }
}

/* ._container .header {
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
}

._container .content {
  width: 97%;
  height: calc(100% - 90px);
  background: #f1f5f5;
  border-radius: 10px;
  overflow: auto;
} */
</style>