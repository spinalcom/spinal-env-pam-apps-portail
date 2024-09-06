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
    <SpriteComponentMobile @close="handleClose"
      style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;"
      v-if="displaySprite" :data="isSmallScreen">
    </SpriteComponentMobile>

    <BreadcrumbSelector :ids="referencedId" :type="referencedType" />

    <div class="hide" @click="() => {
      gestionBouton()
    }"
      style="background-color: white;width: 50px;height: 50px;position: absolute;bottom: 20px;right: 20px;z-index: 9999;border-radius: 5px;border: 2px solid #14202c;justify-content: center;align-items: center;display: flex;">
      <v-icon v-if="modefull && !displaySprite">mdi-text-box</v-icon>
      <v-icon v-else-if="!modefull && !displaySprite">mdi-video-3d</v-icon>
      <v-icon v-else>mdi-close-circle-outline</v-icon>
    </div>

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
        <div class="button  adaptative" style="">
          <v-select label="Details" v-model="selection"
            :items="dynamicItems"></v-select>
        </div>

        <div style="width: 20%; justify-content: center;align-items: center;display: flex;"
          v-if="floorstaticDetails.length && floorstaticDetails[0].attributsList.length">
          <div style="" v-for="(item, index) in floorstaticDetails[0].attributsList[0].attributs">
            <div v-if="item.label == 'area'">
              {{ item.value }} m²
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="inventory">
      <div v-if="selection == 'Vue Globale'">
        <div v-if="inventoyList">
          <div v-if="inventoyList.length > 0" class="blocInformation">
            <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Inventaire
              des équipements ({{ config.inventory }})</span>
            <div>
              <div v-if="inventoyList == null"
                style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px; margin-bottom: 10px;">
                PAS DE DONNÉES DISPONIBLE
              </div>
              <div v-else class="inventory-container">
                <div v-for="(item, index) in inventoyList" :key="index" class="inventory-item">
                  <li>{{ item }}</li>
                  <div style="margin-left: 5px;">
                    <v-icon v-if="eyes.indexOf(index) === -1" @click="() => { hideelement(item); closeeyes(index) }"
                      style="cursor: pointer">mdi-eye-outline</v-icon>
                    <v-icon v-else @click="() => { hideelement(item); closeeyes(index) }"
                      style="cursor: pointer">mdi-eye-off-outline</v-icon>
                  </div>
                </div>
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
          <!-- endpoint -->
          <span v-if="selectedZone.type == 'geographicFloor'"
            style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Indicateur
          </span>
          <!-- {{ selectedZone.type }} -->
          <!-- <span v-if="selectedZone.type == 'geographicRoom'"
            style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Points de mesures
            ({{ config.profileNameRoom }})</span> -->
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

        <div class="blocInformation">
          <span v-if="selectedZone.type == 'geographicFloor'"
            style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Tickets
          </span>
          <div v-if="ticketsList && ticketsList[0]" class="inventory-container">
            <div
              style="color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              class="inventory-item">
              <div>Nombre de tickets : {{ ticketsList[0].length }} </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ONGLET attribut (attribut)-->
      <div v-if="selection == 'Attribut'">
        <div class="title_attribut">Attribut de la selection</div>
        <div v-for="(item, index) in floorstaticDetails[0].attributsList" class="blocInformation">
          <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">{{ item.name
            }}</span>
          <div v-if="floorstaticDetails[0].attributsList == null"
            style="justify-content: center; align-items: center; width: 100%; display: flex; margin-top: 10px; margin-bottom: 10px;">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </div>
          <div v-else class="inventory-container">
            <div class="inventory-item"
              style="color:#14202c; padding: 16px; border-radius: 5px; padding-left: 6px; background-color: #f9f9f9; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              v-for="(attr, index2) in item.attributs">
              <li>{{ attr.label }}: {{ attr.value }}</li>
            </div>
          </div>
        </div>

        <div class="title_attribut">Attribut des parents</div>

        <!-- Section pour afficher les parentAttribut -->
        <div v-for="(parentItem, parentIndex) in parentAttribut" class="parentInformation" :key="parentIndex">
          <div v-for="(parentItems, parentIndexs) in parentItem">
            <div class="blocInformation" v-if="parentItems.documentation.categoryAttributes.length > 0">
              <h3>{{ parentItems.name }}</h3>
              <div v-for="(category, catIndex) in parentItems.documentation.categoryAttributes"
                class="category-container" :key="catIndex">
                <h3
                  style="font-size: 19px; font-family: Arial, Helvetica, sans-serif; font-weight: bold; margin-top: 10px;">
                  {{ category.name }}
                </h3>
                <div class="category-attributes"
                  style="color:#14202c; padding: 16px; border-radius: 5px; padding-left: 6px; background-color: #f9f9f9; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;">
                  <li v-for="(attr, attrIndex) in category.attributs" :key="attrIndex">{{ attr.label }}: {{ attr.value
                    }}
                  </li>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ONGLET TICKETS -->
      <div v-if="selection == 'Tickets'">
        <!-- Vérification si les tickets existent -->
        <div v-if="ticketsList && ticketsList[0]">
          <!-- Boucle sur chaque ticket -->
          <div v-for="(ticket, index) in ticketsList[0]" :key="index" class="blocInformation">
            <div class="">
              <div>
                <!-- Affichage des informations principales du ticket -->
                <span style="font-size: 19px; font-family: Arial, Helvetica, sans-serif;font-weight: bold;">Inventaire
                  des équipements ({{ ticket.name }})</span>
                <div class="back_blanc">
                  <!-- <li class="back_blanc"> <strong>Nom :</strong> {{ }}</li> -->
                  <li><strong>Description :</strong> {{ ticket.description }}</li>
                  <li><strong>Date de création :</strong> {{ new Date(ticket.creationDate).toLocaleString() }}</li>
                  <li><strong>Priorité :</strong> {{ ticket.priority }}</li>
                  <li><strong>Étape actuelle :</strong> {{ ticket.step.name }}</li>
                  <li><strong>Processus :</strong> {{ ticket.process.name }}</li>
                  <li><strong>Nom du workflow :</strong> {{ ticket.workflowName }}</li>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Affichage lorsqu'il n'y a pas de tickets -->
        <div v-else>
          <p>Aucun ticket disponible.</p>
        </div>
      </div>


      <!-- ONGLET POINT DE MESURE (endpoints)-->
      <div v-if="selection == 'Points de mesures'">
        <!-- {{ floorstaticDetails }} -->
        <div v-for="(item, index) in floorstaticDetails[0].endpoints" class="blocInformation">
          <div v-if="floorstaticDetails[0].endpoints == null"
            style="justify-content: center;align-items: center;width: 100%;display: flex; margin-top: 10px ; margin-bottom: 10px;">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </div>
          <div v-else class="inventory-container">


            <div class="inventory-item"
              style="color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
              v-for="(item, index2) in floorstaticDetails[0].endpoints[index]">
              <li> {{ item.name }}: {{ item.value }} {{ item.unit }}</li>
            </div>
          </div>

        </div>
      </div>

      <!-- ONGLET INDICATEUR (controleEndpoint) indicateur -->
      <div v-if="selection == 'Indicateur'">
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
        <h3>{{ floorstaticDetails[0].name }}</h3>
        <div class="blocInformation">
          <div style="display: flex;" v-for="(item, index) in documentation.element">
            <div class="inventory-item"
              style="width: 90%;color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;">
              <li>{{ item.Name }}</li>
            </div>

            <v-icon @click="downloadFile(item.dynamicId)" style="cursor: pointer; font-size: 40px;" color="green">
              mdi-download-box
            </v-icon>
          </div>
        </div>

        <h3>Documents des Parents</h3>
        <br>
        <div v-for="(parent, index) in documentation.parents" :key="index">
          <div v-if="parent.documentation && parent.documentation.length > 0">
            <h3>{{ parent.name }}</h3>
            <div class="blocInformation">
              <div style="display: flex;" v-for="(item, index2) in parent.documentation" :key="index2">
                <div class="inventory-item"
                  style="width: 90%;color:#14202c;padding: 16px;border-radius: 5px;padding-left: 6px ;background-color: #f9f9f9;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;">
                  <li>{{ item.Name }}</li>
                </div>
                <v-icon @click="downloadFile(item.dynamicId)" style="cursor: pointer; font-size: 40px;" color="green">
                  mdi-download-box
                </v-icon>
              </div>
            </div>
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
import SpriteComponentMobile from "./SpriteComponentMobile.vue";
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import SpriteComponent from "./SpriteComponent.vue"
import GroupDataView from "./groupDataView.vue";
import BreadcrumbSelector from "./breadcrumb.vue";
import { computed } from 'vue';
import {
  EmitterViewerHandler,
  VIEWER_AGGREGATE_SELECTION_CHANGED,
} from "spinal-viewer-event-manager";
import { getPosition } from "../viewer/utils/getObjectPos";
import { log, warn } from "console";
import { getParent } from "../../services/spinalAPI/GeographicContext/geographicContext";

@Component({
  components: {
    GroupDataView,
    SpriteComponentMobile,
    BreadcrumbSelector,
  },
  filters: {},
})
class dataSideApp extends Vue {

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
  appTab: any[] = [];
  inventoyList: any = null;
  inventoryDbids: any = null;
  floorstaticDetails: any = [];
  endpointProfil: any = null;
  buildingInfo: any;
  attributProfil: any = null;
  selection: string = 'Vue Globale';
  documentation: any;
  modefull = false;
  isSmallScreen: any;
  displaySprite: boolean = false;
  parentAttribut: any = [];
  ticketsList: any = [];
  eyes: [] = [];
  referencedId: any = 0;
  referencedType: any = 'building';

  get dynamicItems(): string[] {
    let items = ['Vue Globale', 'Attribut', 'Documentation', 'Tickets'];

    if (this.endpointProfil && this.endpointProfil.length > 0) {
      items.push('Indicateur');
    }

    if (this.floorstaticDetails[0]?.endpoints && this.floorstaticDetails[0].endpoints.length > 0) {
      items.push('Points de mesures');
    }

    return items;
  }
  
  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }

  changeIcon() {
    this.modefull = !this.modefull
  }

  hideelement(item) {
    localStorage.removeItem('Hidendbid');
    const itemType = item.substring(item.indexOf(' ') + 1);
    const numbers = this.inventoryDbids[itemType] || [];
    localStorage.setItem('Hidendbid', JSON.stringify(numbers));
    const currentQuery = { ...window.parent.routerFontion.apps[0]._route.query };

    const data = {
      buildingId: this.selectedZone.staticId,
      dynamicId: currentQuery.spaceSelectedId,
    };

    this.$store.dispatch(ActionTypes.HIDE_ITEMS, {
      items: data,
      buildingId: this.selectedZone.staticId,
    });
  }


  gestionBouton() {
    if (!this.displaySprite) {
      this.$emit('full3D');
      this.resize();
      this.changeIcon()
    } else {
      this.displaySprite = false
    }
  }


  async mounted() {

    if (this.selectedZone.type == "building") {
      this.loadBuildingInfo()
    }

    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.on(VIEWER_AGGREGATE_SELECTION_CHANGED, (data) => {

      if (data)
        this.findDynamicIdByDbid(data[0].dbIds[0], data[0]);

    });
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;
  }

  async loadBuildingInfo() {
    await this.getBuildingInfo();
    if (this.buildingInfo[0].dynamicId) {

      const result = await this.getBuildingStaticDetails();

      this.floorstaticDetails = result
      this.filteredEndpoints('building')
      this.getDocumentation(result)
      this.getTicket(result)
      this.filtredAttribut('building')
      this.$forceUpdate();
    }
  }


  async getTicket(data) {
    const buildingId = localStorage.getItem("idBuilding");
    const elementDynamicId = data[0].dynamicId

    const parentPromise = [
      this.$store.dispatch(ActionTypes.GET_TICKET, {
        buildingId: buildingId,
        referenceIds: elementDynamicId,
      }),
    ];

    const resultParent = await Promise.all(parentPromise);

    const tickets = resultParent;
    this.ticketsList = tickets;
    console.error(this.ticketsList);

  }

  async getDocumentation(data) {

    const buildingId = localStorage.getItem("idBuilding");
    const elementDynamicId = data[0].dynamicId;


    const parentPromise = [
      this.$store.dispatch(ActionTypes.GET_PARENT, {
        buildingId: buildingId,
        referenceIds: elementDynamicId,
      }),
    ];
    const resultParent = await Promise.all(parentPromise);
    const parents = resultParent[0];

    const documentationPromise = [
      this.$store.dispatch(ActionTypes.GET_DOCUMENTATION, {
        buildingId: buildingId,
        referenceIds: elementDynamicId,
      }),
    ];
    const result = await Promise.all(documentationPromise);

    const documentation = result[0];

    let parentDocumentation = {};
    for (let parent of parents) {
      const parentDocPromise = [
        this.$store.dispatch(ActionTypes.GET_DOCUMENTATION, {
          buildingId: buildingId,
          referenceIds: parent.dynamicId,
        }),
      ];
      const parentDocResult = await Promise.all(parentDocPromise);
      parentDocumentation[parent.dynamicId] = {
        name: parent.name,
        documentation: parentDocResult[0]
      };
    }

    this.documentation = {
      element: documentation,
      parents: parentDocumentation
    };

    this.$forceUpdate();
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

    result.forEach(blob => {
      const type = blob.type.split('/', 2);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filename.' + type[1]);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });

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
    this.buildingInfo = [...result]
  }



  async getBIMInfo(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");
    const promises = [
      this.$store.dispatch(ActionTypes.GET_BIM_OBJECT_INFO, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    return [...result]
  }


  checkForReferenceObjectRoom(list) {
    return list.some(item => item.name === "hasReferenceObject.ROOM");
  }


  async findDynamicIdByDbid(dbidToFind, data) {
    const buildingId = localStorage.getItem("idBuilding");
    const BimObject = [
      {
        "bimFileId": data.modelId.bimFileId,
        "dbids": data.dbIds
      }
    ]
    const referenceResult = await this.getBIMInfo(BimObject)

    const isRoom = this.checkForReferenceObjectRoom(referenceResult[0][0].bimObjects[0].parent_relation_list)

    if (isRoom) {
      const objects = this.referenceObjects;
      for (const obj of objects[0]) {
        if (Array.isArray(obj.infoReferencesObjects)) {
          for (const ref of obj.infoReferencesObjects) {
            if (ref.dbid === dbidToFind && data.modelId.bimFileId == obj.bimFileId) {
              const referenceIds = obj.dynamicId
              const promises = [
                this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS, {
                  buildingId,
                  referenceIds
                }),
              ];
              const result = await Promise.all(promises);
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

    const promises = [
      this.$store.dispatch(ActionTypes.GET_FLOOR_STATIC_DETAILS, {
        buildingId,
        referenceIds: id
      }),
    ];
    const result = await Promise.all(promises);
    this.floorstaticDetails = result
    this.filteredEndpoints('floor')
    this.getDocumentation(result)
    this.filtredAttribut('floor')
    this.getTicket(result)
    this.createApp(result)
    this.$forceUpdate();
  }
  //TODO , ici l'erreur , de getroomstaticdetails
  async getroomstaticdetails(id) {

    const buildingId = localStorage.getItem("idBuilding");


    const promises_node = [
      this.$store.dispatch(ActionTypes.GET_NODE_READ, {
        buildingId,
        referenceIds: [id]
      }),
    ];

    const node_read = await Promise.all(promises_node);

    if (node_read[0].type == "geographicRoom") {

      const promises = [
        this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS, {
          buildingId,
          referenceIds: [id]
        }),
      ];

      this.referencedType = node_read[0].type
      this.referencedId = id

      const result = await Promise.all(promises);

      this.floorstaticDetails = result
      this.filteredEndpoints('room')
      this.getDocumentation(result)
      this.getTicket(result)
      this.filtredAttribut('room')
      this.createApp(result)

    } else if (node_read[0].type == 'BIMObject') {


      this.referencedType = 'BIMObject'
      this.referencedId = id

      const promises = [
        this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS_EQUIPEMENT, {
          buildingId,
          referenceIds: [id]
        }),
      ];

      const result = await Promise.all(promises);

      this.floorstaticDetails = result
      this.filteredEndpoints('room')
      this.getDocumentation(result)
      this.getTicket(result)
      this.filtredAttribut('room')
      this.$forceUpdate();
    } else {
      this.referencedType = 'etage'
      this.referencedId = id
    }



  }


  createApp(tab) {
    let objetApp = [];
    if (!this.config || !this.config.application) {
      // console.warn("Configuration manquante");
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
              console.warn("Aucun endpoint correspondant trouvé pour la targetValue donnée.");
            }
          } else {
            appObject.value = matchedProfile.endpoints.length || 5
          }
        } else {
          console.warn('Pas de profil qui match');
        }
      } else if (type === "tickets") {
        if (!targetValue) {

          appObject.value = tab[0]?.tickets?.length;
        } else {
          console.warn('Pas de donnée disponible pour les tickets avec targetValue.');
        }
      } else {
        console.warn('Type non supporté, valeur non définie');
      }

      objetApp.push(appObject);
    });
    this.appTab = [...objetApp];
    return objetApp;
  }


  async getParentAttribut() {
    const buildingId = localStorage.getItem("idBuilding");
    const elementDynamicId = this.floorstaticDetails[0].dynamicId;

    const parentPromise = [
      this.$store.dispatch(ActionTypes.GET_PARENT, {
        buildingId: buildingId,
        referenceIds: elementDynamicId,
      }),
    ];

    const resultParent = await Promise.all(parentPromise);
    const parents = resultParent[0];

    const parentDynamicIds = parents.map(parent => parent.dynamicId);

    const parentDocPromise = [
      this.$store.dispatch(ActionTypes.GET_ATTRIBUT_LIST_MULTIPLE, {
        buildingId,
        referenceIds: parentDynamicIds,
      }),
    ];

    const parentDocResult = await Promise.all(parentDocPromise);
    const parentDocumentationResult = parentDocResult[0];

    let parentDocumentation = {};
    parents.forEach((parent, index) => {
      parentDocumentation[parent.dynamicId] = {
        name: parent.name,
        documentation: parentDocumentationResult[index]
      };
    });

    this.parentAttribut = {
      parents: parentDocumentation
    };

  }



  filtredAttribut(type) {

    this.getParentAttribut();
    let data = this.floorstaticDetails[0].attributsList
    let attributProfil = [];

    if (type === "floor") {
      const floorDetail = data.find(detail => detail.name.toLowerCase() === this.config.floor.profileNameAttribut.toLowerCase());
      if (floorDetail) {
        attributProfil = floorDetail.attributs;
      }
    }
    else if (type === "room") {
      const buildingDetail = data.find(detail => detail.name.toLowerCase() === this.config.room.profileNameAttribut.toLowerCase());
      if (buildingDetail) {
        attributProfil = buildingDetail.attributs;
      }
    }
    else {
      const buildingDetail = data.find(detail => detail.name.toLowerCase() === this.config.batiment.profileNameAttribut.toLowerCase());
      if (buildingDetail) {
        attributProfil = buildingDetail.attributs;
      }
    }
    this.attributProfil = attributProfil

  }


  filteredEndpoints(type) {
    if (type == "floor") {
      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.floor.profileNameControlePts);
      this.endpointProfil = profile ? profile.endpoints : [];
    } else if (type == "building") {
      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.batiment.profileNameControlePts);
      this.endpointProfil = profile ? profile.endpoints : [];
    } else {
      const profile = this.floorstaticDetails[0].controlEndpoint.find(profile => profile.profileName === this.config.room.profileNameControlePts);
      this.endpointProfil = profile ? profile.endpoints : [];
    }

  }

  forgeItem(result, buildingId, dbid, bimFileId, center) {

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


    const screenWidth = window.innerWidth;
    if (screenWidth <= 700) {
      this.displaySprite = false;
      this.isSmallScreen = item;
      this.displaySprite = true;
    } else {
      this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
        items: item,
        buildingId: buildingId,
        component: SpriteComponent,
      });
    }


  }

  handleClose() {
    this.displaySprite = false;
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
    const dynamicIds = this.data.map(obj => obj.dynamicId);
    this.fetchReferenceObjects(dynamicIds)
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
    this.referenceObjects = [...result];

  }
  async getInventoryObject(referenceIds) {
    const buildingId = localStorage.getItem("idBuilding");
    const promises = [
      this.$store.dispatch(ActionTypes.GET_INVENTORY_MULTIPLE, {
        buildingId,
        referenceIds
      }),
    ];
    const result = await Promise.all(promises);
    this.inventory = [...result];
    this.countInventoryTypes([...result]);

  }

  closeeyes(index) {
    const indexPosition = this.eyes.indexOf(index);
    if (indexPosition === -1) {
      this.eyes.push(index);
    } else {
      this.eyes.splice(indexPosition, 1);
    }
  }

  countInventoryTypes(floors) {
    const inventoryCounts = {};
    const inventoryDbids = {}; // Pour stocker les dbids regroupés par type d'inventaire

    floors[0].forEach(floor => {
      if (floor.inventories) {
        const typologyInventory = floor.inventories.find(inventory => inventory.name === this.config.inventory);

        if (typologyInventory) {
          typologyInventory.inventory.forEach(group => {
            if (inventoryCounts[group.name]) {
              inventoryCounts[group.name] += group.equipments.length;
            } else {
              inventoryCounts[group.name] = group.equipments.length;
            }

            // Collecter les dbids pour chaque type d'inventaire
            if (!inventoryDbids[group.name]) {
              inventoryDbids[group.name] = [];
            }
            group.equipments.forEach(equipment => {
              inventoryDbids[group.name].push(equipment.dbid);
            });
          });
        } else {
          console.warn(`Aucun inventaire trouvé pour le type "${this.config.inventory}" dans cet étage.`);
        }
      } else {
        console.warn(`Aucun inventaire trouvé pour cet étage :`, floor);
      }
    });

    const results = [];
    for (const [key, value] of Object.entries(inventoryCounts)) {
      results.push(`${value} ${key}`);
    }

    this.inventoyList = results;
    this.inventoryDbids = inventoryDbids;
    this.$forceUpdate();

    return results;
  }

  /**
   * Watch
   */

  @Watch("selectedZone")
  watchSelectedZone() {
    if (this.selectedZone.type === "building") {
      this.loadBuildingInfo()
      this.isBuildingSelected = true;
      this.$store.commit(MutationTypes.SET_DATA, []);
      return;
    } else {
      this.isBuildingSelected = false;
      this.retriveData();
    }
  }

  @Watch("data")
  watchData() {
    this.referencedId = 0;
    this.referencedType = ''
    //TOTO ICI L ERREUR 
    if (this.selectedZone.type != "building") {
      if (this.data.length == 0) {
        this.getroomstaticdetails(this.selectedZone.dynamicId)

        this.getInventoryObject([this.selectedZone.dynamicId])
        // this.watchfloor()
      } else {
        this.getfloorstaticdetails(this.floor)
        this.getDataDynamicIdtab()
      }
    }
    else {

      this.inventoyList = []
    }


    // this.getDataDynamicIdtab()




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
.back_blanc {
  margin: 6px;
  color: #14202c;
  padding: 9px;
  border-radius: 5px;
  padding-left: 6px;
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.title_attribut {
  font-size: 1.5rem;
}

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
  margin: 5px;
  height: 18px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  justify-content: space-between;
}

.v-select__selection--comma {
  font-size: 1.5rem !important;
  font-family: Arial, Helvetica, sans-serif;
  overflow: visible !important;
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
  background-color: #ebebeb;
  padding: 5px;
  border-radius: 2px;
  margin-bottom: 20px;
  margin-top: 10px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  margin-left: 11px;
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
  // background-color: rgb(224, 224, 224);
  // box-shadow: 10px 10px 0 rgba(0, 0, 0, .5);
  display: inline-block;
  padding: 5px;
  text-decoration: none;
  height: 59px;
  padding-left: 10px;
  padding-right: 10px;
  transition: 0.2s;
  // border-left: 1px solid rgb(196, 196, 196);
  white-space: nowrap;
  margin-left: 20px;
  margin-top: 6px;
  margin-bottom: 5px;
  font-size: xx-large;
  cursor: pointer;
}

.button:hover {
  background-color: rgb(228, 228, 228);
  // box-shadow: 0 0 0;
}


// >>> .v-input__slot::before {
//   border-style: none !important;
// }

.v-text-field>.v-input__control>.v-input__slot:before {
  border-style: none !important;
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
  position: relative;
  //background-color: RED;
  width: 100%;
  display: flex;
  // justify-content: space-between;
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
  border-top: 1px solid rgb(212, 212, 212);
  width: 100%;

}

.description {
  padding: 10px;
  padding-top: 15px;
  background-color: rgb(255, 255, 255);
  /* box-shadow: rgb(217, 226, 235) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.596) -3px -3px 6px 1px inset; */
  border-top: 2px solid rgb(201, 201, 201);
  overflow: auto;
  height: 25%;
}




.container_cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
  /* Cette propriété ajuste l'espacement entre les cartes */
}

.cardDescription {

  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  background-color: #fff;
  border-radius: 5px;
  width: 100%;
  height: 50px;
  margin-top: 8px;
  margin-bottom: 14px;
  transition: all .2s;
  display: flex;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px #3c40434d, 0 1px 3px 1px #3c404326;
  margin-left: 10px;
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
  background-color: rgb(221, 221, 221);
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