<!--
Copyright 2023 SpinalCom - www.spinalcom.com

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
  <v-card elevation="4" class="cardContainer">
    <button @click="() => {
          $emit('buttonClicked');
          resize();
        }
          " style="
          position: absolute;
          top: 47.5%;
          left: -20px;
          background-color: white;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 5px;
          border-left: 2px solid gainsboro;
          
        " :style="{ left: DActive ? '-35px' : '-20px' }">
      <v-icon v-if="DActive"> mdi-chevron-double-left </v-icon>
      <v-icon v-else-if="ActiveData">mdi-chevron-right</v-icon>
      <v-icon v-else>mdi-chevron-left</v-icon>
    </button>
    <button @click="() => {
          $emit('buttonClicked3D');
          resize();
        }
          " style="
          position: absolute;
          top: 52.5%;
          background-color: white;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 5px;
          border-left: 2px solid gainsboro;
          
        " :style="{ left: DActive ? '-35px' : '-20px' }">
      <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
      <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
      <v-icon v-else>mdi-chevron-right</v-icon>
    </button>
    <div class="entrence" :class="{ 'inactiveTable': DActive, }">
      <div class="dataContainer" v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected">


        <div>

          <div class="Spinal_card">
            <div class="text">
              <span>Tickets App</span>
              <p class="subtitle">Gestion des tickets de maintenance</p>
            </div>

            <div class="icons">
              <!-- <a class="btn" href="#">

            </a> -->
              <a class="btn" href="#">
                <!-- <svg class="svg-icon" viewBox="0 0 20 20">
                <path
                  d="M4.317,16.411c-1.423-1.423-1.423-3.737,0-5.16l8.075-7.984c0.994-0.996,2.613-0.996,3.611,0.001C17,4.264,17,5.884,16.004,6.88l-8.075,7.984c-0.568,0.568-1.493,0.569-2.063-0.001c-0.569-0.569-0.569-1.495,0-2.064L9.93,8.828c0.145-0.141,0.376-0.139,0.517,0.005c0.141,0.144,0.139,0.375-0.006,0.516l-4.062,3.968c-0.282,0.282-0.282,0.745,0.003,1.03c0.285,0.284,0.747,0.284,1.032,0l8.074-7.985c0.711-0.71,0.711-1.868-0.002-2.579c-0.711-0.712-1.867-0.712-2.58,0l-8.074,7.984c-1.137,1.137-1.137,2.988,0.001,4.127c1.14,1.14,2.989,1.14,4.129,0l6.989-6.896c0.143-0.142,0.375-0.14,0.516,0.003c0.143,0.143,0.141,0.374-0.002,0.516l-6.988,6.895C8.054,17.836,5.743,17.836,4.317,16.411">
                </path>
              </svg> -->
                <v-icon style="color: #14202c;font-size: 1.5em">mdi-arrow-right-top-bold</v-icon>
              </a>
              <!-- <a class="btn" href="#">
              <svg y="0" xmlns="http://www.w3.org/2000/svg" x="0" width="100" viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet" height="100" class="svg-icon">
                <path stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none"
                  d="M21.9,50h0M50,50h0m28.1,0h0M25.9,50a4,4,0,1,1-4-4A4,4,0,0,1,25.9,50ZM54,50a4,4,0,1,1-4-4A4,4,0,0,1,54,50Zm28.1,0a4,4,0,1,1-4-4A4,4,0,0,1,82.1,50Z">
                </path>
              </svg>
            </a> -->
            </div>
          </div>


          <div class="Spinal_card">
            <div class="text">
              <span>Insights App</span>
              <p class="subtitle">Voir les données insights</p>
            </div>

            <div class="icons">
              <!-- <a class="btn" href="#">

            </a> -->
              <a class="btn" href="#">
                <!-- <svg class="svg-icon" viewBox="0 0 20 20">
                <path
                  d="M4.317,16.411c-1.423-1.423-1.423-3.737,0-5.16l8.075-7.984c0.994-0.996,2.613-0.996,3.611,0.001C17,4.264,17,5.884,16.004,6.88l-8.075,7.984c-0.568,0.568-1.493,0.569-2.063-0.001c-0.569-0.569-0.569-1.495,0-2.064L9.93,8.828c0.145-0.141,0.376-0.139,0.517,0.005c0.141,0.144,0.139,0.375-0.006,0.516l-4.062,3.968c-0.282,0.282-0.282,0.745,0.003,1.03c0.285,0.284,0.747,0.284,1.032,0l8.074-7.985c0.711-0.71,0.711-1.868-0.002-2.579c-0.711-0.712-1.867-0.712-2.58,0l-8.074,7.984c-1.137,1.137-1.137,2.988,0.001,4.127c1.14,1.14,2.989,1.14,4.129,0l6.989-6.896c0.143-0.142,0.375-0.14,0.516,0.003c0.143,0.143,0.141,0.374-0.002,0.516l-6.988,6.895C8.054,17.836,5.743,17.836,4.317,16.411">
                </path>
              </svg> -->
                <v-icon style="color: black;font-size: 1.5em">mdi-arrow-right-top-bold</v-icon>
              </a>
              <!-- <a class="btn" href="#">
              <svg y="0" xmlns="http://www.w3.org/2000/svg" x="0" width="100" viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet" height="100" class="svg-icon">
                <path stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none"
                  d="M21.9,50h0M50,50h0m28.1,0h0M25.9,50a4,4,0,1,1-4-4A4,4,0,0,1,25.9,50ZM54,50a4,4,0,1,1-4-4A4,4,0,0,1,54,50Zm28.1,0a4,4,0,1,1-4-4A4,4,0,0,1,82.1,50Z">
                </path>
              </svg>
            </a> -->
            </div>
          </div>

        </div>



        <button @click="() => {
          $emit('changeRoute', tickets);
        }" style="border: 1px solid black;padding: 5px;">go to tickets
          apps</button>
        <button @click="() => {
          $emit('changeRoute', insights);
        }" style="border: 1px solid black;padding: 5px;">go to insights
          apps</button>
        <button @click="() => {
          $emit('changeRoute', conso);
        }" style="border: 1px solid black;padding: 5px;">go to consomation
          apps</button>

        <!-- SAMPLE -->
        <div :style="{ 'height': 'calc(100% - 200px)' }">
          <div v-for="(d, i) in data" :key="i">{{ d.name }}</div>
        </div>





        <!-- \SAMPLE -->
      </div>
      <!-- 
      <div v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected" class="detail_container">
          <GroupDataView v-for="(d, i) in data" :key="i" :data="d" :config="config" 
             @onClick="selectDataView" />
        </div> -->

      <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected">
        Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
      </div>

      <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
        <v-progress-circular :size="70" :width="3" color="purple" indeterminate></v-progress-circular>
      </div>

      <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
        <div>
          <v-icon color="red" style="font-size: 5em">mdi-alert-circle-outline</v-icon>
        </div>
        <div color="red">
          Quelque chose s'est mal passé ! Veuillez
          <v-btn small outlined color="red" @click="retry">réessayer </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import SpriteComponent from "./SpriteComponent.vue"
import GroupDataView from "./groupDataView.vue";
import {
  EmitterViewerHandler,
  VIEWER_AGGREGATE_SELECTION_CHANGED,
} from "spinal-viewer-event-manager";
import { getPosition } from "../viewer/utils/getObjectPos";

@Component({
  components: {
    GroupDataView,
  },
  filters: {},
})
class dataSideApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  referenceObjects: any[];
  inventory: any;
  conso = "eyJuYW1lIjoic3BpbmFsLXR3aW4tc3RhbmRhcmQtZW5lcmd5LWZsdWlkcyIsInR5cGUiOiJCdWlsZGluZ0FwcCIsImlkIjoiYmFlZi0yYmRhLTk0ZjktMThmYTQ3YjIxMGIiLCJkaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE2NDUxNTAxMDE1LCJpbmRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3MTY0NTE0ODM5MTUsImljb24iOiJtZGktY2FyLWJyYWtlLWZsdWlkLWxldmVsIiwiZGVzY3JpcHRpb24iOiIiLCJ0YWdzIjpbXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtdHdpbi1zdGFuZGFyZC1lbmVyZ3ktZmx1aWRzIiwiaXNFeHRlcm5hbEFwcCI6ZmFsc2UsImxpbmsiOiIiLCJyZWZlcmVuY2VzIjp7fSwicGFyZW50Ijp7InBvcnRvZm9saW9JZCI6IjM3ZGUtMDJiOC1lMThiLTE4NTA2NDNiNjhhIiwiYnVpbGRpbmdJZCI6IjU5MzItNjA4Ni05ZTFhLTE4NTA2NDc4NDYwIn19"
  insights = "eyJuYW1lIjoiSW5zaWdodHMiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImIwZTEtNzI3NS02YWNhLTE4ZjJlMjE1NmE4IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxNDQ2NTk0NzM4MCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0NDY1ODg3OTEyLCJpY29uIjoibWRpLWN1cnRhaW5zLWNsb3NlZCIsImRlc2NyaXB0aW9uIjoiSU5zaWdodHMiLCJ0YWdzIjpbIkluc2lnaHRzIl0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0taW5zaWdodHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiNTkzMi02MDg2LTllMWEtMTg1MDY0Nzg0NjAifX0"
  tickets = "eyJuYW1lIjoic3BpbmFsLWVudi1wYW0tdGlja2V0cyIsInR5cGUiOiJCdWlsZGluZ0FwcCIsImlkIjoiZWI0ZC1hM2MxLWVmMTEtMThmMjBkZGM5YzciLCJkaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0MjQzMzcyMzcxLCJpbmRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3MTQyNDMzNTcxMjcsImljb24iOiJtZGktdGlja2V0LWFjY291bnQiLCJkZXNjcmlwdGlvbiI6IiIsInRhZ3MiOlsidGlja2V0Il0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0tdGlja2V0cyIsImlzRXh0ZXJuYWxBcHAiOmZhbHNlLCJsaW5rIjoiIiwicmVmZXJlbmNlcyI6e30sInBhcmVudCI6eyJwb3J0b2ZvbGlvSWQiOiIzN2RlLTAyYjgtZTE4Yi0xODUwNjQzYjY4YSIsImJ1aWxkaW5nSWQiOiI1OTMyLTYwODYtOWUxYS0xODUwNjQ3ODQ2MCJ9fQ"
  // tickets = "eyJuYW1lIjoiRGVzY3JpcHRpb24iLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImRhZGUtYTljYi1lMzc5LTE4ZjBmZGExZTI1IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxMzk1NzkyMTg4NiwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzEzOTU3OTAzOTA5LCJpY29uIjoibWRpLWJvb2staW5mb3JtYXRpb24tdmFyaWFudCIsImRlc2NyaXB0aW9uIjoic3BpbmFsLWVudi1wYW0tdmlld2VyLWFwcC1kZXNjcmlwdGlvbiIsInRhZ3MiOlsiRGVzY3JpcHRpb24iXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtZW52LXBhbS12aWV3ZXItYXBwLWRlc2NyaXB0aW9uIiwiaXNFeHRlcm5hbEFwcCI6ZmFsc2UsImxpbmsiOiIiLCJyZWZlcmVuY2VzIjp7fSwicGFyZW50Ijp7InBvcnRvZm9saW9JZCI6IjM3ZGUtMDJiOC1lMThiLTE4NTA2NDNiNjhhIiwiYnVpbGRpbmdJZCI6IjU5MzItNjA4Ni05ZTFhLTE4NTA2NDc4NDYwIn19"
  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }

  async mounted() {


    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.on(VIEWER_AGGREGATE_SELECTION_CHANGED, (data) => {
      if (data)
        this.findDynamicIdByDbid(data[0].dbIds[0], data[0]);

    });


    // await this.retriveData();
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;
  }


  async findDynamicIdByDbid(dbidToFind, data) {
    const buildingId = localStorage.getItem("idBuilding");
    const objects = this.referenceObjects
    for (const obj of objects[0]) {
      if (Array.isArray(obj.infoReferencesObjects)) {
        for (const ref of obj.infoReferencesObjects) {
          if (ref.dbid === dbidToFind && data.modelId.bimFileId == obj.bimFileId) {
            const referenceIds = obj.dynamicId
            // console.log({ dynamicId: obj.dynamicId, name: obj.name });
            // return { dynamicId: obj.dynamicId };
            const promises = [
              this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS, {
                buildingId,
                referenceIds
              }),
            ];
            const result = await Promise.all(promises);
            // console.log('les static details de mon objet sont', result);
            this.forgeItem(result, buildingId, ref.dbid, obj.bimFileId)
            return;

          }
        }
      }
    }
    return null;
  }

  forgeItem(result, buildingId, dbid, bimFileId) {
    // console.log(result);
    // Object.assign(item, { color: '#ded638', buildingId: buildingId, dbid: dbid, bimFileId: bimFileId });
    // console.log(this.data);
    let X = "0";
    let Y = "0";
    let Z = "0";

    result[0].attributsList.forEach(category => {
      category.attributs.forEach(attribute => {
        if (attribute.label === "XYZ center") {
          const coordinates = attribute.value.split(";");
          X = coordinates[0];
          Y = coordinates[1];
          Z = coordinates[2];
        }
      });
    });

    // const [X, Y, Z] = result[key]["XYZ center"].split(";");

    const item = {
      color: '#ded638',
      dynamicId: result[0].dynamicId,
      buildingId: buildingId,
      dbid: dbid,
      bimFileId: bimFileId,
      name: result[0].name,
      position: new THREE.Vector3(Number(X), Number(Y), Number(Z)),
      data: result[0]
    }
    this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
      items: item,
      buildingId: buildingId,
      component: SpriteComponent,
    });
  }

  extractUniqueInventoryNames() {
    let uniqueNames = new Set(); 
    const dataArray = this.inventory[0]
    dataArray.forEach(data => {
      if (data.inventories) {
        data.inventories.forEach(inventory => {
          if (inventory.name) {
            uniqueNames.add(inventory.name); 
          }
        });
      }
    });
    console.log(uniqueNames);
    return Array.from(uniqueNames); 
  }

  async retriveData() {
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      const patrimoineId = JSON.parse(localStorage.getItem("patrimoine")).id;
      const promises = [
        this.$store.dispatch(ActionTypes.GET_ROOMS, {
          buildingId,
          patrimoineId,
          floorId: this.selectedZone.staticId,
          id: this.selectedZone.dynamicId,
        }),
      ];
      const result = await Promise.all(promises);
      this.$store.commit(MutationTypes.SET_DATA, result[0]);
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }

  selectDataView(item) {
    this.$emit("clickOnDataView", item);
  }

  getDataDynamicIdtab() {
    // console.log(this.data , 'sssssssssssssssss');
    const dynamicIds = this.data.map(obj => obj.dynamicId);
    // console.log(dynamicIds);
    this.fetchReferenceObjects(dynamicIds)

    console.log(dynamicIds);

    this.getInventoryObject(dynamicIds)
  }
  async fetchReferenceObjects(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");
    // Les IDs que vous voulez récupérer

    const promises = [
      this.$store.dispatch(ActionTypes.GET_REFERENCE_OBJECT_LIST_MULTIPLE, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    // this.referenceObjects = result[0];
    this.referenceObjects = [...result];

  }
  async getInventoryObject(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");
    console.warn(referenceIds);


    const promises = [
      this.$store.dispatch(ActionTypes.GET_INVENTORY_MULTIPLE, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    // this.referenceObjects = result[0];
    this.inventory = [...result];
    this.extractUniqueInventoryNames()
    // console.warn(this.inventory);

  }

  /**
   * Watch
   */

  @Watch("selectedZone")
  watchSelectedZone() {
    if (this.selectedZone.type === "building") {
      this.isBuildingSelected = true;
      this.$store.commit(MutationTypes.SET_DATA, []);
      return;
    }

    this.isBuildingSelected = false;
    this.retriveData();
  }

  @Watch("data")
  watchData() {
    // console.log(this.data , 'toto');
    this.getDataDynamicIdtab()
    // console.log("AFFICHAGE SPRITES");
    // if (this.config.sprites)
    //   this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);

    // if (this.isBuildingSelected) return;


    // if (this.config.sprites) {
    //   this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
    //     items: [],
    //     buildingId: undefined,
    //     component: SpriteComponent,
    //   });
    //   return;
    // }
    // const buildingId = localStorage.getItem("idBuilding");

    // this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
    //   items: [],
    //   buildingId: buildingId || this.selectedZone.staticId,
    // });
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
<style lang="scss">
.cardContainer {
  padding: 10px;
}

.displaydataCss {
  display: none;
}

.entrence {
  -webkit-animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
  animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;

}

@-webkit-keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}


.inactiveTable {
  -webkit-animation: fade-out 0.3s ease-out both;
  animation: fade-out 0.3s ease-out both;
}

@-webkit-keyframes fade-out {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

a {
  text-decoration: none;

}

//Spinal_card
.Spinal_card {
  font-family: Charlevoix Pro !important;
  cursor: pointer;
  width: 250px;
  height: 100px;
  border-radius: 5px;
  background: linear-gradient(45deg, rgb(209, 209, 209) 0%, rgb(233, 233, 233) 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  margin: 5px
}

// .Spinal_card::before {
//   content: "";
//   height: 40px;
//   width: 100px;
//   position: absolute;
//   top: -40%;
//   left: -20%;
//   border-radius: 50%;
//   border: 35px solid rgba(240, 18, 18, 0.102);
//   transition: all .8s ease;
//   filter: blur(.5rem);
// }

.Spinal_card::before {
  content: "";
  height: 100px;
  width: 100px;
  position: absolute;
  top: -100%;
  left: 100%;
  background: url('../../assets/tets.svg') no-repeat center center;
  background-size: contain;
  transition: all .4s ease;
  filter: invert(1) saturate(5) hue-rotate(200deg) opacity(0.1);
  filter: blur(.5rem);
}

.Spinal_card:hover::before {
  top: 50%;
  left: 50%;
  transform: translate(30%, -0%);
  filter: blur(0rem);
  /* Pour centrer */
}

.Spinal_card:hover::before {
  width: 140px;
  height: 140px;
  top: -30%;
  left: 50%;
  filter: blur(0rem);
}

.text {
  flex-grow: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  color: #14202c;
  font-weight: 900;
  font-size: 1.2em;
  height: 30px
}

.subtitle {
  font-size: .6em;
  font-weight: 300;
  color: #14202c;
}

.icons {
  display: flex;
  justify-items: center;
  align-items: center;
  width: 250px;
  border-radius: 0px 0px 5px 5px;
  overflow: hidden;
}

.btn {
  z-index: 1;
  border: none;
  width: 100%;
  height: 35px;
  background-color: #ececec;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.4s
}

.svg-icon {
  width: 25px;
  height: 25px;
  stroke: #14202c;
}

.btn:hover {
  background-color: rgb(199, 199, 199);
}
</style>