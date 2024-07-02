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
      <div class="DButton">
        <ScDownloadButton
          :fileName="'insight_data'"
          :csv="true"
          :data="getDataFormatted()"
        />
      </div>

      <div class="temporality">
        <space-selector
          :edge="false"
          ref="space-selector2"
          :open.sync="openTemporalitySelector"
          :GetChildrenFct="onTemporalitySelectOpen"
          :maxDepth="0"
          v-model="temporalitySelected"
          label="TEMPORALITÉ"
        />
      </div>

      <div class="space">
        <space-selector
          ref="space-selector"
          :open.sync="openSpaceSelector"
          :maxDepth="2"
          :GetChildrenFct="onSpaceSelectOpen"
          v-model="selectedZone"
          label="ESPACE"
          :spaceSelectorItemButtons="spaceSelectorButtons"
          :viewButtonsType="config.viewButtons"
          @onActionClick="onActionClick"
        />
      </div>
    </div>

    <div class="dataBody">
      <viewerApp
        :class="{ active3D: isActive3D }"
        class="viewerContainer"
      ></viewerApp>
      <div class="bottom-container">
        <LegendVue :listItem="legendSpaceAssignation"></LegendVue>
      </div>
      <dataSideApp
        :DActive="isActive3D"
        :ActiveData="isActive"
        :class="{ active: isActive, inactive: isActive3D }"
        class="appContainer"
        :config="config"
        :selectedZone="selectedZone"
        :data="displayedData"
        @changeRoute="changeApp"
        @clickOnDataView="onDataViewClicked"
        @buttonClicked="toggleActive"
        @buttonClicked3D="toggleActive3D"
      ></dataSideApp>
    </div>
  </v-app>

  <v-container
    class="loading"
    v-else-if="pageSate === PAGE_STATES.loading"
    fluid
  >
    <v-progress-circular
      :size="70"
      :width="3"
      color="purple"
      indeterminate
    ></v-progress-circular>
  </v-container>
</template>

<script lang="ts">
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from "./components/SpaceSelector/index";
import { Vue } from "vue-property-decorator";
import { ActionTypes } from "./interfaces/vuexStoreTypes";
import Component from "vue-class-component";
import type { Store } from "./services/store";
import { MutationTypes } from "./services/store/appDataStore/mutations";
import type {
  IButton,
  IZoneItem,
  TGeoItem,
} from "./components/SpaceSelector/interfaces/IBuildingItem";
import viewerApp from "./components/viewer/viewer.vue";
import ScDownloadButton from "spinal-components/src/components/DownloadButton.vue";
import { ViewerButtons } from "./components/SpaceSelector/spaceSelectorButtons";
import { config } from "./config";
import { IConfig } from "./interfaces/IConfig";
import { PAGE_STATES } from "./interfaces/pageStates";
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";

import "spinal-components/dist/spinal-components.css";

import dataSideApp from "./components/data-side/App.vue";
import { Legend } from "./interfaces/ILegend";
import LegendVue from "./components/data-side/Legend.vue";

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
    ScDownloadButton,
    dataSideApp,
    LegendVue,
  },
})
class App extends Vue {
  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  $store: Store;
  openSpaceSelector: boolean = false;
  openTemporalitySelector: boolean = false;
  config: IConfig = config;
  spaceSelectorButtons: IButton[] = ViewerButtons[config.viewButtons];

  dataTable: IZoneItem[] = [];
  $refs: { spaceSelector };
  isActive: boolean = false;
  isActive3D: boolean = false;
  query: {
    app: string;
    mode: string;
    name: string;
    spaceSelectedId: string;
    buildingId: string;
  } = {
    app: "",
    mode: "null",
    name: "",
    spaceSelectedId: "",
    buildingId: "",
  };

  legendSpaceAssignation: Legend[] = [
    {
      title: "Automate 'Noeud parent'",
      color: "#00c2d1",
      type: "Not-assigned",
    },
    {
      title: "Equipement 'Noeud enfant'",
      color: "#0a1045",
      type: "Assigned",
    },
    {
      title: "Lien de réseau 'non selectionné'",
      color: "#FFB30F",
      type: "AssignedToAnother",
    },
    {
      title: "Lien vers le fils 'selectionné'",
      color: "#00ff00",
      type: "AssignedToAnother",
    },
    {
      title: "Lien vers le père 'selectionné'",
      color: "#0000FF",
      type: "AssignedToAnother",
    },
  ];

  async mounted() {
    try {
      this.pageSate = PAGE_STATES.loading;
      this.listenSpritesEvent();
      // const buildingId = localStorage.getItem("idBuilding");
      // await this.$store.dispatch(ActionTypes.GET_GROUPS_ITEMS, { config, buildingId });
      this.pageSate = PAGE_STATES.loaded;
    } catch (error) {
      this.pageSate = PAGE_STATES.error;
    }
    this.$nextTick(() => {
      this.query.app =
        "eyJuYW1lIjoiRGVzY3JpcHRpb24iLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImRhZGUtYTljYi1lMzc5LTE4ZjBmZGExZTI1IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxMzk1NzkyMTg4NiwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzEzOTU3OTAzOTA5LCJpY29uIjoibWRpLWJvb2staW5mb3JtYXRpb24tdmFyaWFudCIsImRlc2NyaXB0aW9uIjoic3BpbmFsLWVudi1wYW0tdmlld2VyLWFwcC1kZXNjcmlwdGlvbiIsInRhZ3MiOlsiRGVzY3JpcHRpb24iXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtZW52LXBhbS12aWV3ZXItYXBwLWRlc2NyaXB0aW9uIiwiaXNFeHRlcm5hbEFwcCI6ZmFsc2UsImxpbmsiOiIiLCJyZWZlcmVuY2VzIjp7fSwicGFyZW50Ijp7InBvcnRvZm9saW9JZCI6IjM3ZGUtMDJiOC1lMThiLTE4NTA2NDNiNjhhIiwiYnVpbGRpbmdJZCI6IjU5MzItNjA4Ni05ZTFhLTE4NTA2NDc4NDYwIn19";
      const currentQuery = {
        ...window.parent.routerFontion.apps[0]._route.query,
      };
      this.applyURLParam(currentQuery);
    });
  }
  getPatrimoineId() {
    const patrimoineString = localStorage.getItem("patrimoine");
    return patrimoineString ? JSON.parse(patrimoineString).id : null;
  }

  changeApp(e) {
    this.query.app = e;
    console.log("changeApp", e);
    this.changeRoute();
  }

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);

    // if (v.type.includes("geographic")) {
    //   this.$store.dispatch(ActionTypes.OPEN_VIEWER, v);
    // }
  }

  public get temporalitySelected(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.temporalitySelected;
  }

  public set temporalitySelected(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_TEMPORALITY, v);
  }
  applyURLParam(query) {
    this.query.mode = query.mode;
    this.query.buildingId = query.buildingId;
    this.query.spaceSelectedId = query.spaceSelectedId;
    this.query.name = query.name;
    this.query.app = query.app;

    if (query.mode == "3d") {
      this.isActive3D = true;
    } else if (query.mode == "data") {
      this.isActive = true;
    }
    console.warn(query.spaceSelectedId);

    if (query.spaceSelectedId) {
      const item = {
        buildingId: query.buildingId,
        dynamicId: query.spaceSelectedId,
      };
      const button = {
        title: "charger",
        icon: "mdi-video-3d",
        onclickEvent: "OPEN_VIEWER",
        isShownTypes: ["geographicFloor"],
      };
      this.onActionClick({ button, item });

      const itemToSelect = {
        isOpen: false,
        loading: false,
        dynamicId: parseInt(query.spaceSelectedId),
        name: query.name,
        buildingId: query.buildingId,
        parents: ["5932-6086-9e1a-18506478460"],
        type: "geographicFloor",
        staticId: "SpinalNode-6cd64ff8-a126-1aa3-80b7-f9d4fc5690bf-186df7cd2a5", //nan
      };

      if (this.$refs["space-selector"]) {
        this.$refs["space-selector"].select(itemToSelect);
      }
    }
    this.openSpaceSelector = false;
  }
  replaceRoute() {
    window.parent.routerFontion.customReplace(
      window.parent.router.path,
      this.query
    );
  }
  changeRoute() {
    console.log("changeRoute", this.query);
    window.parent.routerFontion.customPush(
      window.parent.router.path,
      this.query
    );
  }
  toggleActive() {
    if (this.isActive3D) {
      this.isActive3D = false;
    }
    this.isActive = !this.isActive;
    this.handleRouteChange();
  }

  toggleActive3D() {
    if (this.isActive) this.isActive = false;
    this.isActive3D = !this.isActive3D;
    this.handleRouteChange();
  }
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

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    switch (item?.type) {
      case undefined:
        const buildingId = localStorage.getItem("idBuilding");
        const playload = {
          config,
          item: { buildingId, type: "building" },
        };

        const promises = [
          this.$store.dispatch(ActionTypes.GET_BUILDING_BY_ID, { buildingId }),
        ];

        const [building, items] = await Promise.all(promises);

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
          floorId: item.dynamicId,
          buildingId: item.buildingId,
          patrimoineId: item.patrimoineId,
          id: item.dynamicId,
        });
      default:
        return [];
    }
  }

  onTemporalitySelectOpen(item?: any) {
    switch (item?.type) {
      case undefined:
        return config.temporality.map((temp, index) => ({
          name: temp,
          staticId: index,
          dynamicId: index,
          level: 0,
          isOpen: true,
          loading: false,
          parents: [],
          drawLink: [],
          haveChildren: false,
          type: "time",
        }));

      default:
        return [];
    }
  }

  onGoBack() {
    const parent = this.$refs["space-selector"].getParentOfSelected();
    if (parent) this.selectedZone = parent;
  }

  private getItemData(item: TGeoItem | TGeoItem[]): IItemData {
    const res: IItemDatatmp = {
      platformId: this.selectedZone.platformId,
      id: new Set(),
    };
    const datas = Array.isArray(item) ? item : [item];
    for (const data of datas) {
      res.id.add(data.dynamicId!);
    }
    return {
      platformId: res.platformId,
      id: res.id.size > 0 ? Array.from(res.id) : res.id.values().next().value,
    };
  }

  async onDataViewClicked(item: TGeoItem | TGeoItem[]) {
    console.log(item);
    if (!item) return;
    this.$store.commit(MutationTypes.SET_ITEM_SELECTED, item);
    this.$store.dispatch(ActionTypes.SELECT_SPRITES, [item.dynamicId]);
  }

  async onColor(item: TGeoItem | TGeoItem[]) {
    // TBD
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

  public getDataFormatted() {
    // color displayedValue name staticId type
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
}

export default App;
</script>


<style scoped lang="scss">
.app {
  width: 100%;
  height: 100%;

  $selectorHeight: 60px;

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
  }

  .dataBody {
    height: calc(100% - #{$selectorHeight + 30px});
    margin: 80px 8px 0 8px;
    .viewerContainer {
      width: 60%;
      height: 100%;
      float: left;
    }

    .appContainer {
      width: 40%;
      height: 100%;
      float: right;
      transition: 0.5s;
      position: absolute;
      margin-right: 6px;
      height: 92%;
      right: 0px;
      z-index: 3;
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

.appContainer
  .dataContainer
  .calcul_content
  .calcul
  .select
  .v-text-field.v-text-field--solo
  .v-input__control {
  min-height: unset !important;
}

.bottom-container {
  position: absolute;
  bottom: 0em;
  left: 0em;
  padding: 1em;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  height: 100%;
}
</style>
