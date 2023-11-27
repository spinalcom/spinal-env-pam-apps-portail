<template>
  <v-app>
    <div class="Hx">
      <space-selector
        v-if="defaultSelected.name && defaultSelected.name !=''"
        ref="space-selector"
        :open.sync="openSpaceSelector"
        :maxDepth="3"
        :GetChildrenFct="onSpaceSelectOpen"
        v-model="selectedZone"
      />
    </div>
    <MicroApp :floor="selectedFloor"/>
  </v-app>
</template>

<script lang="ts">
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
import { IGetAllBuildingsRes } from './interfaces/IGetAllBuildingsRes';
import MicroApp from './components/Commissioning.vue';
import  { getBuilding, getFloors, getRooms } from './services/getBuilding.js';
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
    MicroApp,
  },
})
class App extends Vue {
  selectedFloor = '';
  $store: Store;
  openSpaceSelector = false;
  dataTable: IZoneItem[] = [];
  $refs: { spaceSelector };
  timedata = { name: 'SEMAINE', value: 'week' };
  defaultSelected = {
    platformId: '',
    name: '',
    staticId: '',
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
  public get selectedZone(): ISpaceSelectorItem {
    return this.$store.state.appDataStore.zoneSelected;
  }

  public set selectedZone(v: ISpaceSelectorItem) {
    console.log('Zone SELECTED', v.name);
    this.selectedFloor = v.name;  
    this.$store.commit(MutationTypes.SET_SELECTED_ZONE, v);
  }

  async mounted() {
  let res = await getBuilding();
  this.defaultSelected.name = res.name;
  this.defaultSelected.dynamicId = res.dynamicId;
    this.selectedZone = this.defaultSelected;
  }
  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<IZoneItem[]> {
    switch (item?.type) {
      case undefined: // 1st call send undifined => send patrimoine // later change with Moussa API edit
        let res = await getFloors();
        let floors: IZoneItem[] = [];
        for (let r in res) {
          floors.push(
            {
              name: res[r].name,
              staticId: res[r].dynamicId,
              categories: [],
              color: res[r].color,
              dynamicId: res[r].dynamicId,
              type: 'geographicFloor',
            }
          )
        }
        return floors;
      // case 'geographicFloor':
      // case 'geographicFloor': // get building in patrimoine
      // console.log('TTTTTTTTTTTTT');
      //   const rooms = await getRooms(item);
      //   return rooms.map((it: any) => {
      //     const res: IZoneItem = {
      //       name: it.name,
      //       staticId: it.dynamicId,
      //       categories: [],
      //       color: '#35CAE5',
      //       dynamicId: it.dynamicId,
      //       type: 'geographicRoom',
      //     };
      //     return res;
      //   });
      // case 'geographicFloor':
      //   return await this.$store.dispatch(ActionRecordTypes.GET_ROOMS, {
      //     platformId: item.platformId,
      //     id: item.dynamicId,
      //   });
      // case 'geographicRoom':
      //   return await this.$store.dispatch(ActionRecordTypes.GET_EQUIPMENTS, {
      //     platformId: item.platformId,
      //     id: item.dynamicId,
      //   });
      default:
        return [];
    }
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

}

export default App;

</script>

<style>
.Hx {
  position: absolute;
  width: 33%;
  right: 0px;
  height: 60px;
  margin-top: 10px;
  margin-right: 10px;
}



html {
  font-family: 'charlevoixpro' !important;
}

@font-face{font-family:'charlevoix';src:url('./assets/font/CharlevoixPro-Regular.woff2') format('woff2'),url('./assets/font/CharlevoixPro-Regular.woff') format('woff'),url('./assets/font/CharlevoixPro-Regular.ttf') format('truetype');font-weight:normal;font-style:normal}
</style>
