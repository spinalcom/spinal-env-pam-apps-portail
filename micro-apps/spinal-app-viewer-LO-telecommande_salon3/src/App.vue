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
    <div style="position: absolute;" class="space">
      <space-selector ref="space-selector" :open.sync="openSpaceSelector" :maxDepth="2"
        :GetChildrenFct="onSpaceSelectOpen" v-model="selectedZone" label="ESPACE"
        :spaceSelectorItemButtons="spaceSelectorButtons" :viewButtonsType="config.viewButtons"
        @onActionClick="onActionClick" />
    </div>

    <div class="navbar" style="">
      <div><span class="mdi mdi-map-marker"></span>{{ spaceName }}</div>

      <div style="color: #DDECF4;">
        <div style="font-size: 65px;height: 70px;font-weight: bold ;display: flex;justify-content:flex-end">{{
          currentTime }}</div>
        <div style="font-size: 25px;">{{ currentDate }}</div>
      </div>
    </div>

    <SpriteComponentMobile v-if="displaySprite" @close="handleClose"
      style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999;"
      :selectedItem="selectedItem" :floorType="floorType" :data="''">
    </SpriteComponentMobile>


    <div class="dataBody">
      <viewerApp :class="{ 'active3D': true }" class="viewerContainer"></viewerApp>
    </div>
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
import viewerApp from "./components/viewer/viewer.vue";
import ScDownloadButton from "spinal-components/src/components/DownloadButton.vue";
import { ViewerButtons } from "./components/SpaceSelector/spaceSelectorButtons";
import SpriteComponentMobile from "./components/data-side/SpriteComponentMobile.vue"
import SpriteComponent from "./components/data-side/SpriteComponent2.vue"
import { config } from "./config";
import { IConfig } from "./interfaces/IConfig";
import { PAGE_STATES } from "./interfaces/pageStates";
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
  VIEWER_AGGREGATE_SELECTION_CHANGED,
} from "spinal-viewer-event-manager";

import {
  VIEWER_REM_SPHERE,

} from "spinal-viewer-event-manager";

import "spinal-components/dist/spinal-components.css";

import dataSideApp from "./components/data-side/App.vue";
import { error } from "console";


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
    SpriteComponentMobile,
    SpriteComponent
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
  isActive: boolean = false;
  isActive3D: boolean = false;
  dataTable: IZoneItem[] = [];
  isSmallScreen: any;
  referenceObjects: any[];
  $refs: { spaceSelector };
  displaySprite: boolean = false;
  query: { app: string; mode: string; name: string; spaceSelectedId: string; buildingId: string } = {
    app: '',
    mode: 'null',
    name: '',
    spaceSelectedId: '',
    buildingId: ''
  };
  selectedItem: Number = 0;
  currentTime: String = '';
  currentDate: String = '';
  spaceName: String = '';
  floor: any = null
  floorType = ''
  public get loadedinformation() {
    return this.$store.state.appDataStore.loadedinformation;
  }
  updateDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    this.currentDate = now.toLocaleDateString('fr-FR', options);
  }
  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }
  async youAreHere() {
    let referenceIds = this.config.tabletteId

    if (window.parent.router.query.spaceSelectedId != undefined)
      referenceIds = window.parent.router.query.spaceSelectedId


    const buildingId = localStorage.getItem("idBuilding");
    const promises = [
      this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS_EQUIPEMENT, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    console.log(result);

    this.setTabletteSprite(result, buildingId)



    let referenceIds2 = this.config.tabletteId2
    console.log(referenceIds2, "idd de tablette");
    const promises2 = [
      this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS_EQUIPEMENT, {
        buildingId,
        referenceIds: referenceIds2
      }),
    ];
    const resultid2 = await Promise.all(promises2);
    console.warn(resultid2, 'aaaa');
    
    this.setTabletteSprite(resultid2, buildingId)

  }
  async mounted() {

    this.updateTime();
    this.updateDate();
    setInterval(this.updateTime, 60000);

    const navPickerApp = window.parent.document.querySelector('.navbar');

    const viewcube = document.querySelector('.viewcubeWrapper');
    if (viewcube) {
      viewcube.style.display = "none"
    }

    const appLoadContainer = window.parent.document.querySelector('.appLoadContainer');
    if (navPickerApp) {
      navPickerApp.style.display = 'none'; // Cache l'élément
      if (appLoadContainer) {
        appLoadContainer.style.setProperty('padding', '0px', 'important');
      }
    }

    localStorage.removeItem('room_tablette');


    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.on(VIEWER_AGGREGATE_SELECTION_CHANGED, (data) => {
      if (data)
        this.findDynamicIdByDbid(data[0]);

    });

    this.initializeEventHandlers();


    if (window.innerWidth < 900) {
      this.isActive = true;
      this.isActive3D = false;
    }

    try {
      this.pageSate = PAGE_STATES.loading;
      this.listenSpritesEvent();
      this.pageSate = PAGE_STATES.loaded;
    } catch (error) {
      this.pageSate = PAGE_STATES.error;
    }

    this.$nextTick(() => {

      this.query.app = "eyJuYW1lIjoic3BpbmFsLWVudi1wYW0tdmlld2VyLWFwcC10ZWxlY29tbWFuZGUiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6Ijg0ZDgtNzgyMS0yZTI2LTE5MjAwNmI4MDJmIiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcyNjU4MzkxOTM1NSwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzI2NTgzODk4MTU5LCJpY29uIjoiIiwiZGVzY3JpcHRpb24iOiIiLCJ0YWdzIjpbXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtZW52LXBhbS12aWV3ZXItYXBwLXRlbGVjb21tYW5kZSIsImlzRXh0ZXJuYWxBcHAiOmZhbHNlLCJsaW5rIjoiIiwicmVmZXJlbmNlcyI6e30sInBhcmVudCI6eyJwb3J0b2ZvbGlvSWQiOiIzN2RlLTAyYjgtZTE4Yi0xODUwNjQzYjY4YSIsImJ1aWxkaW5nSWQiOiI1OTMyLTYwODYtOWUxYS0xODUwNjQ3ODQ2MCJ9fQ"

      window.parent.router.query.app = this.query.app
      const currentQuery = { ...window.parent.routerFontion.apps[0]._route.query }
      this.applyURLParam(currentQuery);
      this.asynctoto()
    });
  }

  initializeEventHandlers() {
    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.off(VIEWER_REM_SPHERE);
  }


  asynctoto() {
    const roomTablette = localStorage.getItem('room_tablette');
    const item = {
      "dynamicId": roomTablette,
      "staticId": "SpinalNode-4be0192e-562d-1f3c-2d9c-1d558ca6b5ff-186df7cd6ff",
      "name": "Sol [415087]",
      "type": "BIMObject",
      "version": 1,
      "externalId": "154cec60-8d56-4126-8ada-aac07f24c66e-0006556f",
      "dbid": 11181,
      "buildingId": "5932-6086-9e1a-18506478460",
    }

    setTimeout(() => {
      this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, item);
    }, 400);

  }

  async findDynamicIdByDbid(data) {
    const roomRef = this.$store.state.appDataStore.roomRef;
    const selectedbimfileId = data.modelId.bimFileId;
    const selecteddbId = data.dbIds[0];

    const matchingObject = roomRef.find(item =>
      item.sols.some(sol => sol.bimFileId === selectedbimfileId && sol.dbid === selecteddbId)
    );

    if (matchingObject) {
      const { name, dynamicId, groupParentType } = matchingObject;
      console.log('Nom:', name);
      console.log('Dynamic ID:', dynamicId);
      console.log('Type:', groupParentType);
      this.floorType = groupParentType
      this.selectedItem = dynamicId;
      this.displaySprite = true

    } else {
      console.log('Aucun objet correspondant trouvé.');
    }
  }


  handleClose() {
    this.displaySprite = false;
  }


  getDataDynamicIdtab() {

    const data = [{
      "dynamicId": 42502576,
      "staticId": "SpinalNode-4bd8b812-f94d-549c-f720-706ab2f16c17-186df7cd2a9",
      "name": "120-Salle informatique 1",
      "type": "geographicRoom",
      "patrimoineId": "37de-02b8-e18b-1850643b68a",
      "buildingId": "5932-6086-9e1a-18506478460",
      "color": "#ded638"
    }]
    const dynamicIds = data.map(obj => obj.dynamicId);
    this.fetchReferenceObjects(dynamicIds)
  }

  async fetchReferenceObjects(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");

    const promises = [
      this.$store.dispatch(ActionTypes.GET_REFERENCE_OBJECT_LIST_MULTIPLE, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    this.referenceObjects = [...result];

  }

  async getpositiontablette(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");


    const promises = [
      this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS_EQUIPEMENT, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);

    let xyzCenter = null;

    const spatialCategory = result[0].attributsList.find(item => item.name === "Spatial");

    if (spatialCategory) {
      const xyzAttribute = spatialCategory.attributs.find(attr => attr.label === "XYZ center");
      if (xyzAttribute) {
        xyzCenter = xyzAttribute.value;
      }
    }

  }


  checkForReferenceObjectRoom(list) {
    return list.some(item => item.name === "hasReferenceObject.ROOM");
  }

  setTabletteSprite(result, buildingId) {
    console.log(result[0] , 'aa');
    

    let X;
    let Y;
    let Z;


    result[0].attributsList.forEach(category => {
      category.attributs.forEach(attribute => {
        if (attribute.label === "XYZ center") {
          let coordinates = attribute.value.split(";");
          X = coordinates[0];
          Y = coordinates[1];
          Z = coordinates[2];
        }
      });
    });


    const item = {
      color: 'red',
      dynamicId: result[0].dynamicId,
      buildingId: buildingId,
      dbid: result[0].dbid,
      bimFileId: result[0].bimFileId,
      name: result[0].name,
      position: new THREE.Vector3(Number(X), Number(Y), Number(Z)),
      data: result[0],
      config: this.config
    }
    // this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    console.log(item , 'aaa');
    this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
      items: item,
      buildingId: buildingId,
      component: SpriteComponent,
    });
  }

  forgeItem(result, buildingId) {

    this.selectedItem = result[0].dynamicId
    this.displaySprite = false;
    // this.isSmallScreen = item;
    this.displaySprite = true;

  }

  async getBIMInfo(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");
    const promises = [
      this.$store.dispatch(ActionTypes.GET_BIM_OBJECT_INFO, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    return [...result]
  }

  changeApp(e) {
    this.query.app = e
    this.changeRoute();
  }

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
  }

  public get temporalitySelected(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.temporalitySelected;
  }

  public set temporalitySelected(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_TEMPORALITY, v);
  }

  applyURLParam(query) {

    const buildingId = localStorage.getItem("idBuilding");
    const dynamicId = localStorage.getItem("floor_tablette_id");
    const name = localStorage.getItem("floor_tablette_name");
    const item = {
      buildingId: buildingId,
      dynamicId: dynamicId,
    };
    const button = {
      "title": "charger",
      "icon": "mdi-video-3d",
      "onclickEvent": "OPEN_VIEWER",
      "isShownTypes": [
        "geographicFloor"
      ]
    }
    this.onActionClick({ button, item })

    const itemToSelect = {
      "isOpen": false,
      "loading": false,
      "dynamicId": dynamicId,
      "name": name,
      "buildingId": buildingId,
      "type": "geographicFloor",
    }
    // this.$refs['space-selector'].getButton();

    if (this.$refs['space-selector']) {
      this.$refs['space-selector'].select(itemToSelect);
    }
    // }
    this.openSpaceSelector = false
  }

  replaceRoute() {
    window.parent.routerFontion.customReplace(window.parent.router.path, this.query);
  }
  changeRoute() {
    window.parent.routerFontion.customPush(window.parent.router.path, this.query);
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
    if (!item) return;
    this.$store.commit(MutationTypes.SET_ITEM_SELECTED, item);
    this.$store.dispatch(ActionTypes.SELECT_SPRITES, [item.dynamicId]);
  }

  onActionClick({ button, item }) {
    const buildingId = localStorage.getItem("idBuilding");

    const data = {
      "isOpen": false,
      "loading": false,
      buildingId: buildingId,
      dynamicId: item.dynamicId,
      parents: item.parents,
    };

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
      if (result.navigate) {

        this.query.spaceSelectedId = result.node.dynamicId
        this.query.name = result.node.name
        this.query.buildingId = result.node.buildingId

        const item = {
          buildingId: result.node.buildingId,
          dynamicId: result.node.dynamicId,
          name: result.node.name
        };
        const button = {
          "title": "charger",
          "icon": "mdi-video-3d",
          "onclickEvent": "OPEN_VIEWER",
          "isShownTypes": [
            "geographicFloor"
          ]
        }
        this.onActionClick({ button, item })

        const itemToSelect = {
          "isOpen": false,
          "loading": false,
          "dynamicId": result.node.dynamicId,
          "name": result.node.name,
          "buildingId": result.node.buildingId,
          "type": "geographicFloor",
        }

        if (this.$refs['space-selector']) {
          this.$refs['space-selector'].select(itemToSelect);
        }
      }
      else if (result.node?.dynamicId) {
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

  handleRouteChange() {
    if (this.isActive3D && !this.isActive) {
      this.query.mode = '3d'
    } else if (!this.isActive3D && this.isActive) {
      this.query.mode = 'data'
    } else {
      this.query.mode = 'none'
    }
    this.replaceRoute();
  }

  @Watch("loadedinformation", { deep: true })
  async watchSelectedChartItems(select, old) {
    this.spaceName = localStorage.getItem("room_tablette_name");
    this.asynctoto()
    this.youAreHere()
  }

}

export default App;
</script>


<style scoped lang="scss">
.navbar {
  position: absolute;
  top: 0;
  left: 0;
  margin: none;
  height: 13%;
  width: 100%;
  background-color: white;
  z-index: 9999;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 50px;
  font-size: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 5%;
  padding-right: 5%;
  // border: 1px solid black;
  // transform: translate(-10px);
}

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
    margin: 130px 8px 0 8px;

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
      height: 91%;
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
      height: 90%;
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