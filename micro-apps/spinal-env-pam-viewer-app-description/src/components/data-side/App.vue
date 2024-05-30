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

  <div class="appli">
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
    <div class="container">
      <div class="title">
        <div style="font-size: 22px;font-weight: bold;font-family: Arial, Helvetica, sans-serif;">
          Rez-de-chaussée</div>
        <!-- <div style=" font-weight: bold; font-family: Arial, Helvetica, sans-serif; height: 50px; background-color: rgb(240, 240, 240); margin-top: -10px; margin-bottom: -10px; margin-right: 94px;
                            width: 3px;
                            -webkit-transform:skew(-30deg);
                            -moz-transform:skew(-30deg);
                            -o-transform:skew(-30deg);
                            tranform:skew(-30deg);"> 
                            </div> -->

        <div
          style="position: relative; font-family: Arial, Helvetica, sans-serif; height: 50px; width: 98px;margin-top: -10px; margin-bottom: -10px;">
          <!-- Votre div incliné -->
          <div
            style="position: absolute; left: 0; height: 154%; background-color: rgb(240, 240, 240); width: 3px; transform: skew(-30deg) translateY(-12px);">
          </div>
          <!-- Zone de texte -->
          <div
            style="margin-left: 25px; height: 100%; display: flex; align-items: center;font-size: 20px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;white-space: nowrap;">
            1250 m²
          </div>
        </div>
      </div>
    </div>

    <div class="inventory">

      <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Inventaire
        de la piece</span>
      <div>
        
      </div>
      <div></div>
    </div>

    <div class="description">
      <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Vue
        d'ensemble et accès aux applications</span>


      <div class="container_cards">


        <div v-for="item in appTab" :key="item.id" class="cardDescription">
          <div @click="() => {
          $emit('changeRoute', item.id);
        }" class="data_cardDescription">
            <div class="nombre_data_cardDescription">
              {{ formatValue(item.value) }}<div class="microinfo">{{ item.unit }}</div>
            </div>
            <div class="description_data_cardDescription">
              {{ item.name }}
            </div>
          </div>
          <div class="gotoApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="#14202c" class="bi bi-chevron-right"
              viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
            </svg>
          </div>
        </div>



      </div>
    </div>


  </div>

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
  @Prop() floor: any;
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  referenceObjects: any[];
  inventory: any;
  appTab: any[];
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
  formatValue(value) {
    // On vérifie si la valeur est entière
    if (Number.isInteger(value)) {
      return value; // Si c'est un entier, on retourne la valeur sans modification
    }
    // Sinon, on utilise toFixed(2) pour limiter à deux décimales et parseFloat pour enlever les zéros inutiles
    return parseFloat(value.toFixed(2));
  }


  async findDynamicIdByDbid(dbidToFind, data) {
    const buildingId = localStorage.getItem("idBuilding");
    const objects = this.referenceObjects;
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

  async getfloorstaticdetails(id) {
    const buildingId = localStorage.getItem("idBuilding");
    console.log('ENTRÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉ');

    const promises = [
      this.$store.dispatch(ActionTypes.GET_FLOOR_STATIC_DETAILS, {
        buildingId,
        referenceIds: id
      }),
    ];
    console.log('FINNNNNNNNNNNNNNNNN');

    const result = await Promise.all(promises);
    console.warn('les static details de mon floor sont', result);
    console.log('RETURN');
    // console.log(this.createApp(result), ')
    this.createApp(result)
    this.$forceUpdate();
    // return;
  }

  createApp(tab) {
    let objetApp = [];  // Le tableau qui sera retourné avec les résultats

    // Assurer que this.config et this.config.application sont bien définis
    if (!this.config || !this.config.application) {
      console.log("Configuration manquante");
      return [];
    }

    this.config.application.forEach(application => {
      const { name, id, type, targetValue, profileName, unit } = application;

      let appObject = { name, id, value: null, unit: unit };

      if (type === "controlEndpoint") {
        const matchedProfile = tab[0].controlEndpoint.find(profile => profile.profileName === profileName);
        if (matchedProfile) {
          if (targetValue) {
            const targetEndpoint = matchedProfile.endpoints.find(endpoint => endpoint.name === targetValue);
            if (targetEndpoint) {
              appObject.value = targetEndpoint.value;
              if (targetEndpoint.unit) {
                appObject.unit = targetEndpoint.unit;
              }
            } else {
              console.log("Aucun endpoint correspondant trouvé pour la targetValue donnée.");
            }
          } else {
            appObject.value = matchedProfile.endpoints.length;
          }
        } else {
          console.log('Pas de profil qui match');
        }
      } else if (type === "tickets") {
        // Traitement pour les tickets
        if (!targetValue) {
          console.log(tab);

          appObject.value = tab[0].tickets.length;
        } else {
          console.log('Pas de donnée disponible pour les tickets avec targetValue.');
        }
      } else {
        console.log('Type non supporté, valeur non définie');
      }

      // Ajouter l'objet configuré à la liste de retour
      objetApp.push(appObject);
    });
    this.appTab = [...objetApp];
    return objetApp;
  }



  // findProfileData(config, data) {
  //   if (endpoints.profileName === config.profileName) {
  //     const targetEndpoint = endpoints.endpoints.find(endpoint => endpoint.name === config.targetValue);
  //     if (targetEndpoint) {
  //       return targetEndpoint.value;
  //     } else {
  //       console.log("Aucun endpoint correspondant trouvé pour la targetValue donnée.");
  //     }
  //   } else {
  //     console.log("Le profileName de la configuration ne correspond pas aux données.");
  //   }

  // }

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
    console.log(this.data, 'sssssssssssssssss');

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
    console.warn(this.inventory);

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

  @Watch("floor")
  watchfloor() {
    console.log('LE FLORR SELECTIONNÉ EST :', this.floor);
    this.getfloorstaticdetails(this.floor)
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




.appli {
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: white;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.container {}

.title {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

.inventory {
  position: relative;
  padding: 10px;
  height: 60%;
  /* border-top: 2px solid rgb(235, 234, 234); */
}

.inventory:before {
  content: "";
  /* Nécessaire pour que le pseudo-élément soit généré */
  position: absolute;
  left: 0;
  top: 0;
  /* Aligné au top de .inventory */
  right: 135px;
  border-top: 2px solid rgb(235, 234, 234);
  /* Le même style de bordure que voulu initialement */
  width: auto;
  /* Prendra la largeur nécessaire */
}

.description {
  padding: 10px;
  padding-top: 15px;
  background-color: rgb(255, 255, 255);
  /* box-shadow: rgb(217, 226, 235) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.596) -3px -3px 6px 1px inset; */
  border-top: 2px solid rgb(235, 234, 234);
  // height: 31vh;
  overflow: auto;
}

.container_cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
  /* Cette propriété ajuste l'espacement entre les cartes */
}

.cardDescription {
  margin-top: 10px;
  margin-bottom: 10px;
  background-color: white;
  width: 49%;
  height: 112px;
  /* border: 1px solid rgb(199, 199, 199); */
  border-radius: 5px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
  display: flex;
  overflow: hidden;
}


@media (max-width: 1270px) {
  .cardDescription {
    width: 40vw;
  }
}



.cardDescription:hover {
  background-color: rgb(245, 245, 245);
}

.cardDescription:hover .gotoApp {
  background-color: rgb(218, 218, 218);
}

.data_cardDescription {
  border-right: 1px solid rgb(202, 202, 202);
  width: 87%;
  height: 100%;
  display: flex;
  padding-left: 30px;
}

.gotoApp {
  justify-content: center;
  align-items: center;
  display: flex;
  width: 13%;
  background-color: rgb(243, 243, 243);
  transition: 0.2s;
  z-index: 1;
}


.nombre_data_cardDescription {
  /* background-color: red; */
  width: 40%;
  display: flex;
  // justify-content: center;
  align-items: center;
  font-size: 40px;
  height: 100%;

}

.description_data_cardDescription {
  width: 47%;
  justify-content: center;
  align-items: center;
  display: flex;
  color: #14202c;
  padding-right: 5px;
  // border-left: 1px solid black;

}



.microinfo {
  margin-bottom: 40px;
  font-size: 9px;
  transform: translate(-20px);
  white-space: nowrap;
  font-weight: bold;
}

.cardDescription::before {
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

.cardDescription:hover::before {
  top: 50%;
  left: 50%;
  transform: translate(30%, -0%);
  filter: blur(0rem);
}

.cardDescription:hover::before {
  width: 140px;
  height: 140px;
  top: -10%;
  left: 50%;
  filter: blur(0.05rem);
}
</style>