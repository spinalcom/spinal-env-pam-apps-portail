<!--
Copyright 2022 SpinalCom - www.spinalcom.com

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
  <v-app id="application">
    <!-- <div @click="test()">testttttttttttttttttttttttttt</div> -->
    <div class="selectors">
      <div class="Hx1">
        <space-selector ref="space-selector" :open.sync="openSpaceSelector" :maxDepth="1"
          :GetChildrenFct="onSpaceSelectOpen" v-model="defaultSelected" label="ESPACE" />
      </div>
      <div class="Hx2">
        <space-selector :edge="false" v-if="defaultSelectedTime.name && defaultSelectedTime.name != ''"
          ref="space-selector2" :open.sync="openTimeSelector" :maxDepth="0" :GetChildrenFct="onTimeSelectOpen"
          v-model="selectedTime" />
      </div>
    </div>
    <MicroApp :temporality="selectedTime" :space="defaultSelected" />
  </v-app>
</template>

<script lang="ts">
import { getBuildingName } from "./services/index.js";
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from './components/SpaceSelector/index';
import { Vue } from 'vue-property-decorator';
import {
  ActionRecordTypes,
  ActionTypes,
} from './services/store/appDataStore/actions';
import Component from 'vue-class-component';
import type { Store } from './services/store';
import { MutationTypes } from './services/store/appDataStore/mutations';
import type {
  IZoneItem,
  TGeoItem,
} from './components/SpaceSelector/interfaces/IBuildingItem';
import MicroApp from './components/Main.vue';
import { getBuilding, getFloors, getRooms } from './services/getBuilding.js';
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
    MicroApp
  },
})
class App extends Vue {
  building !: any;
  time = { name: "SEMAINE", value: 'week' }
  selectedFloor = '';
  $store!: Store;
  openSpaceSelector = false;
  openTimeSelector = false;
  dataTable: IZoneItem[] = [];
  $refs!: { spaceSelector: any };
  timedata = { name: 'SEMAINE', value: 'week' };
  defaultSelected = {
    platformId: '',
    name: 'Building',
    staticId: '1',
    color: '',
    dynamicId: 0,
    type: 'geographicBuilding',
    level: 0,
    isOpen: true,
    loading: false,
    patrimoineId: 'patrimoineId',
    parents: [],
    isLastInGrp: true,
    drawLink: [],
    haveChildren: true,
  } as ISpaceSelectorItem;
  defaultSelectedTime = {
    name: 'Semaine',
    loading: false,
    parents: [],
    haveChildren: false
  }

  selectedTime = {
    platformId: '',
    name: 'Semaine',
    next: 'Semaine suivante',
    prev: 'Semaine précédente',
    staticId: 'patrimoineId',
    color: '#FFFFFF',
    dynamicId: 0,
    type: 'patrimoine',
    level: 0,
    isOpen: true,
    loading: false,
    patrimoineId: 'patrimoineId',
    parents: [],
    isLastInGrp: true,
    drawLink: [],
    haveChildren: true,
  };

  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    this.selectedFloor = v.name;
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
  }

  async mounted() {
    this.building = await getBuilding();
    // console.log(this.building);

    const patrimoine = localStorage.getItem("patrimoine");
    let patrimoineObject = JSON.parse(patrimoine!);
    const idBuilding = localStorage.getItem("idBuilding");
    const buildingName = await getBuildingName(idBuilding)
    // for (var i = 0; i < patrimoineObject.buildings.length; i++) {
    //   // Vérifier si l'ID du bâtiment correspond à celui stocké dans le Local Storage
    //   if (patrimoineObject.buildings[i].id === idBuilding) {
    //     // Récupérer le nom du bâtiment correspondant
    //     var buildingName = patrimoineObject.buildings[i].name;
    //     console.log("Nom du bâtiment : " + buildingName);
    //     break; // Sortir de la boucle car on a trouvé le bâtiment correspondant
    //   }
    // }


    this.defaultSelected.name = buildingName;
    // let res = await getBuilding();
    // this.defaultSelected.dynamicId = res.dynamicId;
    this.selectedZone = this.defaultSelected;
  }
  onTimeSelectOpen(item?: any): { name: string; staticId: string; dynamicId: number; level: number; isOpen: boolean; loading: boolean; patrimoineId: string; parents: never[]; isLastInGrp: boolean; drawLink: never[]; haveChildren: boolean; }[] {
    if (item) {
      if (item.name == 'Mois') {
        this.selectedTime.next = 'Mois suivant';
        this.selectedTime.prev = 'Mois précédent';
      }
      else if (item.name == '3 mois') {
        this.selectedTime.next = '3 mois suivants';
        this.selectedTime.prev = '3 mois précédents';
      }
      else if (item.name == 'Année') {
        this.selectedTime.next = 'Année suivante';
        this.selectedTime.prev = 'Année précédente';
      }
      else if (item.name == 'Semaine') {
        this.selectedTime.next = 'Semaine suivante';
        this.selectedTime.prev = 'Semaine précédente';
      }
      else if (item.name == 'Jour') {
        this.selectedTime.next = 'Jour suivant';
        this.selectedTime.prev = 'Jour précédent';
      }
      return [];
    }
    let timeOptions = [];
    timeOptions.push({
      name: 'Jour',
      next: 'Jour suivant',
      prev: 'Jour précédent',
      staticId: 'Jour',
      dynamicId: 0,
      level: 0,
      isOpen: true,
      loading: false,
      patrimoineId: 'Jour',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    timeOptions.push({
      name: 'Semaine',
      next: 'Semaine suivante',
      prev: 'Semaine précédente',
      staticId: 'Semaine',
      dynamicId: 1,
      level: 1,
      isOpen: true,
      loading: false,
      patrimoineId: 'Semaine',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    timeOptions.push({
      name: 'Mois',
      next: 'Mois suivant',
      prev: 'Mois précédent',
      staticId: 'Mois',
      dynamicId: 2,
      level: 1,
      isOpen: true,
      loading: false,
      patrimoineId: 'Mois',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    timeOptions.push({
      name: '3 mois',
      staticId: '3derniersmois',
      dynamicId: 3,
      level: 0,
      isOpen: true,
      loading: false,
      patrimoineId: '3derniersmois',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    timeOptions.push({
      name: 'Année',
      next: 'Année suivante',
      prev: 'Année précédente',
      staticId: 'Annee',
      dynamicId: 4,
      level: 0,
      isOpen: true,
      loading: false,
      patrimoineId: 'Annee',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    timeOptions.push({
      name: 'Décennie',
      staticId: 'Decennie',
      dynamicId: 5,
      level: 0,
      isOpen: true,
      loading: false,
      patrimoineId: 'Decennie',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    return timeOptions;
  }
  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<any> {
    var source = [
      {
        title: 'Energie globale',
        type: 'controlEndpoint', // [controlEndpoint, endpoint]
        name: 'Energie globale',
        profile: 'KPI',
        capacity: 500,
        max: 100,
        min: null,
        color: '#4287f5',
      },
    ];
    var floorList: any[] = [];
    switch (item?.type) {
      case undefined:
        this.building = await getBuilding();
        const building = this.building;
        // console.log('lebuilding',building);

        return [{
          name: building.name,
          staticId: building.staticId,
          dynamicId: building.dynamicId,
          type: 'building',
          level: 0,
          isOpen: true,
          loading: false,
          patrimoineId: 'patrimoineId',
          parents: [],
          isLastInGrp: true,
          drawLink: [],
          haveChildren: false,
          area: building.area,
          cp: '',
          source: building.source
        }];
      case 'building':
        const floors = await getFloors();
        // console.log('ici');

        for (let floor of floors) {
          floorList.push({
            name: floor.name,
            staticId: floor.staticId,
            dynamicId: floor.dynamicId,
            type: 'floor',
            level: 0,
            isOpen: true,
            loading: false,
            patrimoineId: 'patrimoineId',
            parents: [],
            isLastInGrp: true,
            drawLink: [],
            haveChildren: false,
            area: floor.area,
            cp: floor.cp,
            source: floor.sources
          })
        }
        // console.log(floorList);

        return floorList;
      default:
        return [];
    }
  }
  // test(){
  //   console.log(this.defaultSelected);
  // }
  onGoBack() {
    const parent = this.$refs['spaceSelector'].getParentOfSelected();
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

}



export default App;
</script>

<style >
.Hx1 {
  position: absolute;
  width: 66%;
  right: 0px;
  top: -1px;
  height: 60px;
}

.Hx2 {
  position: absolute;
  width: 34%;
  right: calc(66%);
  top: -1px;
  height: 60px;
}

.selectors {
  position: absolute;
  display: flex;
  top: 10px;
  right: 10px;
  height: 60px;
  width: 50%;
  background: #14202c;
  border: 1px solid #f5f5f5;
  border-radius: 12px;
}

html {
  font-family: 'charlevoixpro' !important;
  overflow: hidden !important;
  user-select: none;
}

@font-face {
  font-family: 'charlevoix';
  src: url('./assets/font/CharlevoixPro-Regular.woff2') format('woff2'), url('./assets/font/CharlevoixPro-Regular.woff') format('woff'), url('./assets/font/CharlevoixPro-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal
}
</style>
