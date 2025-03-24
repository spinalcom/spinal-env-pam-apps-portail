<template>  
  <v-app class="spinal-font">
    <div class="selectors">
      <div class="Hx1">
        <space-selector
          ref="space-selector"
          :open.sync="openSpaceSelector"
          :maxDepth="1"
          :GetChildrenFct="onSpaceSelectOpen"
          v-model="selectedZone"
          label="ESPACE"
        />
      </div>
    </div>
    <MicroApp :temporality="selectedTime" :space="selectedZone" v-if="selectedZone.dynamicId !== 0"/>
  </v-app>
</template>

<script lang="ts">
import {
  ISpaceSelectorItem,
  SpaceSelector,
} from './components/SpaceSelector/index';
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import MicroApp from './components/MainComponent.vue';
import { getBuilding } from './services/spinalAPI/GeographicContext/geographicContext';
import { ActionTypes } from './interfaces/vuexStoreTypes';
import { MutationTypes } from './services/store/appDataStore/mutations';
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
    name: 'Mois',
    loading: false,
    parents: [],
    haveChildren: false
  }

  selectedTime = {
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
    };

  async mounted() {
    const buildingId = localStorage.getItem('idBuilding');
    const realBuilding = await this.$store.dispatch(ActionTypes.GET_BOS_BUILDING, {buildingId})
    const item = {
      buildingId: buildingId,
      dynamicId: realBuilding.dynamicId,
      isOpen: false,
      loading: false,
      name: realBuilding.name,
      type: 'building',
    }
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, item);
    // this.defaultSelected = item;
    // let building = await getBuilding();
    // this.defaultSelected.name = building.name;
    // this.defaultSelected.dynamicId = building.dynamicId;
  }
  onTimeSelectOpen(item?: any): { name: string; staticId: string; dynamicId: number; level: number; isOpen: boolean; loading: boolean; patrimoineId: string; parents: never[]; isLastInGrp: boolean; drawLink: never[]; haveChildren: boolean; }[] {
    if (item) {
      if (item.name == 'Semaine') {
        this.selectedTime.next = 'Semaine suivante';
        this.selectedTime.prev = 'Semaine précédente';
      }
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
      return [];
    }
    let timeOptions: any[] = [];
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
    var floorList: any[] = [];
    switch (item?.type) {
      case undefined:
      const buildingId = localStorage.getItem('idBuilding');
      if(buildingId) {
        const payload = {
          item: { buildingId, type: "building" },

        }
        const promises = [
            this.$store.dispatch(ActionTypes.GET_BUILDING_BY_ID, { buildingId }),
          ];
          const [building, items] = await Promise.all(promises);
          const realBuilding = await this.$store.dispatch(
            ActionTypes.GET_BOS_BUILDING,
            { buildingId }
          )
          return [
            {
              name: realBuilding.name,
              staticId: building.id,
              categories: [],
              color: realBuilding.color,
              dynamicId: realBuilding.dynamicId,
              type: 'building',
            },
          ];
      }
      else {
        const building = await this.$store.dispatch(
            ActionTypes.GET_BUILDING_INFO,
            {
              buildingId: null,
            }
          );
          return [
            {
              name: building.name,
              staticId: building.id,
              categories: [],
              color: '#35CAE5',
              dynamicId: building.dynamicId,
              type: 'building',
            },
          ];
      }
      case 'building':
      return await this.$store.dispatch(ActionTypes.GET_FLOORS, {
          buildingId: item.staticId,
          patrimoineId: item.patrimoineId,
        });
      default:
        return [];
    }
  }

  public get selectedZone() {    
    return this.$store.state.appDataStore.zoneSelected;
  }
  public set selectedZone(v: ISpaceSelectorItem) {
    // if (v.type == "geographicFloor")
    //   this.floor = this.query.spaceSelectedId
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
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
  width: 45%;
  border-radius: 12px;
}
html, body, .spinal-font, .v-application--wrap {
  font-family: 'Charlevoix Pro' !important;
  font-size: 16px;
  letter-spacing: 1.1px;
  color: #000000DE;
  overflow: hidden !important;
}

@font-face{font-family:'Charlevoix Pro';src:url('./assets/font/CharlevoixPro-Regular.woff2') format('woff2'),url('./assets/font/CharlevoixPro-Regular.woff') format('woff'),url('./assets/font/CharlevoixPro-Regular.ttf') format('truetype');font-weight:normal;font-style:normal}


</style>
