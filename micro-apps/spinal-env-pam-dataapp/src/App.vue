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
    <!-- <space-selector
      ref="space-selector"
      :open.sync="openSpaceSelector"
      :maxDepth="3"
      :GetChildrenFct="onSpaceSelectOpen"
      v-model="selectedZone"
      label="ESPACE"
    />  -->

    <div class="selectors">

      <div class="DButton">
        <ScDownloadButton  :fileName="'hello'" :data="[]"/>
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
          :spaceSelectorItemButtons="config.spaceSelectorButtons"
        />
      </div>
      
    </div>

    <div class="appContainer">
      <viewerApp class="viewerContainer"></viewerApp>
      <v-card elevation="4" class="dataContainer">
        <div class="detail_header"></div>
        <div class="detail_container"></div>
      </v-card>
    </div>
    <!-- <v-card
      elevation="4"
      style="margin: 70px 8px 0 8px"
      height="calc(100% - 80px)"
    >
      <DataTable
        :tableData="dataTable"
        v-model="selectedZone"
        :GetChildrenFct="onSpaceSelectOpen"
        @goBack="onGoBack"
        @onSelect="onSelect"
        @onfitToView="onfitToView"
        @onIsolate="onIsolate"
        @onColor="onColor"
      ></DataTable>
    </v-card> -->
  </v-app>
</template>

<script lang="ts">
import { ISpaceSelectorItem, SpaceSelector } from './components/SpaceSelector/index';
import { Vue } from 'vue-property-decorator';
import { ActionTypes } from './interfaces/vuexStoreTypes';
import Component from 'vue-class-component';
import type { Store } from './services/store';
import { MutationTypes } from './services/store/appDataStore/mutations';
import type { IZoneItem, TGeoItem } from './components/SpaceSelector/interfaces/IBuildingItem';
import { IGetAllBuildingsRes } from './interfaces/IGetAllBuildingsRes';
import { DataTable } from './components/data-table';
import viewerApp from './components/viewer/viewer.vue';
import ScDownloadButton from 'spinal-components/src/components/DownloadButton.vue';
import { config } from './config'
import { IConfig } from './interfaces/IConfig';

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
    DataTable,
    viewerApp,
    ScDownloadButton
  },
})

class App extends Vue {
  $store: Store;
  openSpaceSelector = false;
  openTemporalitySelector = false;
  config: IConfig = config;

  dataTable: IZoneItem[] = [];
  $refs: { spaceSelector };

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
    if (v.type.includes("geographic")) {
      this.$store.dispatch(ActionTypes.OPEN_VIEWER, v);
    }
  }

   public get temporalitySelected(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.temporalitySelected;
  }

  public set temporalitySelected(v: ISpaceSelectorItem) {
      this.$store.commit(MutationTypes.SET_TEMPORALITY, v);
  }

  mounted() { }
  
  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    switch (item?.type) {
      // case undefined: // 1st call send undifined => send patrimoine // later change with Moussa API edit
      //   const patrimoine = JSON.parse(localStorage.getItem("patrimoine"));
      //   return [{
      //     name: patrimoine.name,
      //     staticId: patrimoine.id,
      //     categories: patrimoine.buildings,
      //     color: '#FFFFFF',
      //     dynamicId: 0,
      //     type: 'patrimoine',
      //   }];
      // case 'patrimoine': // get building in patrimoine
      //   const buildings = await this.$store.dispatch(ActionTypes.GET_BUILDINGS, {patrimoineId: item.staticId});
      //   return buildings.map((it: IGetAllBuildingsRes) => {
      //     const res = {
      //       name: it.name,
      //       staticId: it.id,
      //       patrimoineId: item.staticId,
      //       categories: [],
      //       color: '#35CAE5',
      //       dynamicId: 0,
      //       type: 'building',
      //     };
      //     return res;
      //   });
      case undefined:
        const buildingId = localStorage.getItem("idBuilding");
        const promises = [this.$store.dispatch(ActionTypes.GET_BUILDING_BY_ID, { buildingId }), this.$store.dispatch(ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS, { buildingId })]
        const [building] =  await Promise.all(promises)
        return [
          {
            name: building.name,
            staticId: building.id,
            categories: [],
            color: '#35CAE5',
            dynamicId: 0,
            type: 'building',
          }
        ]
      case 'building':
        return await this.$store.dispatch(ActionTypes.GET_FLOORS, { buildingId: item.staticId,  patrimoineId: item.patrimoineId });
      case 'geographicFloor':
        //@ts-ignore
        return await this.$store.dispatch(ActionTypes.GET_ROOMS, { floorId: item.staticId, buildingId: item.buildingId, patrimoineId: item.patrimoineId, id: item.dynamicId });
      // case 'geographicRoom':
      //   //@ts-ignore
      //   return await this.$store.dispatch(ActionTypes.GET_EQUIPMENTS, { floorId: item.floorId, roomId: item.staticId, buildingId: item.buildingId, patrimoineId: item.patrimoineId, id: item.dynamicId });
      default:
        return [];
    }
  }


  onTemporalitySelectOpen(item?: any) {
    switch (item?.type) {
      case undefined:
        return ['Journée', "Semaine", "Mois", "Trimestre", "Année", 'Décennie'].map((temp, index) => ({
          name: temp,
          staticId: index,
          dynamicId : index,
          level: 0,
          isOpen: true,
          loading: false,
          parents: [],
          drawLink: [],
          haveChildren: false,
          type: "time"
        }))
    
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
    const parent = this.$refs['space-selector'].getParentOfSelected();
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
  async onSelect(item: TGeoItem | TGeoItem[]) {
    if (!item) return;
    const it = this.getItemData(item);
    await this.$store.dispatch(ActionTypes.SELECT_ITEMS, it);
  }
  async onfitToView(item: TGeoItem | TGeoItem[]) {
    if (!item) return;
    const it = this.getItemData(item);
    await this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, it);
  }
  async onIsolate(item: TGeoItem | TGeoItem[]) {
    if (!item) return;
    const it = this.getItemData(item);
    await this.$store.dispatch(ActionTypes.ISOLATE_ITEMS, it);
  }
  
  async onColor(item: TGeoItem | TGeoItem[]) {
    // TBD
  }
}

export default App;
</script>


<style scoped>

.selectors {
  position:absolute;
  display: flex;
  justify-content: flex-end;
  top: 5px;
  right: 5px;
  height: 60px;
  width: 100%;
  /* background: #14202c; */
  border: 1px solid #f5f5f5;
  border-radius: 12px;
}

.selectors .DButton {
  /* position: absolute; */
  /* right: calc(90%);  */
  /* top: -1px; */
  width: 60px;
  height: 60px;
}

.selectors .temporality {
  position: relative;
  width: 200px;
  height: 60px;
  /* right: calc(66%); */
  /* top: -1px; */
}

.selectors .space {
  position: relative;
  /* right: 0px;
  top: -1px; */
  width: 40%;
  height: 60px;
}




.appContainer {
  height : calc(100% - 90px);
  margin: 80px 8px 0 8px;
}

.appContainer .viewerContainer {
  width: 60%;
  height: 100%;
  float: left;
}

.appContainer .dataContainer {
  width: calc(40% - 5px);
  height: 100%;
  float: right;
  border-radius: 10px;
  padding: 5px;
}

.appContainer .dataContainer .detail_header {
  width: 100%;
  height: 150px;
  background: blue;
}
.appContainer .dataContainer .detail_container {
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
