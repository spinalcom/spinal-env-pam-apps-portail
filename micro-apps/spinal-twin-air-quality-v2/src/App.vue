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
          :open="false"
          :maxDepth="-1"
          :GetChildrenFct="onTimeSelectOpen"
          v-model="defaultSelectedTime"
          label="TEMPORALITÉ"
        />
      </div>
    <div class="DB">
      <DownloadButton :fileName="fileName" v-if="filtered.length > 0" :data="filtered"/>
    </div>
    </div>
    <MicroApp :space="defaultSelected" v-if="defaultSelected.dynamicId !== 0" :data="rooms" @dataChange="dataChange"/>
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
import DownloadButton from './components/DownloadButton.vue';

import { getBuilding, getFloors, getBuildingEndpoints } from './services/index.js';
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
    DownloadButton,
    MicroApp
  },
})
class App extends Vue {

  table = [];
  controlEndpoint = env.controlEndpoint;
  fileName = env.fileName;
  time = { name: "SEMAINE", value: 'week' };
  floors: any[];
  rooms: any[] = [];
  filtered: any[] = [];
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
    name: 'Temps-réel',
    loading: false,
    parents: [],
    haveChildren: false
  }



  async mounted() {
    let building = await getBuilding(this.controlEndpoint);
    const res = await getBuildingEndpoints();
    /*
    const res = [
    [
        {
            "name": "RDC",
            "staticId": "SpinalNode-6cd64ff8-a126-1aa3-80b7-f9d4fc5690bf-186df7cd2a5",
            "dynamicId": 12092064
        },
        {
            "name": "Etage 1",
            "staticId": "SpinalNode-f61c5c7e-605e-affb-6ae2-ddc0d0c4a264-186df7cdb08",
            "dynamicId": 15354016
        },
        {
            "name": "Toit",
            "staticId": "SpinalNode-511079eb-791c-2256-2242-f319b5780664-187223eeab4",
            "dynamicId": 15362560
        }
    ],
    [
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "Ascenseur N0",
            "roomDynamicId": 12089408,
            "endpoints": {
                "dynamicId": 445158688,
                "staticId": "SpinalNode-c6ebb581-1075-a4ec-a08c-7857fdbfd36e-186fa39029a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 2221.1038077275727
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "119-Bureau 2 B5",
            "roomDynamicId": 14389392,
            "endpoints": {
                "dynamicId": 230227424,
                "staticId": "SpinalNode-b4822642-6c51-8bef-5447-7ccbe1bd9157-186fa39027f",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 19.876668717122932
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "120-Salle informatique 1",
            "roomDynamicId": 61914080,
            "endpoints": {
                "dynamicId": 62300416,
                "staticId": "SpinalNode-9958bcd3-0868-4e25-b6b0-d7955a6fc784-186fa390288",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 17.160616797585174
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "121-Salle informatique 3",
            "roomDynamicId": 63179904,
            "endpoints": {
                "dynamicId": 224946176,
                "staticId": "6483-2fef-7742-18756c6a191",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 23.0620219525168
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "122-Bureau 1 B5",
            "roomDynamicId": 67353840,
            "endpoints": {
                "dynamicId": 67668064,
                "staticId": "SpinalNode-ae433c00-c9f9-2d37-83c7-b43a97ce1e6a-186fa39027f",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 6.778550937330483
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "123-Salle de réunion 4 B4",
            "roomDynamicId": 101965968,
            "endpoints": {
                "dynamicId": 102354256,
                "staticId": "SpinalNode-d9e67098-a6c3-31d4-d741-13460af105ed-186fa39028a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 22.29195840190597
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "124-Salle de réunion 6 B4",
            "roomDynamicId": 151295712,
            "endpoints": {
                "dynamicId": 151682976,
                "staticId": "SpinalNode-ae333195-d126-249c-210a-bea67fae2cda-186fa39028a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 18.181711579421258
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "125-Salle informatique 4",
            "roomDynamicId": 76384800,
            "endpoints": {
                "dynamicId": 76771088,
                "staticId": "SpinalNode-b3cf070c-f573-d1b8-a1f1-f26da80c0af1-186fa390289",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 22.566040538163477
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "126-Salle informatique 5",
            "roomDynamicId": 131451152,
            "endpoints": {
                "dynamicId": 131837440,
                "staticId": "SpinalNode-157b150b-23fc-4d2d-7934-1f17d468e5dc-186fa390289",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 0.005510376605831979
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "127-Sanitaire B4",
            "roomDynamicId": 161750352,
            "endpoints": {
                "dynamicId": 162136592,
                "staticId": "SpinalNode-7d266e17-8ea4-18c6-98e2-90d0d06570ec-186fa39028f",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 9.611424664795337
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "128-Sanitaire B4",
            "roomDynamicId": 163285680,
            "endpoints": {
                "dynamicId": 163671920,
                "staticId": "SpinalNode-742c60d1-22c3-33ad-7f69-2e1b1d949732-186fa390290",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 9.025478824373092
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "129-Salle de réunion 5 B4",
            "roomDynamicId": 105109936,
            "endpoints": {
                "dynamicId": 105497184,
                "staticId": "SpinalNode-6b0ed002-ae0a-916f-4596-936db4ac780d-186fa39028b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 5.704974209149772
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "130-Salle de réunion 7 B4",
            "roomDynamicId": 103750976,
            "endpoints": {
                "dynamicId": 104147712,
                "staticId": "SpinalNode-74223f86-5697-81b6-e054-1c0e75ba75f1-186fa39028b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 5.36352906811325
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "131-Salle informatique 6",
            "roomDynamicId": 68133408,
            "endpoints": {
                "dynamicId": 68519696,
                "staticId": "SpinalNode-524d4e1a-0a74-5c8d-381c-e33b4180ee11-186fa39028a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 0.2959413783315892
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "132-Sanitaire B1",
            "roomDynamicId": 63831168,
            "endpoints": {
                "dynamicId": 217395888,
                "staticId": "SpinalNode-350f3a04-152b-ac2a-7446-2f147aa1037c-186fa39028e",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.313306203896698
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "133-Bureau 1 B1",
            "roomDynamicId": 61866016,
            "endpoints": {
                "dynamicId": 226977328,
                "staticId": "SpinalNode-4e14ebfe-a8aa-8d08-cb8c-ba85dc4a2592-186fa390280",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 17.98363435838863
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "134-Bureau 2 B1",
            "roomDynamicId": 86274496,
            "endpoints": {
                "dynamicId": 86589712,
                "staticId": "SpinalNode-2bfe29d4-d031-f0e4-f1b0-9314d1ac7e42-186fa390280",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 3.0346961721244243
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "135-Bureau 3 B1",
            "roomDynamicId": 86260208,
            "endpoints": {
                "dynamicId": 88844832,
                "staticId": "SpinalNode-9cb7c2b2-b313-1ddf-26c7-28f56ae2f300-186fa390281",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 7.35422778539826
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "136-Salle de repos B1",
            "roomDynamicId": 64467200,
            "endpoints": {
                "dynamicId": 208322864,
                "staticId": "SpinalNode-b552ee4d-4875-401a-df40-f45ee4a1ce83-186fa39028d",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 12.301148154096088
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "137-Laboratoire 1 B2",
            "roomDynamicId": 64488144,
            "endpoints": {
                "dynamicId": 207701360,
                "staticId": "SpinalNode-ff6922e2-dcb5-6364-ad8b-8091d9d69f8f-186fa390292",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 20.507060348907586
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "138-Bureau 1 B2",
            "roomDynamicId": 70409232,
            "endpoints": {
                "dynamicId": 179031440,
                "staticId": "SpinalNode-c47ef0f9-3d1c-f2b7-dd54-08b46331d74b-186fa390281",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 19.721397283378767
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "139-Sanitaire B2",
            "roomDynamicId": 213162976,
            "endpoints": {
                "dynamicId": 213549248,
                "staticId": "SpinalNode-7f8ba3f4-072a-bdd7-3ce5-df65c01d1e79-186fa39028f",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 20.850721467872987
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "140-Sanitaire B2",
            "roomDynamicId": 213804144,
            "endpoints": {
                "dynamicId": 214190384,
                "staticId": "SpinalNode-2e75fb14-0fbf-f8f2-5b50-7748cdf6a59a-186fa39028f",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.47429806417722
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "141-Sanitaire B2",
            "roomDynamicId": 166169344,
            "endpoints": {
                "dynamicId": 166555584,
                "staticId": "SpinalNode-79219403-8756-ae1a-dcd4-3e91b73e7735-186fa39028f",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 12.518942952905237
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "142-Laboratoire 4 B2",
            "roomDynamicId": 64556752,
            "endpoints": {
                "dynamicId": 205851840,
                "staticId": "SpinalNode-9553bb6a-f71e-9da2-9346-c162f0f3d979-186fa390295",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 16.09756909425256
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "143-Laboratoire 10 B2",
            "roomDynamicId": 64502592,
            "endpoints": {
                "dynamicId": 207085792,
                "staticId": "SpinalNode-649ea88d-0bf9-0cb3-7cbe-66a9417c0406-186fa390295",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 1.956553401359736
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "144-Laboratoire 8 B2",
            "roomDynamicId": 97517840,
            "endpoints": {
                "dynamicId": 97906096,
                "staticId": "SpinalNode-d0acfe3b-b76b-7da1-f890-967fa0ac0da0-186fa390295",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 27.09602666452835
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "145-Laboratoire 6 B2",
            "roomDynamicId": 97502528,
            "endpoints": {
                "dynamicId": 99453376,
                "staticId": "SpinalNode-414972fb-4a67-897d-e2ec-4bef904109d8-186fa390294",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 17.71815818689174
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "146-Laboratoire 2 B2",
            "roomDynamicId": 109383856,
            "endpoints": {
                "dynamicId": 109772096,
                "staticId": "SpinalNode-9766635c-66c7-e0d9-4261-3c1431845329-186fa390293",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 11.78931983072434
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "147-Laboratoire 3 B2",
            "roomDynamicId": 64526016,
            "endpoints": {
                "dynamicId": 206473856,
                "staticId": "SpinalNode-a9aab458-a735-48c0-5ae1-e8d3b056689a-186fa390293",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.51852244039551
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "148-Laboratoire 5 B3",
            "roomDynamicId": 109360976,
            "endpoints": {
                "dynamicId": 120308288,
                "staticId": "SpinalNode-ecdc4f67-3495-5d3a-e8df-b86f0a4eb47f-186fa390294",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 14.735441258449605
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "149-Bureau 3 B3",
            "roomDynamicId": 116645904,
            "endpoints": {
                "dynamicId": 116962080,
                "staticId": "SpinalNode-67f22661-f4af-4ee9-04ef-ce4047357664-186fa390282",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 20.871236940884337
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "150-Bureau 2 B3",
            "roomDynamicId": 116630688,
            "endpoints": {
                "dynamicId": 119146800,
                "staticId": "SpinalNode-70059eda-999f-f75f-1aa1-d620a35663cc-186fa390282",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 24.36281190623884
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "151-Bureau 1 B3",
            "roomDynamicId": 63233392,
            "endpoints": {
                "dynamicId": 63551792,
                "staticId": "SpinalNode-9182a3e8-3975-5ae8-6923-f5f736e681c3-186fa390282",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 10.873418356723205
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "152-Laboratoire 2 B3",
            "roomDynamicId": 61888288,
            "endpoints": {
                "dynamicId": 226410544,
                "staticId": "SpinalNode-54d5a663-7e3d-c081-fb00-445859423c55-186fa390293",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 21.355138512224226
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "153-Bureau 4 B3",
            "roomDynamicId": 117741296,
            "endpoints": {
                "dynamicId": 118057360,
                "staticId": "SpinalNode-a7bace20-4d20-edf4-fdba-898625481df9-186fa390283",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 8.28330147857655
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "154-Couloir B2",
            "roomDynamicId": 135995552,
            "endpoints": {
                "dynamicId": 146137024,
                "staticId": "SpinalNode-a98a00ed-0ab8-e93c-4a52-9b31d760954e-186fa390297",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 16.624222235311684
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "155-Couloir B4",
            "roomDynamicId": 136019408,
            "endpoints": {
                "dynamicId": 136410592,
                "staticId": "SpinalNode-55421d46-d538-1d8e-874b-e8f266f92ded-186fa390297",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 0.8707782618065741
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "156-Salle d'accueil 1",
            "roomDynamicId": 168041296,
            "endpoints": {
                "dynamicId": 168426656,
                "staticId": "SpinalNode-3609a5ba-6726-0ea8-6ed9-214c21ee0fb9-186fa390299",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 25.50168233494297
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "157-Salle d'accueil 2",
            "roomDynamicId": 168029360,
            "endpoints": {
                "dynamicId": 169596032,
                "staticId": "SpinalNode-2ac97738-ca45-329a-b45a-85268d7f7e72-186fa390299",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 17.27893134316073
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "158-Couloir B4",
            "roomDynamicId": 136639840,
            "endpoints": {
                "dynamicId": 137026224,
                "staticId": "SpinalNode-4d7363dc-246f-e4d0-af09-8fee6fd5e849-186fa390298",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 3.8648038139589254
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "159-Salle de conférence",
            "roomDynamicId": 92139408,
            "endpoints": {
                "dynamicId": 92528400,
                "staticId": "SpinalNode-184d149e-963c-eada-8678-ca7922de42f0-186fa2a88df",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 9.351635310721912
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "160-Couloir B1",
            "roomDynamicId": 137535136,
            "endpoints": {
                "dynamicId": 137921520,
                "staticId": "SpinalNode-a8abaf11-9a6f-ce9b-a6dd-fa9de314bd9a-186fa390298",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 0.2760521311160619
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "161-Bureau 5 B1",
            "roomDynamicId": 84315280,
            "endpoints": {
                "dynamicId": 84630464,
                "staticId": "SpinalNode-2c5f3fa9-d5c0-c723-22ce-da50d23f9125-186fa390283",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 1.2644504882412395
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "162-Bureau 4 B1",
            "roomDynamicId": 70431648,
            "endpoints": {
                "dynamicId": 70756256,
                "staticId": "SpinalNode-fe5646bf-be33-7673-a62d-c165a1c8427d-186fa390284",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 8.300471566913709
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "163-Salle informatique 2",
            "roomDynamicId": 72494032,
            "endpoints": {
                "dynamicId": 72880320,
                "staticId": "SpinalNode-1add1bcc-8b85-6af8-6fee-bdd831deec57-186fa390288",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 7.834785535516365
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "164-Salle informatique 7",
            "roomDynamicId": 133070384,
            "endpoints": {
                "dynamicId": 133456672,
                "staticId": "SpinalNode-3eb7fa66-8046-a77a-e1f5-589cead6eade-186fa39028a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 18.390926632312212
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "165-Jardin extérieur",
            "roomDynamicId": 208561216,
            "endpoints": {
                "dynamicId": 208928096,
                "staticId": "SpinalNode-068af851-c488-b973-b940-41708556af23-186fa39029a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 13.812121662098617
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "166-Sanitaire B4",
            "roomDynamicId": 215088640,
            "endpoints": {
                "dynamicId": 215474880,
                "staticId": "SpinalNode-ebeb60de-bddb-9214-8e27-602d17d19ab9-186fa390290",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 8.60405176722252
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "167-Sanitaire B4",
            "roomDynamicId": 214447488,
            "endpoints": {
                "dynamicId": 214833728,
                "staticId": "SpinalNode-87b7a0a3-e6d3-d9f7-9b59-ebd1e5b4efc8-186fa390290",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 8.528296782322847
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "168-Hall technique",
            "roomDynamicId": 14429504,
            "endpoints": {
                "dynamicId": 14814768,
                "staticId": "SpinalNode-a42159ca-ebaa-697d-e3a2-e83dc83f9572-186fa390287",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 5.72063126562297
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "169-Sanitaire B4",
            "roomDynamicId": 162403328,
            "endpoints": {
                "dynamicId": 162789568,
                "staticId": "SpinalNode-91bfbffd-942f-33e6-be6d-10a1c51db365-186fa390290",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 4.1510380361710295
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "170-Sanitaire B4",
            "roomDynamicId": 63816064,
            "endpoints": {
                "dynamicId": 218016336,
                "staticId": "SpinalNode-68764961-4053-857e-c55c-e3e34796abc0-186fa390290",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 8.820370652029284
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "171-Sanitaire B2",
            "roomDynamicId": 165168160,
            "endpoints": {
                "dynamicId": 165554400,
                "staticId": "SpinalNode-33c4d1fe-439a-a73d-4002-7eaf7667d244-186fa390291",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 2.359919993181548
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "172-Sanitaire B2",
            "roomDynamicId": 215732528,
            "endpoints": {
                "dynamicId": 216118768,
                "staticId": "SpinalNode-1261622c-cb56-dbb2-1317-790ddc761ad4-186fa390291",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 7.772995393013733
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "174-Couloir B4",
            "roomDynamicId": 140138528,
            "endpoints": {
                "dynamicId": 140524912,
                "staticId": "SpinalNode-68876752-68ec-9a54-2b72-cf82a69be089-186fa390298",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 6.1840692536377775
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "175-Salle de réunion 2 B4",
            "roomDynamicId": 63203376,
            "endpoints": {
                "dynamicId": 224473984,
                "staticId": "SpinalNode-0e9fee88-bb14-5023-58c9-d723f2485566-186fa39028b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 18.78392366858053
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "176-Sanitaire B4",
            "roomDynamicId": 216373664,
            "endpoints": {
                "dynamicId": 216759904,
                "staticId": "SpinalNode-7d34bd43-8261-a347-52fa-8c60e93c2cc9-186fa390292",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 21.819211027069787
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "177-Couloir B2",
            "roomDynamicId": 141588064,
            "endpoints": {
                "dynamicId": 141974448,
                "staticId": "SpinalNode-171707d0-1c64-9234-437c-b5456f62300f-186fa390298",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 25.5455716547269
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "178-Couloir B2",
            "roomDynamicId": 142724112,
            "endpoints": {
                "dynamicId": 143110480,
                "staticId": "SpinalNode-7b4d792f-0ff3-6c18-db24-f444f8f9685c-186fa390299",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 18.64357721013105
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "179-Bibliothèque",
            "roomDynamicId": 80925328,
            "endpoints": {
                "dynamicId": 81319392,
                "staticId": "SpinalNode-b879f0ce-bc5b-bce5-9b70-fa1875204255-186fa39029c",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 25.388699654882277
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "180-Couloir B5",
            "roomDynamicId": 135983600,
            "endpoints": {
                "dynamicId": 147516000,
                "staticId": "SpinalNode-e5c2d695-bc46-55d7-df79-f1900b2c8202-186fa390299",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.770235659262166
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "181-Salle de réunion 8 B4",
            "roomDynamicId": 149611488,
            "endpoints": {
                "dynamicId": 150008224,
                "staticId": "SpinalNode-ece4a361-15f0-e67e-5b28-afb3ec3dae7e-186fa39028c",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 15.536298006870501
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "182-Salle de réunion 3 B4",
            "roomDynamicId": 107588480,
            "endpoints": {
                "dynamicId": 107975728,
                "staticId": "SpinalNode-1c2139db-e58d-3869-ea2a-ed263c59121c-186fa39028c",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 18.082708249240344
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "183-Bureau 1 B4",
            "roomDynamicId": 65624320,
            "endpoints": {
                "dynamicId": 65938560,
                "staticId": "SpinalNode-a58e41fd-4d61-75b1-e764-40d10172fcb6-186fa390284",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 14.704298644445252
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "184-Laboratoire 6 B3",
            "roomDynamicId": 114898592,
            "endpoints": {
                "dynamicId": 115286848,
                "staticId": "SpinalNode-c31712a3-6d92-710c-9927-54882d008efb-186fa390294",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.87354548353741
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "185-Couloir B3",
            "roomDynamicId": 144342896,
            "endpoints": {
                "dynamicId": 144729264,
                "staticId": "SpinalNode-652984d7-df4e-4436-a9da-2c35d0774d66-186fa390299",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 27.83066249427107
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "186-Salle de réunion 2 B3",
            "roomDynamicId": 154596736,
            "endpoints": {
                "dynamicId": 154984960,
                "staticId": "SpinalNode-ba0f73a3-751b-8df0-6ac9-d9082f8ab0d1-186fa39028c",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 11.06741152057084
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "187-Laboratoire 4 B3",
            "roomDynamicId": 112889296,
            "endpoints": {
                "dynamicId": 113277536,
                "staticId": "SpinalNode-436a9788-ca22-b52d-ca47-4bb7396b6cd7-186fa390294",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 0.7908654202676946
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "188-Laboratoire 3 B3",
            "roomDynamicId": 110881504,
            "endpoints": {
                "dynamicId": 111269744,
                "staticId": "SpinalNode-d20d82f0-b3c5-a630-88fd-b1fcf6be7539-186fa390295",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 5.616162511361084
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "189-Salle de réunion 1 B3",
            "roomDynamicId": 152874784,
            "endpoints": {
                "dynamicId": 153272400,
                "staticId": "SpinalNode-8643efa3-92a0-ae7f-404e-319a91231060-186fa39028c",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 27.463576216873026
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "190-Laboratoire 1 B3",
            "roomDynamicId": 101954304,
            "endpoints": {
                "dynamicId": 122065712,
                "staticId": "SpinalNode-7db78238-db7f-18b0-4c75-0dbb8e276c97-186fa390295",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 10.951348746041964
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "191-Laboratoire 5 B2",
            "roomDynamicId": 64588000,
            "endpoints": {
                "dynamicId": 64976240,
                "staticId": "SpinalNode-af7155b2-4a5f-0460-9cc2-925ebba287e0-186fa390296",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 20.958812048427948
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "192-Laboratoire 7 B2",
            "roomDynamicId": 124532928,
            "endpoints": {
                "dynamicId": 124921136,
                "staticId": "SpinalNode-cd74b5fe-0c12-fe53-e507-723cb8a28f38-186fa390297",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 11.25881589378121
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "193-Laboratoire 9 B2",
            "roomDynamicId": 126138592,
            "endpoints": {
                "dynamicId": 126526816,
                "staticId": "SpinalNode-cf81307f-5ad0-6b24-3a74-325e72fc77cd-186fa390297",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 19.902685147811976
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "194-Hall d'accueil",
            "roomDynamicId": 14380032,
            "endpoints": {
                "dynamicId": 231055376,
                "staticId": "SpinalNode-d4f680b6-95d5-5c23-f992-d4c8b509426b-186fa390287",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 19.67422176144525
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "195-Bureau 1 Accueil",
            "roomDynamicId": 96242160,
            "endpoints": {
                "dynamicId": 96556416,
                "staticId": "SpinalNode-f20ffb4c-da76-27a5-0f14-bf3f73fbc49a-186fa390284",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 2.9131832838311293
            }
        },
        {
            "floorName": "RDC",
            "floorDynamicId": 12092064,
            "roomName": "196-Jardin extérieur",
            "roomDynamicId": 209157216,
            "endpoints": {
                "dynamicId": 209527104,
                "staticId": "SpinalNode-c987e8f3-5b0c-b5b9-8df2-8eb3b4c213e8-186fa39029a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 13.019770066462376
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "199-Pièce",
            "roomDynamicId": 158173184,
            "endpoints": {
                "dynamicId": 158558496,
                "staticId": "SpinalNode-fb6b1b60-aa68-5fd5-c228-d884a5632bc6-186fa39029b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 8.019916052277441
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "200-Bureau 2 N1",
            "roomDynamicId": 71482304,
            "endpoints": {
                "dynamicId": 176746976,
                "staticId": "SpinalNode-80da285e-9303-61ab-07c0-20df9c609c35-186fa390285",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 17.44012192522588
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "201-Bureau 1 N1",
            "roomDynamicId": 71507600,
            "endpoints": {
                "dynamicId": 71823776,
                "staticId": "SpinalNode-b23a66c7-0c68-dfd6-9ef7-b7c3024cba35-186fa390285",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 9.335423185738897
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "202-Bureau 6 N1",
            "roomDynamicId": 15350400,
            "endpoints": {
                "dynamicId": 228916576,
                "staticId": "SpinalNode-f1e3a2ea-2073-36cf-e8cb-eac552e2bf7a-186fa390285",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 17.799323351116353
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "203-Bureau 4 N1",
            "roomDynamicId": 61844976,
            "endpoints": {
                "dynamicId": 227552160,
                "staticId": "SpinalNode-fa2041da-65bb-54ca-4f13-82c0efffc863-186fa390286",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 4.7954362296550395
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "204-Bureau 5 N1",
            "roomDynamicId": 66350432,
            "endpoints": {
                "dynamicId": 66685104,
                "staticId": "SpinalNode-88fb47f9-dd66-e51d-6f53-c990f6ae30ec-186fa390287",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 18.091516885809444
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "205-Salle de réunion 1 N1",
            "roomDynamicId": 63169216,
            "endpoints": {
                "dynamicId": 225546496,
                "staticId": "SpinalNode-a25cdc9e-9bbe-b00a-167b-631b7076f25b-186fa39028d",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 10.048902583915257
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "206-Escalier N1",
            "roomDynamicId": 201654448,
            "endpoints": {
                "dynamicId": 202012096,
                "staticId": "SpinalNode-a3576e92-1195-1e7d-9dfa-9bb2d41c15c8-186fa39029b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 6.410532612474222
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "207-Pièce",
            "roomDynamicId": 159129472,
            "endpoints": {
                "dynamicId": 159514752,
                "staticId": "SpinalNode-cdff030b-4e32-08a9-efcd-65754de4903c-186fa39029b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.52944223721071
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "208-Pièce",
            "roomDynamicId": 158161232,
            "endpoints": {
                "dynamicId": 161254384,
                "staticId": "SpinalNode-4aef23be-5989-6af4-7902-4f3380b81bb0-186fa39029b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 6.16261807842342
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "209-Pièce",
            "roomDynamicId": 159888800,
            "endpoints": {
                "dynamicId": 160274080,
                "staticId": "SpinalNode-b568e41b-fd0c-fa87-7f79-238aac39741e-186fa39029b",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 12.57980766119451
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "210-Salle de réunion 2 N1",
            "roomDynamicId": 172035904,
            "endpoints": {
                "dynamicId": 172442272,
                "staticId": "SpinalNode-b1ff46cc-bcd5-11a7-8159-dee1ae86da88-186fa39028d",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 22.69170696845403
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "211-Ascenceur N1",
            "roomDynamicId": 63859328,
            "endpoints": {
                "dynamicId": 64208176,
                "staticId": "SpinalNode-1b9291ce-09e0-207b-f25c-e9c44c424cb3-186fa39029a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 27.389055191159525
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "212-Open space",
            "roomDynamicId": 65570992,
            "endpoints": {
                "dynamicId": 199922976,
                "staticId": "SpinalNode-889a42fe-48c2-893c-ca46-ef3dc99297c4-186fa39029a",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 11.209392751130045
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "213-Salle de repos N1",
            "roomDynamicId": 68940576,
            "endpoints": {
                "dynamicId": 69325904,
                "staticId": "SpinalNode-99fa4304-5c63-dcc1-b1e5-318538a8635a-186fa39028d",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 1.971125485402221
            }
        },
        {
            "floorName": "Etage 1",
            "floorDynamicId": 15354016,
            "roomName": "214-Bureau 3 N1",
            "roomDynamicId": 65547520,
            "endpoints": {
                "dynamicId": 200461792,
                "staticId": "SpinalNode-248615a3-2e8a-2136-cd85-26ad4014cb0c-186fa390287",
                "name": "Dioxyde de carbone",
                "type": "co2",
                "currentValue": 26.947816803574028
            }
        },
    ]
];*/
    this.floors = res[0];
    this.rooms = res[1];
    this.filtered = this.rooms;
    this.defaultSelected.name = building.name;
    this.defaultSelected.area = building.area;
    this.defaultSelected.cp = building.cp;
    this.defaultSelected.dynamicId = building.dynamicId;
  }

  async onSpaceSelectOpen(item?: ISpaceSelectorItem): Promise<any> {    
    var floorList: any[] = [];
    switch (item?.type) {
      case undefined:
        const building = await getBuilding(this.controlEndpoint);
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
        // const floors = await getBuildingEndpoints();
        for (let floor of this.floors) {
          
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
  selectedTime = {
    platformId: '',
    name: 'Mois',
    next: 'Mois suivant',
    prev: 'Mois précédent',
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
      return [];
    }
    let timeOptions:any[] = [];
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
      name: '3 mois',
      staticId: '3derniersmois',
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
  handleChart(chart) {
    this.table = chart;
  }

  dataChange(data: any[]): void {
    console.log(data);
    
    const valueCaption = `Valeur (en ${env.unit})`
    this.filtered = data.map((e: any) => {return { 'Nom': e.roomName, 'Etage': e.floorName, 'Niveau': e.currentLevel, [valueCaption]: e.endpoints.currentValue.toFixed(2)}});
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
