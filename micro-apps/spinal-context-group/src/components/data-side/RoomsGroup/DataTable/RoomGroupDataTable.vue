<template>
  <div class="data-table-wrapper" ref="dataTableWrapper">
    <v-data-table
      class="secondary"
      v-if="!showRadar"
      ref="dataTable"
      :loading="isLoadingData"
      v-model="selectedRow"
      :headers="headersTable"
      :items-per-page="10"
      :items="filteredData"
      loading-text="En cours de chargement ..."
      :hide-default-footer="data&&data.length < 10"
      fixedHeader
      :height="dataTableHeight"
    >
      <template v-slot:body="{ items, headers }">
        <tbody
          name="list"
          is="transition-group"
          v-if="items.length > 0 && grpRoomFocus === 'GrpRoomList'"
        >
          <tr
            v-for="item in items"
            :key="item.id"
            @click="selectItem(item, 'item')"
          >
            <td class="cursor-pointer">
              <div
                class="font-weight-bold d-flex flex-row justify-start align-center"
              >
                {{ item.title }}
              </div>
            </td>
            <td>
              <div class="gain-cell d-flex flex-row justify-end align-center">
                <div class="arrow-svg" v-if="item.gainKpi.value > 0">
                  <v-icon color="green">mdi-arrow-top-right-thick</v-icon>
                </div>
                <div class="arrow-svg" v-if="item.gainKpi.value < 0">
                  <v-icon color="red">mdi-arrow-bottom-right-thick</v-icon>
                </div>
                <div
                  class="greyed"
                  v-if="item.gainKpi.value > 0 || item.gainKpi.value < 0"
                >
                  <span v-if="unitMode === 'percentage'">
                    {{ item.gainKpi.percentage.toFixed(2) }} %
                  </span>
                  <span v-if="unitMode === 'm2'">
                    {{ item.gainKpi.value.toFixed(2) }} m2
                  </span>
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex flex-row justify-end align-center">
                <v-chip
                  class="ma-2 primary"
                  text
                  outlined
                  label
                  v-if="getOperationsItem(item, 'ToAssign')"
                >
                  + {{ getOperationsItem(item, "ToAssign") }}
                </v-chip>
                <v-chip
                  class="ma-2 primary"
                  label
                  v-if="getOperationsItem(item, 'ToDeAssign')"
                >
                  - {{ getOperationsItem(item, "ToDeAssign") }}
                </v-chip>
              </div>
            </td>
            <td>
              <div class="greyed d-flex justify-end align-center">
                {{
                  item && item.children
                    ? item.children.filter(room => 
                        room.operations !== "ToDeAssign" &&
                        (!isFilter || room.floorId === selectedFloorId)
                      ).length
                    : 0
                }}
              </div>
            </td>
            <td>
              <div class="greyed d-flex justify-end align-center">
                {{ item.area.toFixed(2) }}
              </div>
            </td>
          </tr>
        </tbody>
        <tbody
          name="list"
          is="transition-group"
          v-if="items.length > 0 && grpRoomFocus === 'GrpRoom'"
        >
          <tr
            v-for="item in items"
            :key="item.id"
            @click="selectItem(item, 'item')"
          >
            <td>
              <div class="bold-cell">
                <span v-if="!item.display" class="bold-darkgreyed"
                  >[Supprime]</span
                >
                <span
                  v-if="grpRoomFocus === 'GrpRoom'"
                  :style="createStyleTitle(item)"
                  class="chip-legend-item"
                >
                </span>
                {{ item.title }}
              </div>
            </td>
            <td>
              <div class="d-flex justify-start align-center def-size">
                {{ item.grandParentTitle }}
              </div>
            </td>
            <td>
              <div class="d-flex justify-start align-center">
                {{ item.parentTitle }}
              </div>
            </td>
            <td>
              <div class="d-flex justify-end align-center">
                {{ item.floorName }}
              </div>
            </td>
            <td>
              <div class="d-flex justify-end align-center font-weight-bold">
                {{ item.area.toFixed(2) }}
              </div>
            </td>
            <td>
              <div class="d-flex justify-end align-center">
                <v-menu offset-y transition="slide-y-transition">
                  <template #activator="{ on: menu, attrs }">
                    <v-tooltip top>
                      <template v-slot:activator="{ on: tooltip }">
                        <v-btn
                          icon
                          v-on="{ ...tooltip, ...menu }"
                          v-bind="attrs"
                        >
                          <v-icon color="greyed">mdi-menu</v-icon>
                        </v-btn>
                      </template>
                      <span>Menu</span>
                    </v-tooltip>
                  </template>
                  <v-list>
                    <v-list-item
                      @click="restore(item)"
                      v-if="item.operations === 'ToDeAssign'"
                    >
                      <v-list-item-icon>
                        <v-icon>mdi-reload</v-icon></v-list-item-icon
                      >
                      <v-list-item-title>Retablir</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      @click="deleteEntity(item, 'menu')"
                      v-if="item.operations !== 'ToDeAssign'"
                    >
                      <v-list-item-icon>
                        <v-icon>mdi-delete</v-icon></v-list-item-icon
                      >
                      <v-list-item-title>Supprimer</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
// * Controllers
import { GroupRoomWithChildrenController } from "../../../../controllers/GroupeWithChildren";

// * Interfaces
import { IGroupRoomItem } from "@/interfaces/GroupWithChildren";

// * Types
import { type UnitMode, type ViewMode } from "../Type";
import { type GroupRoomFocus } from "../../../../services/GroupeWithChildren/Interfaces";

// * Vue
import { TransitionGroup } from "vue";

export default {
  data() {
    return {
      selectedRow: [],
      delayAnimation: 0.2,
    };
  },
  props: {
    data: {
      type: Array<Object>,
      default: () => {
        return [];
      },
    },
    showRadar: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    isLoadingData: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    grpRoomFocus: {
      type: String,
      default: () => {
        return;
      },
      validator: (value: string) => {
        return ["GrpRoomList", "GrpRoom"].includes(value);
      },
    },
    headersTable: {
      type: Array<Object>,
      required: true,
      default: () => {
        return [];
      },
    },
    dataTableHeight: {
      type: Number,
      required: true,
      default: () => {
        return 200;
      },
    },
    unitMode: {
      type: String,
      required: true,
      default: () => {
        return "m2";
      },
    },

    isFilter: {
      type: Boolean,
      required: true,
      default: () => {
        return false;
      },
    },

    selectedFloorId: {
      type: Number,
      required:true,
      default: () => {
        return -1;
      },
    }
    


    
  },
  methods: {
    animDataTable() {
      try {
        if (this.grpRoomFocus === "GrpRoom") {
        
          this.$refs.dataTable.$el.classList.add(
            "animate__animated",
            "animate__fadeOutRight",
            "animate__faster"
          );
          setTimeout(() => {
      
            this.$refs.dataTable.$el.classList.add(
              "animate__animated",
              "animate__fadeInLeft",
              "animate__faster"
            );
          }, this.delayAnimation * 1000);
        } else if (this.grpRoomFocus === "GrpRoomList") {
          this.$refs.dataTable.$el.classList.add(
            "animate__animated",
            "animate__fadeOutLeft",
            "animate__faster"
          );
          setTimeout(() => {
            this.$refs.dataTable.$el.classList.add(
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
    selectItem(item, ctx) {
      this.$emit("selectItem", item, ctx);
    },
    getOperationsItem(item, operation) {
      let value: number = 0;

      if (item.operations.length === 0) {
        return 0;
      }
      value = item.children?.reduce(
        (acc: number, el: IGroupRoomItem) =>
          acc + (el.operations === operation ? 1 : 0),
        0
      );
      if (operation === "ToAssign") {
        value += item.children?.reduce(
          (acc: number, el: IGroupRoomItem) =>
            acc + (el.operations === "ToReAssign" ? 1 : 0),
          0
        );
      }
      return value;
    },
    guessItemColor(item) {
      let val = GroupRoomWithChildrenController.guessItemColor(item.operations);
      return val;
    },
    restore(item) {
      this.$emit("restore", item);
    },
    deleteEntity(item, ctx) {
      console.log('emiting deleteEntity')
      this.$emit("deleteEntity", item, ctx);
    },
    createStyleTitle(item) {
      return {
        background: this.guessItemColor(item),
        height: "2em",
      };
    },
  },

  computed: {
    filteredData() {
      console.log("is filter ",this.isFilter)
      if (this.data.length > 0 && this.isFilter) {
        // if(this.grpRoomFocus === "GrpRoomList"){
        //   let filteredGroups = this.data?.map(grp => ({
        //   ...grp,
        //     children: grp.children.filter(child => child.floorId === this.selectedFloorId)
        //     }));
        //   return filteredGroups
        // }
        if(this.grpRoomFocus === "GrpRoom"){
          return this.data.filter(room => room.floorId === this.selectedFloorId)
        }
      }
     return this.data;
    }
  }
};
</script>

<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.8s;
}

// .list-enter,
// .list-leave-to {
//   opacity: 0;
//   transform: translateY(100%);
//   position: absolute;
// }

.list-move {
  transition: transform 0.5s;
}

.item-row {
  display: table-row;
}

.chip-legend-item {
  width: 0.5em;
  height: 3em;
  position: absolute;
  top: calc(50% - (2em / 2));
  left: -14px;
  border-radius: 0.5em;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bold-cell {
  font-weight: 900;
  position: relative;
}

.greyed {
  color: var(--mdc-theme-primary) !important;
  opacity: 0.35;
  background-color: transparent !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
