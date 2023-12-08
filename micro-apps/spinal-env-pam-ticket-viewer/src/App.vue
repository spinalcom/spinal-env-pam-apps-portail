<!--
Copyright 2021 SpinalCom - www.spinalcom.com

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
  <v-app>
    <div class="selectors">
      <sc-download-button
        :fileName="'hello'"
        :data="[{}]"
        class="mr-2"
      ></sc-download-button>

      <div class="space">
        <space-selector
          ref="space-selector"
          :open.sync="openSpaceSelector"
          :maxDepth="2"
          :GetChildrenFct="onSpaceSelectOpen"
          v-model="selectedZone"
          label="ESPACE"
          :spaceSelectorItemButtons="spaceSelectorButtons"
          @onActionClick="onActionClick"
        />
      </div>
    </div>

    <div
      style="
        height: calc(100% - 90px);
        width: calc(100% - 16px);
        margin-top: 80px;
      "
      class="d-flex flex-row justify-space-between mx-2"
    >
      <viewerApp
        style="height: 100%; width: calc(60% - 2px)"
        class="rounded-lg"
      ></viewerApp>
      <v-card
        elevation="4"
        style="height: 100%; width: calc(40% - 2px); background-color: #f9f9f9"
        class="rounded-lg pa-1"
        v-if="loaded"
      >
        <div class="detail_header">
          <div class="title_date">
            <div class="_title">{{ config.title }}</div>
            <!--<div class="date">Date picker</div>-->
          </div>
          <div class="gradient_content">
            <div class="color"></div>
          </div>
          <!-- <div class="calcul_content">calcul div</div> -->
        </div>

        <div style="height: 100%">
          <ticket-table
            :spaceIds="spacesIds"
            @display="showDetails"
            @locate="locateTicket"
          ></ticket-table>
        </div>
      </v-card>
      <sc-loading-card
        v-else
        style="height: 100%; width: calc(40% - 2px)"
      ></sc-loading-card>

      <!--Dialog box to display the details of the tcket-->
      <sc-ticket-detail
        v-if="detailedTicket"
        style="z-index: 99"
        v-model="showDialog"
        :detailedTicket="detailedTicket"
        :baseURL="baseURL"
        :token="token"
      ></sc-ticket-detail>
    </div>
  </v-app>
</template>

<script lang="ts">
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from "./components/SpaceSelector/index";
import { Vue } from "vue-property-decorator";
import { ActionTypes } from "./interfaces/vuexStoreTypes";
import { ActionTypes as TicketActions } from "./services/store/ticketDataStore/actions";
import Component from "vue-class-component";
import type { Store } from "./services/store";
import { MutationTypes } from "./services/store/appDataStore/mutations";
import type {
  IButton,
  IZoneItem,
  TGeoItem,
} from "./components/SpaceSelector/interfaces/IBuildingItem";
import viewerApp from "./components/viewer/viewer.vue";
import { ViewerButtons } from "./components/SpaceSelector/spaceSelectorButtons";
import { config } from "./config";
import { IConfig } from "./interfaces/IConfig";
import GroupDataView from "./components/groupDataView.vue";
import TicketTable from "./components/ticketTable.vue";
import { HTTP } from "./services/spinalAPI/ticket/http-constants";
const buildingId = localStorage.getItem("idBuilding");
const token = localStorage.getItem("token");

interface IItemData {
  platformId: string;
  id: number | number[];
}
interface IItemDatatmp {
  platformId: string;
  id: Set<number>;
}

@Component({
  components: {
    SpaceSelector,
    viewerApp,
    GroupDataView,
    TicketTable,
  },
})
class App extends Vue {
  $store: Store;
  openSpaceSelector = false;
  openTemporalitySelector = false;
  config: IConfig = config;
  spaceSelectorButtons: IButton[] = ViewerButtons[config.viewButtons];
  loaded = false;
  detailedTicket = null;
  baseURL = `${HTTP.getUri()}/building/${buildingId}/node`;
  token = token;
  showDialog = false;
  spacesIds = <number[]>[];

  showDetails(ticket) {
    this.detailedTicket = ticket;
    this.showDialog = true;
  }

  locateTicket(ticket) {
    this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, {
      ...ticket.elementSelected,
      buildingId,
    });
    /*this.$store.dispatch(ActionTypes.SELECT_ITEMS, {
      ...ticket.elementSelected,
      buildingId,
    });*/
  }

  $refs: { spaceSelector };

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
  }

  async mounted() {
    await this.$store.dispatch(TicketActions.LOAD_TICKETS);
    this.loaded = true;
    await this.$store.dispatch(TicketActions.SET_BUILDING_TICKETS);
  }

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    switch (item?.type) {
      case undefined:
        const buildingId = localStorage.getItem("idBuilding");
        const promises = [
          this.$store.dispatch(ActionTypes.GET_BUILDING_BY_ID, { buildingId }),
          this.$store.dispatch(ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS, {
            buildingId,
          }),
        ];
        const [building] = await Promise.all(promises);
        return [
          {
            name: building.name,
            staticId: building.id,
            categories: [],
            color: "#35CAE5",
            dynamicId: 0,
            type: "building",
          },
        ];
      case "building":
        return await this.$store.dispatch(ActionTypes.GET_FLOORS, {
          buildingId: item.staticId,
          patrimoineId: item.patrimoineId,
        });
      case "geographicFloor":
        //@ts-ignore
        return await this.$store.dispatch(ActionTypes.GET_ROOMS, {
          floorId: item.staticId,
          buildingId: item.buildingId,
          patrimoineId: item.patrimoineId,
          id: item.dynamicId,
        });
      default:
        return [];
    }
  }

  onActionClick({ button, item }) {
    const data = {
      buildingId: item.buildingId,
      staticId: item.staticId,
      id: item.dynamicId,
      dynamicId: item.dynamicId,
      floorId: item.floorId,
      roomId: item.roomId,
      type: item.type,
    };

    switch (button.onclickEvent) {
      case ActionTypes.OPEN_VIEWER:
        this.$store.dispatch(button.onclickEvent, {
          onlyThisModel: true,
          item: data,
        });
        this.spacesIds = [data.dynamicId];
        break;
      case "OPEN_VIEWER_PLUS":
        this.$store.dispatch(ActionTypes.OPEN_VIEWER, {
          onlyThisModel: false,
          item: data,
        });
        this.spacesIds.push(data.dynamicId);
        break;
      case ActionTypes.UNLOAD_MODEL:
        this.$store.dispatch(button.onclickEvent, data);
        this.spacesIds = this.spacesIds.filter((t) => t !== data.dynamicId);
        break;
      case ActionTypes.FIT_TO_VIEW_ITEMS:
      case ActionTypes.SELECT_ITEMS:
      case ActionTypes.ISOLATE_ITEMS:
        this.$store.dispatch(button.onclickEvent, data);
        this.spacesIds = [data.dynamicId];
        break;
      default:
        this.$store.dispatch(button.onclickEvent, data);
        break;
    }
  }
}

export default App;
</script>

<style scoped>
.selectors {
  position: absolute;
  display: flex;
  justify-content: flex-end;
  top: 5px;
  right: 5px;
  height: 60px;
  width: 100%;
  /* background: #14202c; */
  /*border: 1px solid #f5f5f5;*/
  border-radius: 12px;
}

.selectors .space {
  position: relative;
  /* right: 0px;
  top: -1px; */
  width: 40%;
  height: 60px;
}

.appContainer {
  height: calc(100% - 90px);
  margin: 80px 8px 0 8px;
}

.appContainer .viewerContainer {
  width: 60%;
  height: 100%;
}

.appContainer .dataContainer {
  width: calc(40% - 5px);
  height: 100%;
  float: right;
  border-radius: 10px;
}

.appContainer .dataContainer .detail_header {
  width: 100%;
  padding: 5px;
}

.appContainer .dataContainer .detail_header .title_date {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.appContainer .dataContainer .detail_header .title_date ._title {
  max-width: 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  font-size: 0.8em;
}
.appContainer .dataContainer .detail_header .title_date .date {
}

gradient_content calcul_content .appContainer .dataContainer .detail_container {
  width: 100%;
  height: calc(100% - 150px);
  background: green;
  overflow: auto;
}
</style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: transparent;
  height: 100%;
  width: 100%;
}

html {
  overflow-y: hidden !important;
  background: transparent;
}

body {
  margin: 0;
  width: 100%;
  height: 100vh;
  overflow-y: hidden;
  background: transparent;
}

.app-content {
  width: calc(100% - 16px);
  height: calc(100% - 80px);
  overflow-y: hidden;
  display: flex;
  position: relative;
  margin: 80px 8px 8px 8px;
}
.list-container {
  overflow-y: auto;
  height: calc(100% - 51px);
  padding: 8px;
}

.spinal-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.spinal-scrollbar::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: rgba(169, 169, 169, 0.9);
}
.spinal-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
</style>
