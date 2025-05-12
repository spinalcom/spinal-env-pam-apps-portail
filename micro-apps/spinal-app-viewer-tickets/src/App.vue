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
  <v-app v-if="pageSate === PAGE_STATES.loaded" class="app">
    <div class="selectors">
      <sc-download-button fileName="ticket_data" :data="to_download" csv class="mr-2 DButton"></sc-download-button>
      <div class="space">
        <space-selector ref="space-selector" :open.sync="openSpaceSelector" :maxDepth="2"
          :GetChildrenFct="onSpaceSelectOpen" v-model="selectedZone" label="ESPACE"
          :spaceSelectorItemButtons="spaceSelectorButtons" :viewButtonsType="config.viewButtons"
          @onActionClick="onActionClick" />
      </div>
    </div>


    <div class="dataBody">
      <viewerApp :class="{ 'active3D': isActive3D }" class="viewerContainer"></viewerApp>
      <dataSideApp ref="dataSideApp" class="appContainer" :DActive="isActive3D" :ActiveData="isActive"
        :refrech="refrech" :config="config" :ticketConfig="ticketConfig" :baseURL="baseUrl" :token="token"
        :selectedZone="selectedZone" :data="displayedData" @changeRoute="changeApp"
        @updateBuildingTickets="updateBuildingTicketNumber" :selectedId="selectedId" :buildingInfo="buildingInfo"
        @clickOnDataView="onDataViewClicked" @display="showDetails" @download="downloadList"
        @buttonClicked="toggleActive" @buttonClicked3D="toggleActive3D" @full3D="full3D()"
        @reloadRequested="callReloadOnDataSideApp" :class="{ 'active': isActive, 'inactive': isActive3D }"
        @floorData="updateSpriteData" style="z-index: 10!important;">
      </dataSideApp>
    </div>

    <sprite-component v-if="selectedZone && selectedZone.type === 'geographicFloor'" :data="spriteData"
      type="geographicFloor" style="
        position: absolute;
        z-index: 9;
        left: calc(55%);
        top: 50%;
        width: 35px;
      "></sprite-component>
    <sprite-component v-else :data="spriteData" type="geographicBuilding" style="
        position: absolute;
        z-index: 9;
        left: calc(55%);
        top: 50%;
        width: 35px;
      "></sprite-component>

    <ticketDetails v-if="detailedTicket" style="z-index: 99" v-model="showDialog" @changeRoute="handleRouteChange"
      @reloadRequested="callReloadOnDataSideApp" :detailed-ticket="detailedTicket" :token="token" :baseURL="baseUrl"
      :config="ticketConfig"></ticketDetails>
  </v-app>

  <v-container class="loading" v-else-if="pageSate === PAGE_STATES.loading" fluid>
    <v-progress-circular :size="70" :width="3" color="purple" indeterminate></v-progress-circular>
  </v-container>
</template>

<script lang="ts">
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from "./components/SpaceSelector/index";
// import { ISpaceSelectorItem, SpaceSelector } from "../../../global-components/SpaceSelector/index";
import { Vue, Watch } from "vue-property-decorator";
import { ActionTypes } from "./interfaces/vuexStoreTypes";
import Component from "vue-class-component";
import type { Store } from "./services/store";
import { MutationTypes } from "./services/store/appDataStore/mutations";
import type {
  IButton,
  IZoneItem,
  TGeoItem,
} from "./components/SpaceSelector/interfaces/IBuildingItem";
import viewerApp from "../../../global-components/viewer/viewer.vue";
import { ViewerButtons } from "./components/SpaceSelector/spaceSelectorButtons";
import { config } from "./config";
import { ticketConfig } from "./config";
import { IConfig } from "./interfaces/IConfig";
import { PAGE_STATES } from "./interfaces/pageStates";
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";
import { Legend } from "./interfaces/ILegend";

import dataSideApp from "./components/data-side/App.vue";
import ticketDetails from "./components/data-side/TicketDetailsNew.vue";
import LegendVue from "./components/data-side/components/LegendVue.vue";
import SpriteComponent from "./components/data-side/FloorSpriteComponent.vue";
import { SpinalAPI } from "./services/spinalAPI/SpinalAPI";
import { log } from "console";
import { EventBus } from './components/SpaceSelector/eventBus';
import { convertZonesToISpaceSelectorItems } from './components/SpaceSelector/convertZonesToISpaceSelectorItems';
const COLORS = ["#FF0000", "#FFA500", "#008000"];
const buildingId = localStorage.getItem("idBuilding") || "";
const token = localStorage.getItem("token") || "";

@Component({
  components: {
    SpaceSelector,
    viewerApp,
    dataSideApp,
    SpriteComponent,
    ticketDetails,
    LegendVue,
  },
})
class App extends Vue {
  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  $store: Store;
  openSpaceSelector: boolean = false;
  openTemporalitySelector: boolean = false;
  buildingInfo: any = {};
  buildingTicketNumber: number = 0;
  config: IConfig = config;
  ticketConfig: Object = ticketConfig;
  spaceSelectorButtons: IButton[] = ViewerButtons[config.viewButtons];
  reloadInterval: number;
  dataTable: IZoneItem[] = [];
  $refs: { spaceSelector, dataSideApp: InstanceType<typeof dataSideApp> };
  isActive: boolean = false;
  isActive3D: boolean = false;
  detailedTicket = null;
  showDialog = false;
  token: String = token;
  baseUrl: String = "";
  spriteData: any = {};
  to_download = <any[]>[];
  query: { app: string; mode: string; name: string; spaceSelectedId: string; buildingId: string; type: string } = {
    app: '',
    mode: 'null',
    name: '',
    spaceSelectedId: '',
    buildingId: '',
    type: ''
  };
  floor: any = null;
  refrech: boolean = false;
  fullBuildingData: any[] = [];

  showDetails(ticket) {
    this.detailedTicket = ticket;
    this.showDialog = true;
  }
  changeSpaceSelectorValue(ValueItem) {
    const itemToSelect = {
      "isOpen": false,
      "loading": false,
      "dynamicId": ValueItem.dynamicId,
      "name": ValueItem.floorName,
      "buildingId": ValueItem.buildingId,
      "type": "geographicFloor",
    }

    if (this.$refs['space-selector']) {
      this.$refs['space-selector'].select(itemToSelect);
    }
    this.onActionClick({ button: { onclickEvent: ActionTypes.OPEN_VIEWER }, item: ValueItem });
  }

  async mounted() {

    const promises = [
      this.$store.dispatch(ActionTypes.GET_BOS_BUILDING, { buildingId })
    ];

    const [building] = await Promise.all(promises);
    console.log("building", building);


    if (building) {
      const { name, type, id } = building;
      this.buildingInfo = { name, type, buildingId, patrimoineId: 0 };
    }
    await this.fetchFullBuildingData();
    localStorage.setItem("viewer_loaded", 'initialize');
    if (window.innerWidth < 900) {

      this.isActive = true;
      this.isActive3D = false;
    }
    EventBus.$on("change-space-selecor-value", this.changeSpaceSelectorValue);

    EventBus.$on('colorRoom', (dynamicId, color) => {
      const buildingId = localStorage.getItem("idBuilding");
      const itemsToColor = [{
        buildingId: buildingId,
        color: color || "#24CBD9",
        dynamicId: dynamicId,
        floorId: this.$store.state.appDataStore.zoneSelected.dynamicId,
      }]

      const statviewer = localStorage.getItem("viewer_loaded");
      if (statviewer == "loaded") {
        this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
          items: itemsToColor,
          buildingId: buildingId,
        });
      }

    });


    EventBus.$on('descolorRoom', (dynamicId) => {
      const buildingId = localStorage.getItem("idBuilding");

      const itemsToColor = [{
        buildingId: buildingId,
        color: null,
        dynamicId: dynamicId,
        floorId: this.$store.state.appDataStore.zoneSelected.dynamicId,
      }]

      this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
        items: itemsToColor,
        buildingId: buildingId,
      });

    });

    const item = {
      buildingId: localStorage.getItem("idBuilding"),
      dynamicId: 0,
      parents: [],
      type: "building",
      patrimoineId: "0",
    }
    const newitem = await this.$store.dispatch(ActionTypes.GET_BUILDING_REFERENCE_OBJECTS, {
      buildingId: buildingId,
      patrimoineId: 0,
    })
    newitem.buildingId = item.buildingId;
    newitem.type = item.type;
    this.onActionClick({ button: { onclickEvent: ActionTypes.OPEN_VIEWER }, item: newitem });

    // this.setSelectedZoneBuilding();

    try {
      this.pageSate = PAGE_STATES.loading;
      this.listenSpritesEvent();
      this.pageSate = PAGE_STATES.loaded;
      this.baseUrl = SpinalAPI.getInstance().createUrlWithPlatformId(
        buildingId,
        "node"
      );
    } catch (error) {
      this.pageSate = PAGE_STATES.error;
    }
    this.$nextTick(() => {
      // this.query.app = "eyJuYW1lIjoiVGlja2V0cyIsInR5cGUiOiJCdWlsZGluZ0FwcCIsImlkIjoiYmE5YS0wYzY4LTIzNmUtMTk0ODk4NjMwMTgiLCJkaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzM3NDc0MDcyNjQ0LCJpbmRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3Mzc0NzQwNjAzMTIsImljb24iOiJtZGktdGlja2V0IiwiZGVzY3JpcHRpb24iOiIiLCJ0YWdzIjpbXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtYXBwLXZpZXdlci10aWNrZXRzIiwiaXNFeHRlcm5hbEFwcCI6ZmFsc2UsImxpbmsiOiIiLCJkb2N1bWVudGF0aW9uTGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiMzU4My0zNWQzLWEzM2QtMTkyMWYwZDRiNGIifX0"
      // window.parent.router.query.app = this.query.app
      const currentQuery = { ...window.parent.routerFontion.apps[0]._route.query }
      this.applyURLParam(currentQuery);
    });

  }
  beforeDestroy() {
    EventBus.$off("change-space-selecor-value", this.changeSpaceSelectorValue);
  }
  updateBuildingTicketNumber(count) {
    this.buildingTicketNumber = count;
  }

  changeApp(e) {
    this.query.app = e
    this.changeRoute();
  }
  callReloadOnDataSideApp() {
    if (this.$refs.dataSideApp && this.$refs.dataSideApp.startReload) {
      this.$refs.dataSideApp.startReload();
    } else {
      console.warn("startReload not available in dataSideApp");
    }
  }

  applyURLParam(query) {
    this.refrech = true;
    this.query.mode = query.mode
    this.query.buildingId = query.buildingId
    this.query.spaceSelectedId = query.spaceSelectedId
    this.query.name = query.name
    this.query.app = query.app
    this.query.type = query.type
    if (query.mode == "3d") {
      this.isActive3D = true
    } else if (query.mode == "data") {
      this.isActive = true
    }

    if (query.spaceSelectedId) {

      const item = {
        buildingId: query.buildingId,
        dynamicId: query.spaceSelectedId,
      };
      const button = {
        "title": "charger",
        "icon": "mdi-video-3d",
        "onclickEvent": "OPEN_VIEWER",
        "isShownTypes": [
          query.type
        ]
      }
      this.onActionClick({ button, item })


      const itemToSelect = {
        isOpen: false,
        loading: false,
        dynamicId: parseInt(query.spaceSelectedId),
        name: query.name,
        buildingId: query.buildingId,
        type: query.type,
      };

      if (this.$refs['space-selector']) {
        this.$refs['space-selector'].select(itemToSelect);
      }
    }
    this.openSpaceSelector = false;

  }
  changeRoute() {
    window.parent.routerFontion.customPush(
      window.parent.router.path,
      this.query
    );
  }
  replaceRoute() {
    window.parent.routerFontion.customReplace(
      window.parent.router.path,
      this.query
    );
  }
  // handleRouteChange(route) {
  //   this.query.spaceSelectedId = route.dynamicId
  //   this.query.name = route.name
  //   this.changeRoute()
  // }
  handleRouteChange() {
    if (this.isActive3D && !this.isActive) {
      this.query.mode = "3d";
    } else if (!this.isActive3D && this.isActive) {
      this.query.mode = "data";
    } else {
      this.query.mode = "none";
    }
    this.replaceRoute();
  }

  // changeRoute() {
  //   window.parent.routerFontion.customPush(window.parent.router.path, this.query);
  // }

  public get selectedId(): number {
    return this.$store.state.appDataStore.itemSelected?.dynamicId || 0;
  }

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    if (this.query.spaceSelectedId != v.dynamicId.toString()) {
      this.query.name = v.name;
      this.query.buildingId = v.buildingId;
      this.query.spaceSelectedId = v.dynamicId.toString();
      this.query.type = v.type;
      this.replaceRoute();
    }

    if (v.type == "geographicFloor") this.floor = this.query.spaceSelectedId;

    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
  }



  toggleActive() {
    if (this.isActive3D) {
      this.isActive3D = false
    }
    this.isActive = !this.isActive;
    this.handleRouteChange();
  }


  toggleActive3D() {
    if (this.isActive)
      this.isActive = false
    this.isActive3D = !this.isActive3D;
    this.handleRouteChange();
  }

  full3D() {
    if (this.isActive) {
      this.isActive = false
      this.isActive3D = true;
    } else {
      this.isActive = true
      this.isActive3D = false
    }


    this.handleRouteChange();
  }





  downloadList(tickets) {
    this.to_download = tickets.map((t) => {
      return {
        Nom: t.name,
        "Date de création": new Date(t.creationDate).toLocaleDateString("fr"),
        Étape: t.step.name,
        Domaine: t.process.name,
        Déclarant: t.userName || "Unknown",
        bosId: t.staticId,
        gmaoId: t.gmaoId,
        description: t.description,
        targetName: t.elementSelected?.name || "",
        targetId: t.elementSelected?.staticId || 0,
      };
    });
  }

  async fetchFullBuildingData() {
    try {
      const buildingId = localStorage.getItem("idBuilding");
      const result = await this.$store.dispatch(ActionTypes.LOAD_TICKETS, {
        buildingId,
        config: this.config,
      });
      this.fullBuildingData = result; // Store the full dataset
    } catch (error) {
      console.error("Error fetching full building data:", error);
    }
  }

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    const data = this.fullBuildingData || [];

    switch (item?.type) {
      case undefined:
        const buildingId = localStorage.getItem("idBuilding");

        const promises = [
          this.$store.dispatch(ActionTypes.GET_BUILDING_BY_ID, { buildingId })
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

        const floors = await this.$store.dispatch(ActionTypes.GET_FLOORS, {
          buildingId: item.staticId,
          patrimoineId: item.patrimoineId,
        });

        return floors.map((floor) => {
          const ticket = data.filter((t) => {
            if (!t.elementSelected?.position?.floor) {
              return false;
            }
            return t.elementSelected.position.floor.dynamicId === floor.dynamicId;
          });

          const counts = ticket.length
            ? [0, 1, 2].map((c) => {
              const filtered = ticket.filter((t) => t.priority == c);
              return {
                color: COLORS[c],
                value: filtered.length,
              };
            })
            : [];

          return {
            ...floor,
            counts,
          };
        }).filter((r) => r.counts.length);

      case "geographicFloor":

        const rooms = await this.$store.dispatch(ActionTypes.GET_ROOMS, {
          floorId: item.dynamicId,
          buildingId: item.buildingId,
          patrimoineId: item.patrimoineId,
          id: item.dynamicId,
        });

        return rooms.map((room) => {

          const ticket = data.filter(
            (t) => t.elementSelected.dynamicId === room.dynamicId ||
              t.elementSelected.position?.room?.dynamicId === room.dynamicId
          );

          const counts = ticket.length
            ? [0, 1, 2].map((c) => {
              const filtered = ticket.filter((t) => t.priority == c);
              return {
                color: COLORS[c],
                value: filtered.length,
              };
            })
            : [];

          return {
            ...room,
            counts,
          };
        }).filter((r) => r.counts.length);

      default:
        return [];
    }
  }


  async onDataViewClicked(item: TGeoItem | TGeoItem[]) {
    if (!item) return;
    this.$store.commit(MutationTypes.SET_ITEM_SELECTED, item);
    this.$store.dispatch(ActionTypes.SELECT_SPRITES, [item.dynamicId]);
  }
  // const item = {
  //     buildingId: localStorage.getItem("idBuilding"),
  //     dynamicId: 0,
  //     parents : [],
  //     type: "building",
  //   }

  onActionClick({ button, item }) {
    const data = {
      buildingId: item.buildingId, //important viewer
      // staticId: item.staticId,//can
      // id: item.dynamicId,
      dynamicId: item.dynamicId,//important viewer
      // floorId: item.floorId,//can
      // roomId: item.roomId,//can
      // type: item.type,//can
    };
    // const data = {
    //   buildingId: item.buildingId, //important viewer
    //   // staticId: item.staticId,//can
    //   // id: item.dynamicId,
    //   dynamicId: item.dynamicId,//important viewer
    //   parents: item.parents,
    //   // floorId: item.floorId,//can
    //   // roomId: item.roomId,//can
    //   type: item.type,//can
    // };

    switch (button.onclickEvent) {
      case ActionTypes.OPEN_VIEWER:
        this.$store.dispatch(button.onclickEvent, {
          onlyThisModel: true,
          config: this.config,
          item: data,
        });
        break;
      case ActionTypes.ISOLATE_ITEMS:
        this.$store.dispatch(button.onclickEvent, {
          onlyThisModel: true,
          config: this.config,
          item: data,
        });
        break;
      case "OPEN_VIEWER_PLUS":
        this.$store.dispatch(ActionTypes.OPEN_VIEWER, {
          onlyThisModel: false,
          config: this.config,
          item: data,
        });
        break;
      default:
        this.$store.dispatch(button.onclickEvent, data);
        break;
    }
  }

  listenSpritesEvent() {
    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.on(VIEWER_SPRITE_CLICK, (result: any) => {
      this.$store.commit(MutationTypes.SET_ITEM_SELECTED, result.node);
      if (result.node.dynamicId) {
        const a = document.createElement("a");
        a.setAttribute("href", `#${result.node.dynamicId}`);
        a.click();
      }
    });
  }

  public get displayedData() {
    return this.$store.state.appDataStore.data;
  }

  updateSpriteData(data) {
    this.spriteData = {
      buildingId: this.selectedZone.buildingId,
      dynamicId: this.selectedZone.dynamicId,
      buildingTicketNumber: this.buildingTicketNumber,
      data: data.filter(
        (d) => d.elementSelected.dynamicId === this.selectedZone.dynamicId
      ),
    };
  }

  public getDataFormatted() {
    const d = [this._getHeader(), ...this._getRows(this.displayedData)];
    return d;
  }

  private _getHeader() {
    return {
      id: "id",
      name: "name",
      type: "type",
      value: "value",
    };
  }

  private _getRows(list: any[]) {
    if (!list) return [];

    return list.map(({ color, displayValue, name, staticId, type }) => ({
      name,
      type,
      value: Number.parseFloat(displayValue).toFixed(2),
      id: staticId,
    }));
  }
  private async setSelectedZoneBuilding() {
    const buildingId = localStorage.getItem("idBuilding");
    const item = {
      buildingId: localStorage.getItem("idBuilding"),
      dynamicId: 0,
      parents: [],
      type: "building",
      patrimoineId: "0",
    }
    const newitem = await this.$store.dispatch(ActionTypes.GET_BUILDING_REFERENCE_OBJECTS, {
      buildingId: buildingId,
      patrimoineId: 0,
    })
    newitem.buildingId = item.buildingId;
    newitem.type = item.type;
    this.onActionClick({ button: { onclickEvent: ActionTypes.OPEN_VIEWER }, item: newitem });
  }
  @Watch("selectedZone")
  async watchSelectedZone() {

    if (this.selectedZone.type === "geographicFloor") {
    }
    else {
      this.setSelectedZoneBuilding();
    }

  }
}

export default App;
</script>

<style scoped lang="scss">
.app {
  width: 100%;
  height: 100%;
  $selectorHeight: 60px;
  overflow: hidden;

  ::v-deep .card-colored {
    background-color: #14202c !important;
    border-radius: 8px !important;
  }

  .selectors {
    position: absolute;
    display: flex;
    justify-content: flex-end;
    top: 5px;
    right: 5px;
    height: $selectorHeight;
    width: 100%;
    border: 1px solid #f5f5f5;
    border-radius: 12px;

    .DButton {
      width: 60px;
      height: 60px;
    }

    @media (max-width: 960px) {
      .DButton {
        display: none;
      }

    }




    .temporality {
      position: relative;
      width: 200px;
      height: $selectorHeight;
    }

    .space {
      position: relative;
      width: 40%;
      height: $selectorHeight;
    }




    @media (max-width: 960px) {
      .space {
        position: relative;
        width: 80%;
        height: $selectorHeight;
        margin-top: 2px;
      }

    }



  }



  .dataBody {
    height: calc(100% - #{$selectorHeight + 30px});
    margin: 75px 8px 0 8px;

    .viewerContainer {
      width: 60%;
      height: 100%;
      float: left;
    }



    .appContainer {
      width: 40%;
      z-index: 7;
      float: right;
      transition: 0.5s;
      position: absolute;
      margin-right: 6px;
      height: 90%;
      right: 0px;
    }

    .active {
      width: 98.5%;
      // height: 100%;
      position: absolute;
      z-index: 7;
      right: 0px;
      margin-right: 6px;
      height: 92%;
    }

    @media (max-width: 960px) {
      .active {
        height: 83vh;
      }

      .inactive {
        height: 83vh !important;
      }
    }

    .inactive {
      // display: none;
      position: absolute;
      width: 0%;
      height: 92%;
      right: 0px;
      transition: 0.1;
    }

    .active3D {
      width: 99vw;
      height: 100%;
      float: left;
      position: absolute;
    }

  }
}

.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style>
.forge-spinner {
  /* background-color: rgba(146, 70, 70, 0.63) !important; */
  width: 800px !important;
}

.forge-spinner img {
  display: none !important;
}

#app>div>div.dataBody>div.viewer-div-container.viewerContainer>div>div.forge-spinner {
  width: 800px !important;
}

.forge-spinner {
  background: url('./assets/spinalcore.png') center/contain no-repeat !important;
  width: 1500px;
  height: 800px;
}

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

.appContainer .dataContainer .calcul_content .calcul .select .v-text-field.v-text-field--solo .v-input__control {
  min-height: unset !important;
}
</style>
