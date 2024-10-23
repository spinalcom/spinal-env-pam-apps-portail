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
    <NomenclatureModale
      ref="nomenclatureModale"
      v-if="showNomenclatureModale"
      :showModal="showNomenclatureModale"
      v-on:close="closeModaleNomenclature"
    ></NomenclatureModale>
    <ModaleEditGroup
      ref="editGroupModale"
      v-if="showModalEditGroup"
      @activateSpaceAssignation="activateSpaceAssignation"
      @activateNomenclatureModale="activateNomenclatureModale"
      v-on:close="closeModaleEditGroup"
      :showModal="showModalEditGroup"
    >
    </ModaleEditGroup>
    <v-overlay
      :value="showModalEditGroup || showNomenclatureModale"
    ></v-overlay>
    <div class="selectors">
      <!-- <div class="DButton">
        <ScDownloadButton
          :fileName="'insight_data'"
          :csv="true"
          :data="getDataFormatted()"
        />
      </div> -->
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
        <div class="legend-wrapper">
          <LegendVue
            v-if="!isActive && displayLegend"
            :listItem="legendSpaceAssignation"
            v-show="!isActive"
          ></LegendVue>
        </div>

        <!-- <div class="menu-wrapper">
          <MenuV1
            v-if="currentExpansionMode !== 'full'"
            @clickFirstCell="openModaleEditGroup"
            @clickSecondCell="openNomenclatureModale"
            @clickMainCell="toggleHomeMode"
          >
          </MenuV1>
        </div> -->

        <dataSideApp
          class="appContainer"
          ref="dataSideApp"
          :class="{ active: isActive, inactive: isActive3D }"
          :config="config"
          :selectedZone="selectedZone"
          :data="displayedData"
          @clickOnDataView="onDataViewClicked"
          @buttonClicked3D="toggleActive3D"
          @buttonClicked="toggleActive"
          :selectedEntities="selectedEntities"
          :selectEntity="selectRoom"
          :DActive="isActive3D"
          :ActiveData="isActive"
        >
          <template #body>
            <RoomsGroupTable ref="roomsGroupTable"
              :selectedZone="selectedZone"
              @clickGroupManager="openModaleEditGroup"
              @clickNomenclature="openNomenclatureModale"
              @clickDisplayLegend="toggleDisplayLegend"
              > 
            </RoomsGroupTable>
          </template>
        </dataSideApp>
      </div>
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
/**
 * * Controllers
 */
import { GroupRoomWithChildrenController } from './controllers';

/**
 * * Components
 */
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from './components/SpaceSelector/index';
import ScDownloadButton from 'spinal-components/src/components/DownloadButton.vue';
import { ViewerButtons } from './components/SpaceSelector/spaceSelectorButtons';
import viewerApp from '../../../global-components/viewer/viewer.vue';
import dataSideApp from './components/data-side/App.vue';
import ModaleEditGroup from './components/data-side/Modales/EditGroupModale.vue';
import LegendVue from './components/data-side/Legend.vue';
//import Expansion from "./components/data-side/Expansion/Expansion.vue";
import MenuV1 from './components/data-side/Menu/MenuV1.vue';
import NomenclatureModale from './components/data-side/Modales/NomenclatureModale.vue';
import RoomsGroupTable from './components/data-side/RoomsGroup/RoomsGroupTable.vue';

/**
 * * Factory
 */

//import { iLegendFactory } from "./interfaces/GroupWithChildren";

/**
 * * Interfaces
 */
import { ActionTypes } from './interfaces/vuexStoreTypes';
import { IConfig } from './interfaces/IConfig';
import { PAGE_STATES } from './interfaces/pageStates';
import type {
  IButton,
  IZoneItem,
  TGeoItem,
} from './components/SpaceSelector/interfaces/IBuildingItem';
import { ExpansionMode, IItemV1 } from './interfaces';
/**
 * * Other
 */
import { config } from './config';
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import 'spinal-components/dist/spinal-components.css';
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
  VIEWER_OBJ_SELECT,
  VIEWER_AGGREGATE_SELECTION_CHANGED,
} from 'spinal-viewer-event-manager';
import { RoomManager } from './services/RoomsManager';
import { INodeItem, IRoom } from './interfaces';
import { ViewerManager } from '../../../global-components/viewer';

/**
 * * Services
 */
import { RoomsGroupAPI } from './services/spinalAPI';

/**
 * * Stores
 */
import type { Store } from './services/store';
import { MutationTypes } from './services/store/appDataStore/mutations';

/**
 * * Types
 */
import { Legend } from './interfaces/GroupWithChildren';

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
    ModaleEditGroup,
    RoomsGroupTable,
    LegendVue,
    MenuV1,
    NomenclatureModale,
  },
})
class App extends Vue {
  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  $store: Store;
  openSpaceSelector: boolean = false;
  openTemporalitySelector: boolean = false;
  displayLegend: boolean = false;
  config: IConfig = config;
  spaceSelectorButtons: IButton[] = ViewerButtons[config.viewButtons];
  emitterHandler: EmitterViewerHandler | undefined = undefined;
  roomManager: RoomManager | undefined;
  roomsGroupApi: RoomsGroupAPI | undefined;
  viewerManager: ViewerManager | undefined = undefined;
  dataTable: IZoneItem[] = [];
  dataSideFullscreen: boolean = false;
  $refs: {
    spaceSelector;
    dataSideApp;
    roomsGroupTable;
    nomenclatureModale;
    editGroupModale;
  };
  showModalEditGroup: boolean = false;
  showNomenclatureModale: boolean = false;
  selectedRoom: IRoom[];
  legendSpaceAssignation: Legend[] =
    GroupRoomWithChildrenController.legendSpaceAssignation;
  currentExpansionMode: ExpansionMode = 'split';
  expsEventAttached: boolean = false;
  isActive: boolean = false;
  isActive3D: boolean = false;

  async mounted() {
    try {
      this.emitterHandler = EmitterViewerHandler.getInstance();
      this.viewerManager = ViewerManager.getInstance();
      this.pageSate = PAGE_STATES.loading;
      this.listenSpritesEvent();
      this.listenSelectEvent();
      this.selectedRoom = [];
      this.roomsGroupApi = new RoomsGroupAPI();
      this.listenExpansionEvent();
      // const buildingId = localStorage.getItem("idBuilding");
      // await this.$store.dispatch(ActionTypes.GET_GROUPS_ITEMS, { config, buildingId });
      this.pageSate = PAGE_STATES.loaded;
    } catch (error) {
      this.pageSate = PAGE_STATES.error;
    }
  }

  activateSpaceAssignation(item: IItemV1) {
    // Show Dataside
    this.showModalEditGroup = false;
    this.currentExpansionMode = 'one-tier';
    if (this.$refs.roomsGroupTable) {
      this.$refs.roomsGroupTable.loadData(item.id);
    }
  }

  activateNomenclatureModale() {
    this.showModalEditGroup = false;
    this.showNomenclatureModale = true;
    if (this.$refs.nomenclatureModale) {
      this.$refs.nomenclatureModale.loadData();
    }
  }
  // resize() {
  //   setTimeout(() => {
  //     window.dispatchEvent(new Event('resize'));
  //   }, 1);

  // }
  listenExpansionEvent() {
    if (this.$refs.dataSideApp && !this.expsEventAttached) {
      this.$refs.dataSideApp.$el.addEventListener('transitionend', () => {
        console.log('Transition ended');
        this.expsEventAttached = true;
        this.viewerManager.resize();
        console.log(this.$refs.roomsGroupTable);
      });
    }
  }

  closeModaleEditGroup() {
    this.showModalEditGroup = false;
  }

  closeModaleNomenclature() {
    this.showNomenclatureModale = false;
  }

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
  }

  public get temporalitySelected(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.temporalitySelected;
  }

  public set temporalitySelected(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_TEMPORALITY, v);
  }

  public get classDataSide() {
    switch (this.currentExpansionMode) {
      case 'zero':
        return 'app-container-zero';
      case 'one-tier':
        return '';
      case 'half':
        return 'app-container-halfscreen';
      case 'full':
        return 'app-container-fullscreen';
      default:
    }
  }

  public get classViewerContainer() {
    switch (this.currentExpansionMode) {
      case 'zero':
        return 'viewerContainer-zero';
      case 'one-tier':
        return '';
      case 'half':
        return 'viewerContainer-half';
      case 'full':
        return 'viewerContainer-invisible';
      default:
    }
  }

  public toggleModaleEditGroup() {
    this.showModalEditGroup = !this.showModalEditGroup;
  }

  public openModaleEditGroup() {
    this.showModalEditGroup = true;
  }

  public openNomenclatureModale() {
    if (this.$refs.nomenclatureModale) {
      this.$refs.nomenclatureModale.loadData();
    }
    this.showNomenclatureModale = true;
  }

  public toggleDisplayLegend(){
    this.displayLegend = !this.displayLegend;
  }

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    switch (item?.type) {
      case undefined:
        const buildingId = localStorage.getItem('idBuilding');
        const playload = {
          config,
          item: { buildingId, type: 'building' },
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
            color: '#35CAE5',
            dynamicId: 0,
            type: 'building',
          },
        ];
      case 'building':
        return await this.$store.dispatch(ActionTypes.GET_FLOORS, {
          buildingId: item.staticId,
          patrimoineId: item.patrimoineId,
        });
      case 'geographicFloor':
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
          type: 'time',
        }));

      default:
        return [];
    }
  }

  updateExpansion() {
    let newExpansionMode: ExpansionMode = 'split';
    if (this.isActive3D) newExpansionMode = 'zero';
    if (this.isActive) newExpansionMode = 'full';
    console.log('New Expansion = ', newExpansionMode);
    this.currentExpansionMode = newExpansionMode;
    console.log('Refs = ', this.$refs);
    this.listenExpansionEvent();
    this.$refs.roomsGroupTable.setViewModeByExpansion(
      this.currentExpansionMode
    );
  }

  onGoBack() {
    const parent = this.$refs['space-selector'].getParentOfSelected();
    if (parent) this.selectedZone = parent;
  }

  toggleActive3D() {
    if (this.isActive) this.isActive = false;
    this.isActive3D = !this.isActive3D;
    this.updateExpansion();
    console.log('isActive3D', this.isActive3D, ' | isActive :', this.isActive);
    //this.handleRouteChange();
  }

  toggleActive() {
    if (this.isActive3D) {
      this.isActive3D = false;
    }
    this.isActive = !this.isActive;
    this.updateExpansion();
    console.log('isActive3D', this.isActive3D, ' | isActive :', this.isActive);
    //this.handleRouteChange();
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

  toggleFullscreen() {
    this.dataSideFullscreen = !this.dataSideFullscreen;
  }

  async onDataViewClicked(item: TGeoItem | TGeoItem[]) {
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
      case 'OPEN_VIEWER_PLUS':
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
    this.emitterHandler.on(VIEWER_SPRITE_CLICK, (result: any) => {
      this.$store.commit(MutationTypes.SET_ITEM_SELECTED, result.node);
      if (result.node.dynamicId) {
        const a = document.createElement('a');
        a.setAttribute('href', `#${result.node.dynamicId}`);
        a.click();
      }
    });
  }

  // TODO Mettre l'init du roomManager dans sur un autre eventEmitter
  // TODO Rechercher l'instant precis ou this.displayedData est fill
  // Code tenporaire
  async listenSelectEvent() {
    // this.emitterHandler.on(VIEWER_AGGREGATE_SELECTION_CHANGED, async (res: any) => {
    //   if (!this.roomManager) {
    //     this.roomManager = new RoomManager()
    //     await this.roomManager.loadData(this.$store.state.appDataStore.data)
    //   }
    //   //const selected = res.at(0).dbIds.at(0)
    //   const selected = res.map((el: any) => {
    //     const names = el.dbIds.map((dbId: number) => this.roomManager?.getRoomByDbId(dbId.toString()))
    //     return names
    //   })
    //   this.roomsGroupApi?.getRoomsGroupList().then((el: INodeItem[]) => {
    //     console.log('[GET] Rooms Group List')
    //     console.log(el)
    //   })
    //   console.log()
    //   this.selectedRoom = selected.length > 0 ? [...selected.at(0)] : [] // Trigger reactivity
    //   this.$store.commit(MutationTypes.SET_SELECTED_ROOMS, this.selectedRoom)
    // })
  }

  // Temporaire
  public selectRoom(room: any) {
    const roomRef = this.roomManager?.getRoomByDynamicId(room?.dynamicId);
  }

  public get displayedData() {
    return this.$store.state.appDataStore.data;
  }

  public get selectedEntities() {
    return this.$store.state.appDataStore.selectedRooms;
  }

  public getDataFormatted() {
    // color displayedValue name staticId type
    const d = [this._getHeader(), ...this._getRows(this.displayedData)];
    return d;
  }

  toggleHomeMode() {
    this.showModalEditGroup = false;
    this.currentExpansionMode = 'zero';
    this.$refs.expansion.resetToZero();
  }

  private _getHeader() {
    return {
      id: 'id',
      name: 'name',
      type: 'type',
      value: 'value',
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
  --app-container-width: 40%;
  width: 100%;
  height: 100%;

  $selectorHeight: 60px;

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
    z-index: 82;

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
      z-index: 7;
      float: right;
      transition: 0.5s;
      position: absolute;
      margin-right: 6px;
      height: 92%;
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

.legend-wrapper {
}

.menu-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
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
