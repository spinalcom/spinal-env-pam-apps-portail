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
        <sc-download-button
          fileName="insight_data"
          csv
          :data="getDataFormatted()"
        ></sc-download-button>
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
      <viewerApp class="viewerContainer"></viewerApp>
      <InsightApp
        class="appContainer"
        :config="config"
        :selectedZone="selectedZone"
        :selectedTime="temporalitySelected"
        :data="displayedData"
        @clickOnDataView="onDataViewClicked"
      ></InsightApp>
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
import { DataTable } from "./components/data-table";
import viewerApp from "./components/viewer/viewer.vue";
import { ViewerButtons } from "./components/SpaceSelector/spaceSelectorButtons";
import { config } from "./config";
import { IConfig } from "./interfaces/IConfig";
import InsightApp from "./components/inshight_data/app.vue";
import { PAGE_STATES } from "./interfaces/pageStates";
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";

@Component({
  components: {
    SpaceSelector,
    DataTable,
    viewerApp,
    InsightApp,
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

  async mounted() {
    try {
      this.pageSate = PAGE_STATES.loading;
      this.listenSpritesEvent();
      this.pageSate = PAGE_STATES.loaded;
    } catch (error) {
      this.pageSate = PAGE_STATES.error;
    }
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

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    switch (item?.type) {
      case undefined:
        const buildingId = localStorage.getItem("idBuilding");
        const building = await this.$store.dispatch(
          ActionTypes.GET_BUILDING_BY_ID,
          { buildingId }
        );

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
        // return ['Journée', "Semaine", "Mois", "Trimestre", "Année", 'Décennie'].map((temp, index) => ({
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

    // if (item) {
    //   if (item.name == 'Journée') {
    //     this.selectedTime.next = 'Jour suivant';
    //     this.selectedTime.prev = 'Jour précédent';
    //   }
    //   if (item.name == 'Semaine') {
    //     this.selectedTime.next = 'Semaine suivante';
    //     this.selectedTime.prev = 'Semaine précédente';
    //   }
    //   if (item.name == 'Mois') {
    //     this.selectedTime.next = 'Mois suivant';
    //     this.selectedTime.prev = 'Mois précédent';
    //   }
    //   else if (item.name == 'Trimestre') {
    //     this.selectedTime.next = 'Trimestre suivant';
    //     this.selectedTime.prev = 'Trimestre précédent';
    //   }
    //   else if (item.name == 'Année') {
    //     this.selectedTime.next = 'Année suivante';
    //     this.selectedTime.prev = 'Année précédente';
    //   }
    //   return [];
  }

  onGoBack() {
    const parent = this.$refs["space-selector"].getParentOfSelected();
    if (parent) this.selectedZone = parent;
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
    // return [
    //   { key: "id", header: "id", width: 30 },
    //   { key: "name", header: "name", width: 30 },
    //   { key: "type", header: "type", width: 10 },
    //   { key: "color", header: "color", width: 10 },
    //   { key: "value", header: "value", width: 10 },
    // ];
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
::v-deep .card-colored {
  background-color: #14202c !important;
  border-radius: 10px !important;
}
.app {
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
</style>
