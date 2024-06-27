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

    <div class="hide" @click="() => {
      $emit('full3D');
      resize();
      changeIcon()
    }"
      style="background-color: white;width: 50px;height: 50px;position: absolute;bottom: 20px;right: 20px;z-index: 9999;border-radius: 5px;border: 2px solid #14202c;justify-content: center;align-items: center;display: flex;">
      <v-icon v-if="modefull">mdi-text-box</v-icon>
      <v-icon v-else>mdi-video-3d</v-icon>
    </div>

    <!-- <div @click="testAction()">tototoototo</div> -->
    <div class="el3d">
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
    </div>

    <div>
      <div class="title">
        <!-- <div
          style="font-size: 20px;font-weight: bold;font-family: Arial, Helvetica, sans-serif;white-space: nowrap; margin-top: 10px;margin-left: 10px;">
          Informations générales</div> -->
        <!-- <div style="display: flex ; flex-direction: row;">
          <a class="button parallelogram" href="#">
            <span class="skew-fix">Attribut / Documentation</span> </a>
          <a class="button parallelogram" href="#">
            <span class="skew-fix">Insights / Endpoints</span> </a>
        </div> -->
        <div class="button parallelogram adaptative" style="">
          <v-select label="Details" v-model="selection"
            :items="['Vue global', 'Attribut', 'Indicateur', 'Points de mesures', 'Documentation']"></v-select>
        </div>
        <!-- 
        <div class="attribut" style="font-size: 18px;font-weight: bold;font-family: Arial, Helvetica, sans-serif; ">
          Docuentation</div> -->

        <div
          style="position: relative; font-family: Arial, Helvetica, sans-serif; height: 50px; width: 98px;margin-top: 0px; margin-bottom: -10px; border: 1px">
          <!-- Votre div incliné -->
          <!-- <div
            style="position: absolute; left: 0; height: 105%; background-color: rgb(240, 240, 240); width: 3px; transform: skew(-30deg) translateY(-0px);">
          </div> -->
          <!-- Zone de texte -->
          <div
            style=" height: 100%; display: flex; align-items: center;font-size: 18px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;white-space: nowrap;">
            <!-- 1250 m² -->
            <!-- {{ item.label }}
            {{ item.value }} -->

            <div v-if="floorstaticDetails.length && floorstaticDetails[0].attributsList.length">
              <div class="area" style="" v-for="(item, index) in floorstaticDetails[0].attributsList[0].attributs">
                <div style="position: absolute;" v-if="item.label == 'area'">
                  {{ item.value }} m²
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="inventory">
      <div v-if="selection == 'Vue global'">
        <div class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Inventaire
            des équipements ({{ config.inventory }})</span>
          <div>
            <div v-if="inventoyList == null"
              style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px; margin-bottom: 10px;">
              <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            </div>
            <div v-else class="inventory-container">
              <div v-for="(item, index) in inventoyList" :key="index" class="inventory-item">
                <li>{{ item }}</li>
              </div>
            </div>
          </div>
        </div>
        <div class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Liste des
            attributs</span>
          <div v-if="attributProfil == null"
            style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px ; margin-bottom: 10px;">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </div>
          <div v-else class="inventory-container">
            <div
              style="color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              class="inventory-item" v-for="(item, index) in attributProfil">
              <li> {{ item.label }}: {{ item.value }}</li>
            </div>
          </div>
        </div>

        <div class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Points de mesures
            ({{ config.profileName }})</span>

          <div class="inventory-container">

            <div v-if="endpointProfil == null"
              style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px; margin-bottom: 10px;">
              <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            </div>
            <div
              style="color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              class="inventory-item" v-for="endpoint in endpointProfil">
              <div> <span>{{ endpoint.name }}: </span>
                <span v-if="typeof endpoint.value === 'number'">{{ endpoint.value.toFixed(2) }}</span>
                <span v-else>{{ endpoint.value }} </span>
                <span v-if="endpoint.unit">{{ endpoint.unit }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>


      <!-- ONGLET ATTRIBUT -->
      <div v-if="selection == 'Attribut'">

        <div v-for="(item, index) in floorstaticDetails[0].attributsList" class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">{{ item.name
            }}</span>
          <div v-if="floorstaticDetails[0].attributsList == null"
            style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px ; margin-bottom: 10px;">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </div>
          <div v-else class="inventory-container">


            <div class="inventory-item"
              style="color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              v-for="(item, index2) in floorstaticDetails[0].attributsList[index].attributs">
              <li> {{ item.label }}: {{ item.value }}</li>
            </div>
          </div>

        </div>
      </div>


      <!-- ONGLET POINT DE MESURE -->
      <div v-if="selection == 'Points de mesures'">
        <!-- {{ floorstaticDetails[0].controlEndpoint }} -->
        <div v-for="(item, index) in floorstaticDetails[0].controlEndpoint" class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">{{
            item.profileName }}</span>
          <div v-if="floorstaticDetails[0].controlEndpoint == null"
            style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px ; margin-bottom: 10px;">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </div>
          <div v-else class="inventory-container">


            <div class="inventory-item"
              style="color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              v-for="(item, index2) in floorstaticDetails[0].controlEndpoint[index].endpoints">
              <li> {{ item.name }}: {{ item.value }}</li>
            </div>
          </div>

        </div>
      </div>

      <!-- ONGLET DOCUMENTATION -->

      <div v-if="selection == 'Documentation'">
        <!-- {{ floorstaticDetails[0].controlEndpoint }} -->
        <div v-for="(item, index) in documentation" class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">{{
            item.profileName }}</span>

          <div style="display: flex;" v-for="(item, index2) in documentation[index]">


            <div class="inventory-item"
              style="width: 90%;;color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;">
              <li> {{ item.Name }}</li>
            </div>

            <v-icon @click="downloadFile(item.dynamicId)" style="cursor: pointer; font-size: 40px;"
              color="green">mdi-download-box</v-icon>

          </div>

        </div>
      </div>

    </div>



    <div class="description">
      <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Accès aux
        applications</span>


      <div class="container_cards">


        <div v-for="item in appTab" class="cardDescription">
          <div @click="() => {
            $emit('changeRoute', item.id);
          }" class="data_cardDescription">
            <!-- <div class="nombre_data_cardDescription">
              {{ formatValue(item.value) }}<div class="microinfo">{{ item.unit }}</div>
            </div> -->
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
import { computed } from 'vue';
import {
  EmitterViewerHandler,
  VIEWER_AGGREGATE_SELECTION_CHANGED,
} from "spinal-viewer-event-manager";
import { getPosition } from "../viewer/utils/getObjectPos";
import { log, warn } from "console";

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
  // public  doubleCount = computed(() => this.floorstaticDetails[0]?.attributsList[0].attributs);

  get attributs(): any {
    // console.log(this.floorstaticDetails[0], 'aaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbccccccccccccccccc');

    if (this.floorstaticDetails && this.floorstaticDetails[0] && this.floorstaticDetails[0].attributsList && this.floorstaticDetails[0].attributsList[0]) {
      return this.floorstaticDetails[0].attributsList[0].attributs;
    }

    else if (type == "building") {
      console.log('tototot ??');

      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.batiment.profileNameControlePts);
      this.endpointProfil = profile ? profile.endpoints : [];
    }

    return null;
  }

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  referenceObjects: any[];
  inventory: any;
  appTab: any[] = [];
  inventoyList: any = null;
  floorstaticDetails: any = [];
  endpointProfil: any = null;
  buildingInfo: any;
  attributProfil: any;
  selection: string = 'Vue global';
  documentation: any;
  modefull = false;
  // conso = "eyJuYW1lIjoic3BpbmFsLXR3aW4tc3RhbmRhcmQtZW5lcmd5LWZsdWlkcyIsInR5cGUiOiJCdWlsZGluZ0FwcCIsImlkIjoiYmFlZi0yYmRhLTk0ZjktMThmYTQ3YjIxMGIiLCJkaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE2NDUxNTAxMDE1LCJpbmRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3MTY0NTE0ODM5MTUsImljb24iOiJtZGktY2FyLWJyYWtlLWZsdWlkLWxldmVsIiwiZGVzY3JpcHRpb24iOiIiLCJ0YWdzIjpbXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtdHdpbi1zdGFuZGFyZC1lbmVyZ3ktZmx1aWRzIiwiaXNFeHRlcm5hbEFwcCI6ZmFsc2UsImxpbmsiOiIiLCJyZWZlcmVuY2VzIjp7fSwicGFyZW50Ijp7InBvcnRvZm9saW9JZCI6IjM3ZGUtMDJiOC1lMThiLTE4NTA2NDNiNjhhIiwiYnVpbGRpbmdJZCI6IjU5MzItNjA4Ni05ZTFhLTE4NTA2NDc4NDYwIn19"
  // insights = "eyJuYW1lIjoiSW5zaWdodHMiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImIwZTEtNzI3NS02YWNhLTE4ZjJlMjE1NmE4IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxNDQ2NTk0NzM4MCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0NDY1ODg3OTEyLCJpY29uIjoibWRpLWN1cnRhaW5zLWNsb3NlZCIsImRlc2NyaXB0aW9uIjoiSU5zaWdodHMiLCJ0YWdzIjpbIkluc2lnaHRzIl0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0taW5zaWdodHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiNTkzMi02MDg2LTllMWEtMTg1MDY0Nzg0NjAifX0"
  // tickets = "eyJuYW1lIjoic3BpbmFsLWVudi1wYW0tdGlja2V0cyIsInR5cGUiOiJCdWlsZGluZ0FwcCIsImlkIjoiZWI0ZC1hM2MxLWVmMTEtMThmMjBkZGM5YzciLCJkaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0MjQzMzcyMzcxLCJpbmRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3MTQyNDMzNTcxMjcsImljb24iOiJtZGktdGlja2V0LWFjY291bnQiLCJkZXNjcmlwdGlvbiI6IiIsInRhZ3MiOlsidGlja2V0Il0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0tdGlja2V0cyIsImlzRXh0ZXJuYWxBcHAiOmZhbHNlLCJsaW5rIjoiIiwicmVmZXJlbmNlcyI6e30sInBhcmVudCI6eyJwb3J0b2ZvbGlvSWQiOiIzN2RlLTAyYjgtZTE4Yi0xODUwNjQzYjY4YSIsImJ1aWxkaW5nSWQiOiI1OTMyLTYwODYtOWUxYS0xODUwNjQ3ODQ2MCJ9fQ"
  // tickets = "eyJuYW1lIjoiRGVzY3JpcHRpb24iLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImRhZGUtYTljYi1lMzc5LTE4ZjBmZGExZTI1IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxMzk1NzkyMTg4NiwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzEzOTU3OTAzOTA5LCJpY29uIjoibWRpLWJvb2staW5mb3JtYXRpb24tdmFyaWFudCIsImRlc2NyaXB0aW9uIjoic3BpbmFsLWVudi1wYW0tdmlld2VyLWFwcC1kZXNjcmlwdGlvbiIsInRhZ3MiOlsiRGVzY3JpcHRpb24iXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtZW52LXBhbS12aWV3ZXItYXBwLWRlc2NyaXB0aW9uIiwiaXNFeHRlcm5hbEFwcCI6ZmFsc2UsImxpbmsiOiIiLCJyZWZlcmVuY2VzIjp7fSwicGFyZW50Ijp7InBvcnRvZm9saW9JZCI6IjM3ZGUtMDJiOC1lMThiLTE4NTA2NDNiNjhhIiwiYnVpbGRpbmdJZCI6IjU5MzItNjA4Ni05ZTFhLTE4NTA2NDc4NDYwIn19"
  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }

  changeIcon() {
    this.modefull = !this.modefull
  }

  // const floorsStatickD : computed(() => this.floorstaticDetails[0].attributsList[0].attributs )

  // computed {
  //   attributs(): any[] {
  //     if (this.floorstaticDetails && this.floorstaticDetails[0] && this.floorstaticDetails[0].attributsList && this.floorstaticDetails[0].attributsList[0]) {
  //       return this.floorstaticDetails[0].attributsList[0].attributs;
  //     }
  //     return [];
  //   }
  // }

  async mounted() {


    if (this.selectedZone.type == "building") {
      console.log('ici faire les requete pour building');

      this.loadBuildingInfo()
    }

    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.on(VIEWER_AGGREGATE_SELECTION_CHANGED, (data) => {
      // console.log(data, 'dzdzdzd', VIEWER_AGGREGATE_SELECTION_CHANGED);

      if (data)
        this.findDynamicIdByDbid(data[0].dbIds[0], data[0]);

    });
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;
  }

  async loadBuildingInfo() {
    await this.getBuildingInfo();
    if (this.buildingInfo[0].dynamicId) {
      console.warn(this.buildingInfo[0].dynamicId, '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');

      const result = await this.getBuildingStaticDetails();
      console.log(result, '??????????????');
      
      this.floorstaticDetails = result
      this.filteredEndpoints('building')
      this.filtredAttribut('building')
      this.getDocumentation()
      this.$forceUpdate();
    }
  }

  async getDocumentation() {
    const currentQuery = { ...window.parent.routerFontion.apps[0]._route.query }
    const promises = [
      this.$store.dispatch(ActionTypes.GET_DOCUMENTATION, {
        buildingId: localStorage.getItem("idBuilding"),
        referenceIds: this.buildingInfo[0].dynamicId,
      }),
    ];
    const result = await Promise.all(promises);
    this.documentation = result
  }

  async getBuildingStaticDetails() {

    const promises = [
      this.$store.dispatch(ActionTypes.GET_BUILDING_STATIC_DETAILS, {
        buildingId: localStorage.getItem("idBuilding"),
        referenceIds: this.buildingInfo[0].dynamicId
      }),
    ];
    const result = await Promise.all(promises);
    return result
  }
  async downloadFile(referenceIds) {
    const promises = [
      this.$store.dispatch(ActionTypes.POST_DOWNLOAD_FILE, {
        buildingId: localStorage.getItem("idBuilding"),
        referenceIds: referenceIds
      }),
    ];
    const result = await Promise.all(promises);

    // Créer un URL object à partir du blob et déclencher le téléchargement
    result.forEach(blob => {
      console.log(blob.type);
      const type = blob.type.split('/', 2);
      console.log(type);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filename.' + type[1]); // ou déterminez le nom de fichier de manière dynamique
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });

    console.warn('Le fichier a été téléchargé');
    return result;
  }



  async getBuildingInfo() {
    const buildingId = localStorage.getItem("idBuilding");

    const promises = [
      this.$store.dispatch(ActionTypes.GET_BUILDING_INFO, {
        buildingId,
      }),
    ];
    const result = await Promise.all(promises);
    // console.warn([...result], '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! warn favour building   informationnnnnnnnnnnnnnn');
    this.buildingInfo = [...result]
  }


  formatValue(value) {
    if (Number.isInteger(value)) {
      return value;
    }

    return parseFloat(value.toFixed(2));
  }

  testAction() {
    const idtohide = [4247, 6408, 6409, 6407, 6410];
    const currentQuery = { ...window.parent.routerFontion.apps[0]._route.query }
    const item = {
      dynamicId: currentQuery.spaceSelectedId,
      buildingId: localStorage.getItem("idBuilding")
    };
    this.$store.dispatch(ActionTypes.HIDE_ITEMS, {
      item,
      idtohide
    });
  }

  async getBIMInfo(referenceIds) {
    //fonction a éditer lors du 
    console.log('get rayane');
    const buildingId = localStorage.getItem("idBuilding");
    // console.warn(referenceIds);
    const promises = [
      this.$store.dispatch(ActionTypes.GET_BIM_OBJECT_INFO, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    // console.log([...result], 'resukte finale de rayane');
    return [...result]
  }


  checkForReferenceObjectRoom(list) {
    return list.some(item => item.name === "hasReferenceObject.ROOM");
  }


  async findDynamicIdByDbid(dbidToFind, data) {
    const buildingId = localStorage.getItem("idBuilding");
    console.log('ici ajouter la nouvelle requetes pour choper les elements ujuuu lafonction rayane', dbidToFind, data);
    // console.log(data.dbIds);
    // console.log(data.modelId.bimFileId);
    const BimObject = [
      {
        "bimFileId": data.modelId.bimFileId,
        "dbids": data.dbIds
      }
    ]
    const referenceResult = await this.getBIMInfo(BimObject)


    console.log(referenceResult, 'le referecence resulte !!!!!!!!!!!!!!!!!!!!!!!!!');

    const isRoom = this.checkForReferenceObjectRoom(referenceResult[0][0].bimObjects[0].parent_relation_list)

    console.log(isRoom, 'cest un equipemetn ?');


    if (isRoom) {
      const objects = this.referenceObjects;
      console.log(objects);

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
              console.log('les static details de mon objet sont', result, ref.dbid, obj.bimFileId);
              this.forgeItem(result, buildingId, ref.dbid, obj.bimFileId, data.center)
              return;

            }
          }
        }
      }
      return null;
    }
    else {


      const referenceIds = referenceResult[0][0].bimObjects[0].dynamicId
      const promises = [
        this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS_EQUIPEMENT, {
          buildingId,
          referenceIds
        }),
      ];

      const result = await Promise.all(promises);

      this.forgeItem(result, buildingId, data.dbIds[0], data.modelId.bimFileId[0], data.center)
      return;
    }

  }



  async getfloorstaticdetails(id) {
    const buildingId = localStorage.getItem("idBuilding");
    // console.log('ENTRÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉ');

    const promises = [
      this.$store.dispatch(ActionTypes.GET_FLOOR_STATIC_DETAILS, {
        buildingId,
        referenceIds: id
      }),
    ];
    // console.log('FINNNNNNNNNNNNNNNNN');

    const result = await Promise.all(promises);
    // console.warn('les static details de mon floor sont', result);
    // console.log('RETURN');
    this.floorstaticDetails = result
    // console.log(this.createApp(result), ')
    // let type = 'floor'
    this.filteredEndpoints('floor')
    this.filtredAttribut('floor')
    this.getDocumentation()
    this.createApp(result)
    this.$forceUpdate();
    // return;
  }

  async getroomstaticdetails(id) {

    const buildingId = localStorage.getItem("idBuilding");
    // console.log('ENTRÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉ');

    const promises = [
      this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS, {
        buildingId,
        referenceIds: [id]
      }),
    ];

    const result = await Promise.all(promises);

    this.floorstaticDetails = result
    this.filteredEndpoints('room')
    this.filtredAttribut('room')
    this.getDocumentation()
    this.createApp(result)
    this.$forceUpdate();
  }




  createApp(tab) {
    let objetApp = [];
    console.log('tototot');

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
            appObject.value = matchedProfile.endpoints.length || 5
          }
        } else {
          console.log('Pas de profil qui match');
        }
      } else if (type === "tickets") {
        // Traitement pour les tickets
        if (!targetValue) {
          // console.log(tab);

          appObject.value = tab[0]?.tickets?.length;
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
  filtredAttribut(type) {

    let data = this.floorstaticDetails[0].attributsList
    let attributProfil = [];

    if (type === "floor") {
      const floorDetail = data.find(detail => detail.name.toLowerCase() === this.config.floor.profileNameAttribut.toLowerCase());
      if (floorDetail) {
        attributProfil = floorDetail.attributs;
      }
    } else if (type === "building") {
      const buildingDetail = data.find(detail => detail.name.toLowerCase() === this.config.batiment.profileNameAttribut.toLowerCase());
      if (buildingDetail) {
        attributProfil = buildingDetail.attributs;
      }
    }
    else if (type === "room") {
      const buildingDetail = data.find(detail => detail.name.toLowerCase() === this.config.room.profileNameAttribut.toLowerCase());
      if (buildingDetail) {
        attributProfil = buildingDetail.attributs;
      }
    }
    console.log(attributProfil);
    this.attributProfil = attributProfil

  }


  filteredEndpoints(type) {
    if (type == "floor") {
      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.profileName);
      this.endpointProfil = profile ? profile.endpoints : [];
    } else if (type == "building") {
      console.log('tototot ??');

      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.batiment.profileNameControlePts);
      this.endpointProfil = profile ? profile.endpoints : [];
    } else {
      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.profileNameRoom);
      this.endpointProfil = profile ? profile.endpoints : [];
    }

    console.log(this.endpointProfil);

    // this.$forceUpdate();
    // return profile ? profile.endpoints : [];
  }

  forgeItem(result, buildingId, dbid, bimFileId, center) {
    // console.log(center, '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    // Object.assign(item, { color: '#ded638', buildingId: buildingId, dbid: dbid, bimFileId: bimFileId });
    // console.log(this.data);

    let X = center.x;
    let Y = center.y;
    let Z = center.z;

    // result[0].attributsList.forEach(category => {
    //   category.attributs.forEach(attribute => {
    //     if (attribute.label === "XYZ center") {
    //       const coordinates = attribute.value.split(";");
    //       X = coordinates[0];
    //       Y = coordinates[1];
    //       Z = coordinates[2];
    //     }
    //   });
    // });

    // const [X, Y, Z] = result[key]["XYZ center"].split(";");

    const item = {
      color: '#ded638',
      dynamicId: result[0].dynamicId,
      buildingId: buildingId,
      dbid: dbid,
      bimFileId: bimFileId,
      name: result[0].name,
      position: new THREE.Vector3(Number(X), Number(Y), Number(Z)),
      data: result[0],
      config: this.config
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
    // console.log(uniqueNames);
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
    // console.log(this.data, 'sssssssssssssssss');

    const dynamicIds = this.data.map(obj => obj.dynamicId);

    console.log();

    // console.log(dynamicIds);
    this.fetchReferenceObjects(dynamicIds)

    // console.log(dynamicIds);

    this.getInventoryObject(dynamicIds)
  }
  async fetchReferenceObjects(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");

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
    // console.warn(referenceIds);


    const promises = [
      this.$store.dispatch(ActionTypes.GET_INVENTORY_MULTIPLE, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    // this.referenceObjects = result[0];
    this.inventory = [...result];
    // this.extractUniqueInventoryNames()
    // console.warn(this.inventory,'eeeeeeeee');
    this.countInventoryTypes([...result]);

  }



  countInventoryTypes(floors) {
    const inventoryCounts = {};
    // console.log(floors, 'les flllllllllllooooooooooooooorsssssss');

    floors[0].forEach(floor => {
      // Trouver l'entrée "Typologie" dans les inventories
      const typologyInventory = floor.inventories.find(inventory => inventory.name === this.config.inventory);

      if (typologyInventory) {
        // Compter chaque groupe dans l'inventaire "Typologie"
        typologyInventory.inventory.forEach(group => {
          if (inventoryCounts[group.name]) {
            inventoryCounts[group.name] += group.equipments.length;
          } else {
            inventoryCounts[group.name] = group.equipments.length;
          }
        });
      }
    });

    // Créer et afficher la liste des comptes
    const results = [];
    for (const [key, value] of Object.entries(inventoryCounts)) {
      results.push(`${value} ${key}`);
    }
    this.inventoyList = results
    // console.log(results, '///////////////');
    this.$forceUpdate();
    return results;
  }

  /**
   * Watch
   */

  @Watch("selectedZone")
  watchSelectedZone() {
    console.log('UWUWUWUWUWUWUWU', this.selectedZone);

    if (this.selectedZone.type === "building") {
      console.log('ici faire les requetes pour buildings');
      this.loadBuildingInfo()
      this.isBuildingSelected = true;
      this.$store.commit(MutationTypes.SET_DATA, []);
      return;
    } else {
      this.isBuildingSelected = false;
      this.retriveData();
    }
  }

  // @Watch("floor")
  // watchfloor() {
  //   // console.log('LE FLORR SELECTIONNÉ EST :', this.floor);
  //   // console.log(this.floor, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  //   // this.getfloorstaticdetails(this.floor)
  // }

  @Watch("data")
  watchData() {
    if (this.selectedZone.type != "building") {

      if (this.data.length == 0) {
        this.getroomstaticdetails(this.selectedZone.dynamicId)

        this.getInventoryObject([this.selectedZone.dynamicId])
        // this.watchfloor()
      } else {
        console.log('ETAGE');
        this.getfloorstaticdetails(this.floor)
        this.getDataDynamicIdtab()
      }
    }
    else {
      console.warn('GET_BUILDING_INFO', 'building ???????????????????');

    }


    // this.getDataDynamicIdtab()




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

.area {
  transform: translate(0, -15px);
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

.inventory-container {
  display: flex;
  flex-wrap: wrap;
}

.attribut {
  position: relative;
  font-size: 18px;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  padding-left: 20px;

  // background-color: red;
  cursor: pointer;
  /* espace pour la bordure inclinée */
}

.attribut::before {
  content: "";
  position: absolute;
  top: -10px;
  bottom: 0;
  left: 0;
  width: 2px;
  height: 176%;
  background-color: rgb(223, 223, 223);

  transform: rotate(25deg);
  /* Inclinez l'élément ici */
  transform-origin: left top;
  // transform: translate(-100px);
}

.inventory-item {
  width: 48%;
  margin: 1%;
  height: 18px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
}

@media (max-width: 960px) {
  .inventory-item {
    width: 100%;
  }

  .area {
    transform: translate(10px, -15px);
  }

  .el3d {
    display: none;
  }
}

.blocInformation {
  background-color: rgb(240, 240, 240);
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 18px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
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


.inventory:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 120px;
  border-top: 2px solid rgb(235, 234, 234);
  width: auto;

}


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

.adaptative {
  width: 80%;
  overflow: hidden;
  height: 50px;
  position: relative;
  right: 0px;

}

.svg-icon {
  width: 25px;
  height: 25px;
  stroke: #14202c;
}

.btn:hover {
  background-color: rgb(199, 199, 199);
}

.button {
  background-color: rgb(224, 224, 224);
  // box-shadow: 10px 10px 0 rgba(0, 0, 0, .5);
  display: inline-block;
  padding: 5px;
  text-decoration: none;
  height: 52px;
  padding-left: 10px;
  padding-right: 10px;
  transition: 0.2s;
  border-left: 1px solid rgb(196, 196, 196);
  white-space: nowrap;
  margin-left: 20px;
  margin-top: 6px;
  margin-bottom: 5px;
}

.button:hover {
  background-color: rgb(201, 201, 201);
  // box-shadow: 0 0 0;
}



.parallelogram {
  transform: skew(-20deg);
}

.skew-fix {
  display: inline-block;
  transform: skew(30deg);
  font-size: 14px;
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
  // padding: 10px;
}

.inventory {
  position: relative;
  padding: 10px;
  height: 70%;
  overflow: auto;

  overflow-x: hidden
    /* border-top: 2px solid rgb(235, 234, 234); */

}

.inventory:before {
  content: "";
  /* Nécessaire pour que le pseudo-élément soit généré */
  position: absolute;
  left: 0;
  top: 0;
  border-top: 1px solid rgb(235, 234, 234);
  width: 400px;

}

.description {
  padding: 10px;
  padding-top: 15px;
  background-color: rgb(255, 255, 255);
  /* box-shadow: rgb(217, 226, 235) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.596) -3px -3px 6px 1px inset; */
  border-top: 2px solid rgb(235, 234, 234);
  overflow: auto;
  height: 25%;
}

@media (max-width: 960px) {
  // .description {
  //   display: ;
  // }
}


.container_cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
  /* Cette propriété ajuste l'espacement entre les cartes */
}

.cardDescription {
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: white;
  width: 100%;
  height: 40px;
  /* border: 1px solid rgb(199, 199, 199); */
  border-radius: 5px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
  display: flex;
  overflow: hidden;
  user-select: none;
}



@media (max-width: 970px) {
  .cardDescription {
    width: 100vw;
  }
}

@media (min-width: 970px) {
  .hide {
    display: none;
    visibility: hidden;
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
  // width: 87%;
  width: 100%;
  height: 100%;
  display: flex;
  padding-left: 30px;
}

.gotoApp {
  justify-content: center;
  align-items: center;
  display: flex;
  // width: 13%;
  width: 50px;
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
  width: 90%;
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
  // background: url('../../assets/tets.svg') no-repeat center center;
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