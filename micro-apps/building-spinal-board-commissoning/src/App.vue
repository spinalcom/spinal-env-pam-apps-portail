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
    <MicroApp :temporality="selectedTime" :items="dataStore" :space="selectedZone" v-if="selectedZone.dynamicId !== 0"/>
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
import { ActionTypes } from './interfaces/vuexStoreTypes';
import { MutationTypes } from './services/store/appDataStore/mutations';
import { getDataInContextSpatial } from './services';
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

    get dataStore() {
      return this.$store.state.appDataStore.data;
    }



  async mounted() {
    const buildingId = localStorage.getItem('idBuilding');
    const realBuilding = await this.$store.dispatch(ActionTypes.GET_BOS_BUILDING, {buildingId})
    const item = {
      buildingId: buildingId,
      dynamicId: realBuilding.dynamicId,
      isOpen: false,
      loading: false,
      name: realBuilding.name,
      type: 'geographicBuilding',
    }
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, item);
    getDataInContextSpatial(buildingId!, this.selectedZone.name, this.selectedZone.type)
    // this.defaultSelected = item;
    // let building = await getBuilding();
    // this.defaultSelected.name = building.name;
    // this.defaultSelected.dynamicId = building.dynamicId;
  }
  
  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<any> {
    var floorList: any[] = [];
    const buildingId = localStorage.getItem('idBuilding');
    switch (item?.type) {
      case undefined:
      if(buildingId) {
        const payload = {
          item: { buildingId, type: "geographicBuilding" },

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
              type: 'geographicBuilding',
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
              type: 'geographicBuilding',
            },
          ];
      }
      case 'geographicBuilding':
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
    const buildingId = localStorage.getItem('idBuilding');
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
   getDataInContextSpatial(buildingId!, this.selectedZone.name, this.selectedZone.type)
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
