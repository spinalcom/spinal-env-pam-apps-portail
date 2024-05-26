<template>
  <SimpleModale
    modaleTitle="Nomenclature"
    :show-dialog="showModal"
    width="50%"
    persistent
    :error-message="errorMessage"
    v-on:save="next"
    v-on:close="close"
    :validateButtonText="validateButtonText"
  >
    <template v-slot:body>
      <v-row class="content-wrapper" ref="firstView">
        <div class="first-view px-8" v-show="currentMode === 'one'">
          <div class="action-wrapper">
            <div class="d-flex flex-row justify-space-between">
              <v-menu
                offset-x
                transition="slide-y-transition"
                :close-on-content-click="!showMenuConfFilter"
                :close-on-click="!showMenuConfFilter"
                dense
              >
                <template #activator="{ on: menu, attrs }">
                  <v-tooltip top>
                    <template v-slot:activator="{ on: tooltip }">
                      <v-btn
                        color="primary"
                        width="10em"
                        v-bind="attrs"
                        v-on="{ ...tooltip, ...menu }"
                      >
                        <v-icon>mdi-plus</v-icon>
                        <!-- Ajouter un filtre -->
                        Filtre
                      </v-btn>
                    </template>
                    <span>Ajouter un filtre</span>
                  </v-tooltip>
                </template>
                <v-list
                  class="pa-4"
                  v-if="!showMenuConfFilter"
                  v-for="value in categories"
                >
                  <v-subheader>{{ value }}</v-subheader>
                  <v-list-item-group color="primary">
                    <v-list-item
                      v-for="filter in customFilter"
                      v-if="filter.category === value"
                    >
                      <!-- <v-list-item-icon> <v-icon>mdi-pencil</v-icon></v-list-item-icon> -->
                      <v-list-item-content>
                        <v-list-item-title
                          @click="updateNewSelectedFilter(filter)"
                          >{{ filter.displayName }}</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
                <v-list class="pa-4" v-if="showMenuConfFilter" dense flat>
                  <div
                    text-uppercase
                    class="text-h5 font-weight-bold text-uppercase"
                    color="primary"
                  >
                    {{ newSelectedFilterItem.displayName }}
                  </div>
                  <v-list-item-group
                    color="primary"
                    v-model="selectedFilterType"
                  >
                    <v-list-item v-if="newSelectedFilterItem.type === 'number'">
                      <template v-slot:default="{ active }">
                        <div class="d-flex flex-column">
                          <div class="d-flex flex-row justify-space-around">
                            <v-list-item-action>
                              <v-checkbox
                                :input-value="active"
                                color="deep-purple accent-4"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title class="body-2"
                                >Plus grand que</v-list-item-title
                              >
                            </v-list-item-content>
                          </div>
                          <div
                            class="d-flex flex-row justify-end align-end"
                            v-if="active"
                          >
                            <v-text-field
                              @click.stop=""
                              class="mx-2"
                              v-model="newSelectedFilterItem.value"
                              type="number"
                              label="Valeur"
                              outlined
                              :style="{ width: '8em' }"
                            ></v-text-field>
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                    <v-list-item v-if="newSelectedFilterItem.type === 'number'">
                      <template v-slot:default="{ active }">
                        <div class="d-flex flex-column">
                          <div class="d-flex flex-row">
                            <v-list-item-action>
                              <v-checkbox
                                :input-value="active"
                                color="deep-purple accent-4"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title class="body-2"
                                >Moins grand que</v-list-item-title
                              >
                            </v-list-item-content>
                          </div>
                          <div
                            class="d-flex flex-row justify-end align-end"
                            v-if="active"
                          >
                            <v-text-field
                              @click.stop=""
                              class="mx-2"
                              v-model="newSelectedFilterItem.value"
                              type="number"
                              label="Valeur"
                              outlined
                              :style="{ width: '8em' }"
                            ></v-text-field>
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                    <v-list-item v-if="newSelectedFilterItem.type === 'number'">
                      <template v-slot:default="{ active }">
                        <div class="d-flex flex-column">
                          <div class="d-flex flex-row">
                            <v-list-item-action>
                              <v-checkbox
                                :input-value="active"
                                color="deep-purple accent-4"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title class="body-2"
                                >Entre
                              </v-list-item-title>
                            </v-list-item-content>
                          </div>
                          <div
                            class="d-flex flex-row justify-end align-end"
                            v-if="active"
                          >
                            <v-text-field
                              @click.stop=""
                              class="mx-2"
                              type="number"
                              label="Min"
                              outlined
                              :style="{ width: '8em' }"
                              v-model="newSelectedFilterItem.min"
                            ></v-text-field>
                            <v-text-field
                              @click.stop=""
                              class="mx-2"
                              type="number"
                              label="Max"
                              outlined
                              :style="{ width: '8em' }"
                              v-model="newSelectedFilterItem.max"
                            ></v-text-field>
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:default="{ active }">
                        <div class="d-flex flex-column">
                          <div class="d-flex flex-row">
                            <v-list-item-action>
                              <v-checkbox
                                :input-value="active"
                                color="deep-purple accent-4"
                              ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                              <v-list-item-title class="body-2"
                                >Egal à
                              </v-list-item-title>
                            </v-list-item-content>
                          </div>
                          <div
                            class="d-flex flex-row justify-end align-end"
                            v-if="active"
                          >
                            <v-text-field
                              @click.stop=""
                              class="mx-2"
                              v-model="newSelectedFilterItem.value"
                              type="text"
                              label="Valeur"
                              outlined
                              :style="{ width: '8em' }"
                            ></v-text-field>
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                    <!-- <v-list-item-icon> <v-icon>mdi-pencil</v-icon></v-list-item-icon> -->
                  </v-list-item-group>
                </v-list>
                <div
                  class="d-flex flex-row pa-4"
                  :style="{ backgroundColor: 'white' }"
                >
                  <v-btn
                    data-cy="simpleModaleCloseBtn"
                    color="primary"
                    outlined
                    text
                    @click="closeFilterMenu()"
                    >Fermer</v-btn
                  >
                  <v-btn
                    data-cy="simpleModaleSubmitBtn"
                    color="primary"
                    @click="saveFilter()"
                  >
                    Enregistrer
                  </v-btn>
                </div>
              </v-menu>
              <div class="search-wrapper">
                <v-text-field
                  @input="debounceUpdateSelected"
                  width="40em"
                  filled
                  solo
                  hide-details
                  dense
                  v-model="searchModel"
                  placeholder="Rechercher"
                >
                  <template v-slot:prepend-inner>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="searchByFilter()">
                          <v-icon> mdi-magnify </v-icon>
                        </v-btn>
                      </template>
                      Rechercher
                    </v-tooltip>
                  </template>
                </v-text-field>
              </div>
            </div>
            <div
              class="d-flex flex-row justify-start align-start my-4 flex-wrap"
            >
              <v-chip
                class="mr-4 mb-2 elevation-2"
                close
                v-for="filter in searchFilter"
                label
                @click:close="deleteFilterSearch(filter)"
                @click="updateFilter(filter)"
              >
                <v-icon left> mdi-filter-variant </v-icon>
                {{ generateFilterOutput(filter) }}</v-chip
              >
            </div>
          </div>
          <div class="body-wrapper" ref="bodyWrapper">
            <SpinalTable
              ref="spinalTable"
              :items="filteredRooms"
              :headers="headersTable"
              :height="dataTableHeight"
              :selectedItems.sync="selectedItems"
              :show-select="true"
            >
            </SpinalTable>
          </div>
        </div>
        <div class="second-view px-4" v-if="currentMode === 'two'">
          <div class="recap pa-8">
            <div class="header text-uppercase text-h6 font-weight-bold">
              Recapitulatif
            </div>
            <div class="body">
              <div class="body-1">
                Assignation de
                <span class="bg-black">
                  <span> {{ selectedItems?.length ?? 0 }} </span>pièce<span
                    v-if="selectedItems?.length > 1"
                    >s</span
                  >
                </span>
              </div>
              <div class="assignation mt-2">
                <div class="assignation-table">
                  <div class="text-wrapper">
                    <span
                      >Au groupe de <span class="underlined">contexte</span>:
                    </span>
                  </div>
                  <div class="select-wrapper">
                    <v-select
                      :items="grpToDisplay[0]"
                      dense
                      width="100%"
                      @change="updateSelection(0)"
                      v-model="selectedGrp[0]"
                      return-object
                      item-text="title"
                      label="Groupe de contexte"
                      outlined
                      hide-details
                    ></v-select>
                  </div>
                  <div class="text-wrapper">
                    <span
                      >Au groupe de <span class="underlined"> catégorie</span>:
                    </span>
                  </div>
                  <div class="select-wrapper">
                    <v-select
                      v-if="selectedGrp[0]"
                      :items="grpToDisplay[1]"
                      @change="updateSelection(1)"
                      dense
                      v-model="selectedGrp[1]"
                      return-object
                      item-text="title"
                      label="Groupe de catégorie"
                      outlined
                      hide-details
                    ></v-select>
                  </div>
                  <div class="text-wrapper">
                    <span
                      >Au groupe de <span class="underlined">groupe</span>:
                    </span>
                  </div>
                  <div class="select-wrapper">
                    <v-select
                      v-if="selectedGrp[1]"
                      :items="grpToDisplay[2]"
                      @change="updateSelection(2)"
                      dense
                      v-model="selectedGrp[2]"
                      return-object
                      item-text="title"
                      label="Groupe de groupe"
                      outlined
                      hide-details
                    ></v-select>
                  </div>
                </div>
                <ul>
                  <!-- <li>
                    <div class="d-flex flex-row align-baseline mt-4">
                      <span
                        >Au groupe de <span class="underlined">groupe</span>:
                      </span>
                      <div class="select-wrapper">
                        <v-select
                          :items="grpToDisplay[0]"
                          dense
                          width="100%"
                          @change="updateSelection(0)"
                          v-model="selectedGrp[0]"
                          return-object
                          item-text="title"
                          label="Groupe de contexte"
                          outlined
                          hide-details
                        ></v-select>
                      </div>
                    </div>
                  </li> -->
                  <!-- <li>
                    <div class="d-flex flex-row align-end mt-4">
                      <span
                        >Au groupe de
                        <span class="underlined"> categorie</span>:
                      </span>
                      <div class="select-wrapper">
                        <v-select
                          v-if="selectedGrp[0]"
                          :items="grpToDisplay[1]"
                          @change="updateSelection(1)"
                          dense
                          v-model="selectedGrp[1]"
                          return-object
                          item-text="title"
                          label="Groupe de contexte"
                          outlined
                          hide-details
                        ></v-select>
                      </div>
                    </div>
                  </li> -->
                  <!-- <li>
                    <div class="d-flex flex-row align-center mt-4">
                      <span
                        >Au groupe de <span class="underlined">contexte</span>:
                      </span>
                      <div class="select-wrapper">
                        <v-select
                          v-if="selectedGrp[1]"
                          :items="grpToDisplay[2]"
                          @change="updateSelection(2)"
                          dense
                          v-model="selectedGrp[2]"
                          return-object
                          item-text="title"
                          label="Groupe de contexte"
                          outlined
                          hide-details
                        ></v-select>
                      </div>
                    </div>
                  </li> -->
                </ul>
              </div>
              <div class="body-1 mt-4">
                Application de
                <span class="bg-black">
                  <span> {{ searchFilter?.length ?? 0 }} </span>filtre<span
                    v-if="searchFilter?.length > 1"
                    >s</span
                  >
                </span>
                <div class="application">
                  <v-chip
                    class="mr-4 mb-2 mt-2 elevation-2"
                    v-for="filter in searchFilter"
                    label
                    >{{ generateFilterOutput(filter) }}</v-chip
                  >
                </div>
              </div>
            </div>
            <div class="footer d-flex justify-end align-end">
              <v-btn
                class="primary"
                v-if="
                  selectedGrp[0] &&
                  selectedGrp[1] &&
                  selectedGrp[2] &&
                  selectedItems.length > 0
                "
                @click="addRoomsToGroup()"
                width="inherit"
              >
                Assigner
                <v-icon> mdi-check </v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-row>
    </template>
  </SimpleModale>
</template>

<script lang="ts">
// * Classes
import { NomenclatureController } from "../../../controllers/";

// * Components
import SimpleModale from "./SimpleModale.vue";
import SpinalTable from "../../Table/SpinalTable.vue";

// * DTO
import { Room } from "@/interfaces/API/Geographic Context/DTO/Request/Room";

// * Icon
import "material-design-icons-iconfont";

// * Types
import {
  DynamicFilter,
  IGroupItem
} from "../../../interfaces/GroupWithChildren";

// * Util
import _ from "lodash";

// * Vuetify
import { VTextField } from "vuetify/lib";

export default {
  components: {
    SimpleModale,
    SpinalTable,
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: () => {
        return false;
      },
    },
  },

  data() {
    const nomenclatureController = new NomenclatureController();
    const modelFilter: { [key: string]: boolean } = {};
    const customFilter: { [key: string]: DynamicFilter } = {};
    const searchFilter: DynamicFilter[] = [];
    const categories: string[] = [];
    const roomsAvailable: Room[] = [];
    const headersTable = [
      {
        text: "Nom",
        align: "start",
        value: "name",
      },
      { text: "Type", align: "start", value: "type" },
    ];
    const selectedItems = [];
    const selectedFilterType: number = 0;
    const grpToDisplay: IGroupItem[][] = Array(3).fill([]);
    const selectedGrp: IGroupItem[][] = Array(3).fill(undefined);
    const searchModel: string = "";
    let newSelectedFilterItem: DynamicFilter = undefined;
    let showMenuConfFilter: boolean = false;
    let updateFilterMode: boolean = false;
    let updateMenuModel: boolean = false;
    let currentMode: string = "one";
    const dataTableHeight: number = 0;
    const validateButtonText: string = "Suivant";

    return {
      assignToMode: false,
      categories,
      customFilter,
      dataTableHeight,
      errorMessage: "",
      falseBool: false,
      grpToDisplay,
      headersTable,
      modelFilter,
      newSelectedFilterItem,
      nomenclatureController,
      searchModel,
      selectedGrp,
      showMenuConfFilter,
      searchFilter,
      selectedFilterType,
      selectedItems,
      itemsTree: [],
      tree: [],
      updateFilterMode,
      updateMenuModel,
      roomsAvailable,
      currentMode,
      validateButtonText,
    };
  },
  mounted() {
    this.initTableHeight();
    this.loadData();
    this.animSwitchMode();
  },
  methods: {
    animSwitchMode() {
      try {
        if (this.currentMode === "one") {
          this.$refs.firstView.classList.remove(
            "animate__animated",
            "animate__fadeInRight",
            "animate__faster"
          );
          this.$refs.firstView.classList.add(
            "animate__animated",
            "animate__fadeOutRight",
            "animate__faster"
          );
          setTimeout(() => {
            this.$refs.firstView.classList.remove(
              "animate__animated",
              "animate__fadeOutRight",
              "animate__faster"
            );
            this.$refs.firstView.classList.add(
              "animate__animated",
              "animate__fadeInLeft",
              "animate__faster"
            );
          }, this.delayAnimation * 1000);
        } else if (this.currentMode === "two") {
          this.$refs.firstView.classList.remove(
            "animate__animated",
            "animate__fadeInLeft",
            "animate__faster"
          );
          this.$refs.firstView.classList.add(
            "animate__animated",
            "animate__fadeOutLeft",
            "animate__faster"
          );
          setTimeout(() => {
            this.$refs.firstView.classList.remove(
              "animate__animated",
              "animate__fadeOutLeft",
              "animate__faster"
            );
            this.$refs.firstView.classList.add(
              "animate__animated",
              "animate__fadeInRight",
              "animate__faster"
            );
          }, this.delayAnimation * 1000);
        }
      } catch (err) {
        console.error(err);
      }
    },
    switchMode() {
      if (this.currentMode === "one") {
        this.currentMode = "two";
        this.validateButtonText = "Retour";
      } else if (this.currentMode === "two") {
        this.currentMode = "one";
        this.validateButtonText = "Suivant";
      }
    },
    close() {
      this.$emit("close");
    },
    closeFilterMenu() {
      this.newSelectedFilterItem = undefined;
      this.showMenuConfFilter = false;
      this.updateFilterMode = false;
      this.searchByFilter();
    },
    debounceUpdateSelected: _.debounce(
      function () {
        this.updateSelected();
      },
      0.6 * 1000,
      {
        leading: true,
      }
    ),
    updateFilter(filter: DynamicFilter) {
      this.newSelectedFilterItem = filter;
      this.updateFilterMode = true;
    },
    updateSelected() {
      if (this.$refs.spinalTable) {
        this.$refs.spinalTable.recomputeSelectedItems("dynamicId");
      } else {
        console.log("Spinal Table refs not defined", this.$refs);
      }
    },
    deleteFilterSearch(filter: DynamicFilter) {
      this.searchFilter = this.searchFilter.filter(
        (el) => el.name !== filter.name
      );
      this.searchByFilter();
    },
    // TODO Refacto
    generateFilterOutput(filter: DynamicFilter): string {
      const displayName: string = filter.displayName;
      const value: string = filter.value;

      if (filter.type === "number") {
        switch (filter.comparaison) {
          case "gt":
            return `${displayName} au dessus de ${value}`;
          case "lt":
            return `${displayName} en dessous de ${value}`;
          case "btw":
            return `${displayName} entre ${filter.min} et ${filter.max}`;
          case "eq":
            return `${displayName} égale à ${value}`;
          default:
        }
      } else if (filter.type === "string") {
        return `${displayName} contient ${value}`;
      }
      return "[Error] Une erreur est survenue ...";
    },
    initTableHeight() {
      this.dataTableHeight = this.$refs.bodyWrapper.clientHeight;
    },
    initCustomFilters() {
      for (const filter of this.nomenclatureController.filters) {
        if (!this.customFilter[filter.name] && filter.type === "number") {
          this.customFilter[filter.name] = filter;
        } else if (
          !this.customFilter[filter.name] &&
          filter.type === "string"
        ) {
          this.customFilter[filter.name] = filter;
        }
      }
      this.categories = [
        ...new Set(this.nomenclatureController.filters.map((el) => el.category)),
      ];
    },
    loadData() {
      this.nomenclatureController
        .loadData()
        .then((data) => {
          this.initCustomFilters();
          this.searchByFilter();
        })
        .then(() => this.nomenclatureController.reloadGroupToDisplay())
        .then((grp) => (this.grpToDisplay = grp))
        .then(() => (this.itemsTree = this.grpToDisplay?.[0]))
        .catch((err: any) => {
          console.error(err);
        });
    },
    updateNewSelectedFilter(filter: DynamicFilter) {
      this.newSelectedFilterItem = filter;
      this.showMenuConfFilter = true;
    },
    updateSelection(index) {
      let newGrps: IGroupItem[][] = [];

      this.nomenclatureController.selectItem(this.selectedGrp[index]);
      newGrps = this.nomenclatureController.reloadGroupToDisplay();
      this.grpToDisplay.splice(-1 * this.grpToDisplay.length);
      this.grpToDisplay.splice(0, newGrps.length, ...newGrps);
      if (this.grpToDisplay[0].length === 0) {
        this.selectedGrp[0] = undefined;
      }
      if (this.grpToDisplay[1].length === 0) {
        this.selectedGrp[1] = undefined;
      }
      if (this.grpToDisplay[2].length === 0) {
        this.selectedGrp[2] = undefined;
      }
    },
    saveFilter() {
      let indexTmp: number = 0;

      switch (this.selectedFilterType) {
        case 0:
          this.newSelectedFilterItem.comparaison = "gt";
          break;
        case 1:
          this.newSelectedFilterItem.comparaison = "lt";
          break;
        case 2:
          this.newSelectedFilterItem.comparaison = "btw";
          break;
        case 3:
          this.newSelectedFilterItem.comparaison = "eq";
          break;
        default:
      }
      if (this.updateFilterMode) {
        indexTmp = this.searchFilter.find(
          (el) => el.id === this.newSelectedFilterItem.id
        );
        this.searchFilter[indexTmp] = this.newSelectedFilterItem;
      } else {
        this.searchFilter.push({ ...this.newSelectedFilterItem });
      }
      this.closeFilterMenu();
    },
    searchByFilter() {
      let filters: DynamicFilter[] = [];

      for (const properties in this.customFilter) {
        if (this.modelFilter[properties]) {
          filters.push(this.customFilter[properties]);
        }
      }
      this.nomenclatureController
        .reloadRoomToDisplay(this.searchFilter)
        .then((data) => {
          this.roomsAvailable = data;
          this.$nextTick()
            .then(() => {
              this.updateSelected();
            })
            .catch((err: any) => {
              console.error(err);
            });
        })
        .catch((err: any) => {
          console.error(err);
        });
    },
    next() {
      this.switchMode();
      this.animSwitchMode();
    },
    addRoomsToGroup() {
      if (!this.selectedGrp[2]) {
        return;
      }
      this.nomenclatureController
        .commitChange(this.selectedItems, this.selectedGrp[2])
        .then(() => {
          console.log("Commited");
        })
        .catch((err: any) => {
          console.error(err);
        });
    },
  },
  computed: {
    avalaibleFilter: function () {
      if (!this.nomenclatureController?.filters) {
        return [];
      }
      return this.nomenclatureController.filters;
    },
    filteredRooms: function () {
      if (!this.roomsAvailable) {
        return [];
      }
      return this.roomsAvailable.filter((el) =>
        el.name.startsWith(this.searchModel)
      );
    },
  },
  watch: {
    customFilter: function (val) {
      console.log("customFilter = ", val);
    },
  },
};
</script>

<style lang="scss" scoped>
.content-wrapper {
  height: 70vh;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: hidden;

  .first-view {
    width: 100%;
    display: grid;
    grid-template-rows: 0.6fr 3fr 0.1fr;
    grid-template-columns: 1fr;
    row-gap: 0em;
    column-gap: 0em;

    .body-wrapper {
      height: 100%;
      max-height: 100%;
    }

    .action-wrapper {
      .search-wrapper {
        width: 20em;
      }
    }

    .footer-wrapper {
    }
  }

  .bg-red {
    background: red;
  }

  .second-view {
    display: block;
    height: 100%;
    width: 100%;
    column-gap: 1em;

    .select-grid {
      order: -1;
      display: flex;
      flex-direction: column;

      v-select {
        margin-top: 2em;
      }
    }

    .group-picker-wrapper {
      order: 1;
      height: fit-content;
    }

    .recap {
      border: 0.2em dashed rgba(0, 0, 0, 0.3);
      height: 97%;
      display: grid;
      grid-template-rows: 1fr 4fr 1fr;

      .header {
      }

      .body {
        font-family: "Charlevoix";

        .assignation,
        .application {
          padding-left: 2em;
        }

        .assignation {
          .assignation-table {
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-template-rows: 1fr 1fr 1fr;
            row-gap: 0.8em;

            .text-wrapper {
              display: flex;
              justify-items: flex-start;
              align-items: flex-end;
            }

            .select-wrapper {
              width: 15em;
            }
          }
        }

        .bg-black {
          background-color: rgb(0, 0, 0);
          color: white;
          padding: 0.2em;
          border-radius: 0.4em;
        }

        .underlined {
          text-decoration: underline 0.1em black;
        }
      }

      .footer {
      }
    }
  }
}

.search-bar-wrapper {
  display: grid;
  grid-template-columns: 3fr 1fr;
  row-gap: 0px;
  column-gap: 0px;
  background-color: rgb(0, 255, 208);

  .text-field-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .button-wrapper {
    background-color: green;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}

.filter-wrapper {
}
</style>
../../../interfaces/GroupWithChildren