<template>
  <SimpleModale modaleTitle="Nomenclature" :show-dialog="showModal" width="50%" persistent :error-message="errorMessage"
    v-on:save="next" v-on:close="close" :validateButtonText="validateButtonText">
    <template v-slot:body>
      <v-row class="content-wrapper px-8" ref="firstView">
        <Nomenclature :headersTable="headersTable" :selectedItems="selectedItems" v-if="currentMode === 'one'">
        </Nomenclature>
        <div class="second-view px-4" v-if="currentMode === 'two'">
          <div class="recap pa-8">
            <div class="header text-uppercase text-h6 font-weight-bold">
              Recapitulatif
            </div>
            <div class="body">
               <div class="body-1">
                Assignation de
                <span class="bg-black">
                  <span> {{ (searchFilter && searchFilter.length) || 0 }} </span> 
                  pièce 
                  <span v-if="selectedItems && selectedItems.length > 1"> s </span>
                </span>
              </div>à
              <div class="assignation mt-2">
                <div class="assignation-table">
                  <div class="text-wrapper">
                    <span>Au groupe de <span class="underlined">contexte</span>:
                    </span>
                  </div>
                  <div class="select-wrapper">
                    <v-select :items="grpToDisplay[0]" dense width="100%" @change="updateSelection(0)"
                      v-model="selectedGrp[0]" return-object item-text="title" label="Groupe de contexte" outlined
                      hide-details></v-select>
                  </div>
                  <div class="text-wrapper">
                    <span>Au groupe de <span class="underlined"> catégorie</span>:
                    </span>
                  </div>
                  <div class="select-wrapper">
                    <v-select v-if="selectedGrp[0]" :items="grpToDisplay[1]" @change="updateSelection(1)" dense
                      v-model="selectedGrp[1]" return-object item-text="title" label="Groupe de catégorie" outlined
                      hide-details></v-select>
                  </div>
                  <div class="text-wrapper">
                    <span>Au groupe de <span class="underlined">groupe</span>:
                    </span>
                  </div>
                  <div class="select-wrapper">
                    <v-select v-if="selectedGrp[1]" :items="grpToDisplay[2]" @change="updateSelection(2)" dense
                      v-model="selectedGrp[2]" return-object item-text="title" label="Groupe de groupe" outlined
                      hide-details></v-select>
                  </div>
                </div>
                <ul>
                </ul>
              </div>
              <div class="body-1 mt-4">
                Application de
                <span class="bg-black">
                  <span> {{ searchFilter.length || 0 }} </span>filtre<span v-if="searchFilter && searchFilter.length > 1">s</span>
                </span>
                <div class="application">
                  <v-chip class="mr-4 mb-2 mt-2 elevation-2" v-for="filter in searchFilter" label>{{
    generateFilterOutput(filter) }}</v-chip>
                </div>
              </div>
            </div>
            <div class="footer d-flex justify-end align-end">
              <v-btn class="primary" v-if="selectedGrp[0] &&
    selectedGrp[1] &&
    selectedGrp[2] &&
    selectedItems.length > 0
    " @click="addRoomsToGroup()" width="inherit">
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
import { NomenclatureController } from "../../../controllers";

// * Components
import Nomenclature from "../Nomenclature/Nomenclature.vue"
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
// import { VBtn } from "vuetify/lib";
// import { VChip } from "vuetify/lib";
// import { VIcon } from "vuetify/lib";
// import { VSelect } from "vuetify/lib";

export default {
  components: {
    Nomenclature,
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
    next() {
      this.switchMode();
      this.animSwitchMode();
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

    .footer-wrapper {}
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

      .header {}

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

      .footer {}
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

.filter-wrapper {}
</style>
../../../interfaces/GroupWithChildren