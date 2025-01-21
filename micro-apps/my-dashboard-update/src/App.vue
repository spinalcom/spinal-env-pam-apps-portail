<template>
  <v-app class="spinal-font">
    <div class="selectors">
      <div class="Hx1">
        <space-selector
          v-if="defaultSelected.name && defaultSelected.name != '' && defaultSelected.dynamicId && defaultSelected.dynamicId !== 0"
          ref="space-selector"
          :open.sync="openSpaceSelector"
          :maxDepth="1"
          :GetChildrenFct="onSpaceSelectOpen"
          v-model="defaultSelected"
          label="ESPACE"
        />
      </div>
      <div class="Hx2">
        <space-selector
          :edge="false"
          v-if="defaultSelectedTime.name && defaultSelectedTime.name !=''"
          ref="space-selector2"
          :open.sync="openTimeSelector"
          :maxDepth="0"
          :GetChildrenFct="onTimeSelectOpen"
          v-model="selectedTime"
          label="TEMPORALITÉ"
        />
      </div>
      <div class="DB">
        <DownloadButton :fileName="'consomation d\'energie globale'" :data="table"/>
      </div>
    </div>
    <MicroApp @chart-sent="handleChart" :temporality="selectedTime" :space="defaultSelected" v-if="defaultSelected.dynamicId !== 0"/>
  </v-app>
</template>

<script lang="ts">
import env from '../config.js';
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from './components/SpaceSelector/index';
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import MicroApp from './components/MainComponent.vue';
import DownloadButton from './components/DownloadButton.vue';
import StackCard from './components/StackCard.vue';
import { getBuilding, getFloors } from './services/index.js';

@Component({
  components: {
    SpaceSelector,
    DownloadButton,
    MicroApp,
    StackCard,
  },
})
class App extends Vue {
  table = [];
  controlEndpoints = env.controlEndpoints;
  time = { name: "JOURNÉE", value: 'day' }
  selectedFloor = '';
  openSpaceSelector = false;
  openTimeSelector = false;
  $refs!: { spaceSelector: any };
  timedata = { name: 'JOURNÉE', value: 'day' };
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
    name: 'Journée',
    loading: false,
    parents: [],
    haveChildren: false
  }

  selectedTime = {
    name: 'Journée',
    next: 'Jour suivant',
    prev: 'Jour précédent',
    staticId: 'Journée',
    dynamicId: 1,
    level: 1,
    isOpen: true,
    loading: false,
    patrimoineId: 'Journée',
    parents: [],
    isLastInGrp: true,
    drawLink: [],
    haveChildren: false,
  };

  async mounted() {
    let building = await getBuilding(this.controlEndpoints);
    this.defaultSelected.area = building.area;
    this.defaultSelected.cp = building.cp;
    this.defaultSelected.dynamicId = building.dynamicId;
    if (!localStorage.getItem("platformId")) {
      localStorage.setItem("platformId", "votre-id-plateforme"); // Remplacez par l'ID réel
      console.log("Platform ID ajouté au localStorage.");
    }
  }
  onTimeSelectOpen(item?: any): { name: string; staticId: string; dynamicId: number; level: number; isOpen: boolean; loading: boolean; patrimoineId: string; parents: never[]; isLastInGrp: boolean; drawLink: never[]; haveChildren: boolean; }[] {
    if (item) {
      if (item.name == 'Journée' || item.name == 'Valeur Courante') {
        this.selectedTime.next = item.name === 'Valeur Courante' ? '' : 'Jour suivant';
        this.selectedTime.prev = item.name === 'Valeur Courante' ? '' : 'Jour précédent';
      }
      if (item.name == 'Semaine') {
        this.selectedTime.next = 'Semaine suivante';
        this.selectedTime.prev = 'Semaine précédente';
      }
      if (item.name == 'Mois') {
        this.selectedTime.next = 'Mois suivant';
        this.selectedTime.prev = 'Mois précédent';
      }
      else if (item.name == 'Trimestre') {
        this.selectedTime.next = 'Trimestre suivant';
        this.selectedTime.prev = 'Trimestre précédent';
      }
      else if (item.name == 'Année') {
        this.selectedTime.next = 'Année suivante';
        this.selectedTime.prev = 'Année précédente';
      }
      return [];
    }
    let timeOptions: any[] = [];
    timeOptions.push({
      name: 'Valeur Courante',
      next: '',
      prev: '',
      staticId: 'Valeur Courante',
      dynamicId: 2,
      level: 0,
      isOpen: true,
      loading: false,
      patrimoineId: 'Valeur Courante',
      parents: [],
      isLastInGrp: true,
      drawLink: [],
      haveChildren: false,
    });
    timeOptions.push({
      name: 'Journée',
      next: 'Jour suivant',
      prev: 'Jour précédent',
      staticId: 'Jour',
      dynamicId: 2,
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
      dynamicId: 2,
      level: 0,
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
      dynamicId: 1,
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
      name: 'Trimestre',
      staticId: 'Trimestre',
      dynamicId: 2,
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
      dynamicId: 3,
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
      dynamicId: 4,
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
    console.log('il select ??',item );
    
    var floorList: any[] = [];
    switch (item?.type) {
      case undefined:
        const building = await getBuilding(this.controlEndpoints);
        console.log('case undefined ??');
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
        console.log('case building ??');
        
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
  background: #14202c;
  border: 1px solid #f5f5f5;
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