<template>  
  <v-app class="spinal-font">
    <div class="selectors">
      <div class="Hx1">
        <space-selector
          v-if="defaultSelected.name && defaultSelected.name != '' && defaultSelected.dynamicId && defaultSelected.dynamicId !== 0"
          ref="space-selector"
          :open.sync="openSpaceSelector"
          :maxDepth="2"
          :GetChildrenFct="onSpaceSelectOpen"
          v-model="defaultSelected"
          label="ESPACE"
        />
      </div>
      <!-- <div class="DB">

        <DownloadButton :fileName="'consomation d\'energie globale'" :data="table"/>
      </div> -->
    </div>
    <MicroApp :space="defaultSelected" v-if="defaultSelected.dynamicId !== 0"/>
  </v-app>
</template>

<script lang="ts">

import env from '../config';
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from './components/SpaceSelector/index';
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import MicroApp from './components/MainComponent.vue';
// import DownloadButton from 'spinal-components/src/components/DownloadButton.vue';
// import DownloadButton from './components/DownloadButton.vue';
import { getBuilding, getFloors } from './services/index.js';
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
    // DownloadButton,
    MicroApp
  },
})
class App extends Vue {

  table = [];
  controlEndpoints = env.controlEndpoints;
  time = { name: "SEMAINE", value: 'week' }
  selectedFloor = '';
  openSpaceSelector = false;
  openTimeSelector = false;
  $refs!: { spaceSelector: any };
  timedata = { name: 'SEMAINE', value: 'week' };
  defaultSelected = {
    platformId: '',
    name: '',
    staticId: '1',
    color: '',
    dynamicId: 0,
    type: 'building',
    level: 0,
    isOpen: true,
    loading: false,
    patrimoineId: 'patrimoineId',
    parents: [],
    isLastInGrp: true,
    drawLink: [],
    haveChildren: true,
    area: 0,
    cp: 0
  } as ISpaceSelectorItem;
  defaultSelectedTime = {
    name: 'Mois',
    loading: false,
    parents: [],
    haveChildren: false
  }



  async mounted() {
    let building = await getBuilding(this.controlEndpoints);
    this.defaultSelected.name = building.name;
    this.defaultSelected.area = building.area;
    this.defaultSelected.cp = building.cp;
    this.defaultSelected.dynamicId = building.dynamicId;
  }

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<any> {    
    var floorList: any[] = [];
    switch (item?.type) {
      case undefined:
        const building = await getBuilding(this.controlEndpoints);
        return[{
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
            }];
      case 'building':
        const floors = await getFloors(this.controlEndpoints);
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
              cp: floor.cp
            })
        }        
        return floorList;
      default:
        return [];
    }
  }
  handleChart(chart) {
    this.table = chart;
  }
}

export default App;
</script>

<style>
@import './assets/css/styles.css';
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
  position:absolute;
  display: flex;
  top: 10px;
  right: 10px;
  height: 60px;
  width: 50%;
  /* background: #14202c; */
  /* border: 1px solid #f5f5f5; */
  border-radius: 12px;
}
html, body, .spinal-font, .v-application--wrap {
  font-family: 'Charlevoix Pro' !important;
  font-size: 16px;
  letter-spacing: 1.1px;
  color: #000000DE;
  overflow: hidden !important;
}

.DB {
  position: absolute;
  left: -70px;
}
@font-face{font-family:'Charlevoix Pro';src:url('./assets/font/CharlevoixPro-Regular.woff2') format('woff2'),url('./assets/font/CharlevoixPro-Regular.woff') format('woff'),url('./assets/font/CharlevoixPro-Regular.ttf') format('truetype');font-weight:normal;font-style:normal}


</style>
