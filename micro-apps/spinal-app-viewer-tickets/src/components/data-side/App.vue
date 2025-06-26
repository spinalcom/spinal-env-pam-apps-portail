<template>

  <v-card elevation="4" class="card-container d-flex align-center justify-center">
    <div class=" dataContainer d-flex flex-column noMargin" style="height: 100%; width: 100%"
      v-if="pageSate === PAGE_STATES.loaded">

      <div
        v-if="(!showAddTicket) && ((selectedZone.type === 'building') || (selectedZone.name == 'Bâtiment') || (selectedZone.type === 'geographicFloor'))"
        class="profil-selec-container"
        :style="{ bottom: selectedZone.type === 'geographicFloor' ? '140px!important' : '' }">
        <ProfileSelector style="margin-bottom: 10px;" @profileSelected="handleProfileSelected"
          :disabled="isSwitchingSptires" />
      </div>

      <div class="d-flex flex-row justify-space-between" style="align-items: center; color: #14202c;">
        <div v-if="!showAddTicket" class="d-flex flex-row justify-space-between" style="">
          <div class="reload-container d-flex flex-column justify-space-between"
            style="width: 50px;height: 50px;margin-top: 0px;margin-right: 10px;">
            <div class="reload-btn" @click="startReload" :style="{ background: progressGradient }">
              <div class="reload-btn-inner">
                <v-icon>mdi-refresh</v-icon>
              </div>
            </div>
            <div v-if="noDataChangedMessage" class="no-data-message">
              Nouveaux tickets reçus
            </div>
          </div>
          <div class="d-flex flex-row" style="align-items: center;margin-top: -4px;">
            <div class="d-flex flex-column"
              style="height: 55px;font-size: 2rem;font-weight: 600;align-items: center;justify-content: center;margin-right: 5px;">
              {{ sortedTickets.length }}</div>
            <div class="d-flex flex-column justify-space-between" style="align-items: end;margin-top: 2px;">
              <div style="font-size: 1rem;font-weight: 600;margin-bottom: 3px;">Demande<span
                  v-if="sortedTickets.length > 1">s</span>
              </div>
              <div style="font-size: 0.7rem;color: grey;">En cours</div>
            </div>
          </div>

        </div>
        <div v-else class="d-flex flex-row justify-space-between" style="width: 40%;">
          <div class="d-flex flex-row" style="align-items: center;">

            <div class="d-flex flex-column justify-space-between" style="align-items: start;">
              <div style="font-size: 1.2rem;font-weight: 600;margin-bottom: 3px;">Déclaration des tickets</div>
              <!-- <div>En cours</div> -->
            </div>
          </div>

        </div>
        <div v-if="selectedProfile === 'Admin'" class="add-ticket-button" @click="toggleAddTicket">
          <div :class="['add-ticket-icon', showAddTicket ? 'list-tick' : 'key-tick']"></div>

          <div class="add-ticket-text-holder">
            <div class="add-ticket-text-bold">{{ showAddTicket ? "Voir la liste des" : "Déclaration d’un" }}</div>
            <div class="add-ticket-text-bold">TICKET DE MAINTENANCE</div>
          </div>
        </div>
      </div>

      <!-- <div v-if="!showAddTicket" class="d-flex flex-row justify-space-between" style="align-items: center;">

        <div class="d-flex flex-column justify-space-between" style="align-items: start;">
          <div class="app-title">Liste des tickets</div>
          <div class="app-description">{{ sortedTickets.length }} demande<span v-if="sortedTickets.length > 1">s</span>
          </div>
        </div>
        <div class="d-flex flex-column justify-space-between" style="align-items: end;">
          <div class="app-title">
            <template v-if="selectedZone.type === 'building' || selectedZone.name === 'Bâtiment'">
              {{ buildingitemsnumber }} Ticket<span v-if="buildingitemsnumber > 1">s</span>
            </template>
<template v-else>
              {{ flooritemsnumber }} Ticket<span v-if="flooritemsnumber > 1">s</span>
            </template>
</div>
<div class="app-description">sur {{ selectedZone.name }}</div>
</div>
</div>
<div v-else class="d-flex flex-row justify-space-between" style="align-items: center; margin-bottom: 10px;">
  <div class="d-flex flex-column justify-space-between" style="align-items: start;">
    <div class="app-title">Déclaration des tickets</div>
  </div>
</div> -->
      <div v-if="!showAddTicket">
        <FloorSpriteComponent v-if="selectedZone && selectedZone.type === 'geographicFloor'" :tickets="data"
          :isPriority="toggleLegend" :buildingTicketNumber="flooritemsnumber" type="geographicFloor" style="
          position: absolute;
          z-index: 9;
          left: calc(-10%);
          top: 50%;
          width: 35px;" />
        <FloorSpriteComponent v-else :tickets="data" :buildingTicketNumber="buildingitemsnumber"
          :isPriority="toggleLegend" type="geographicBuilding" style="
          position: absolute;
          z-index: 9;
          left: calc(-10%);
          top: 50%;
          width: 35px;" />
      </div>

      <div class="hide" @click="() => {
        $emit('full3D');
        resize();
        changeIcon()
      }"
        style="background-color: white;width: 50px;height: 50px;position: absolute;bottom: 20px;right: 20px;z-index: 9999;border-radius: 5px;border: 2px solid #14202c;justify-content: center;align-items: center;display: flex;">
        <v-icon v-if="modefull">mdi-text-box</v-icon>
        <v-icon v-else>mdi-video-3d</v-icon>
      </div>
      <div class="hide_inverse">
        <button cla @click="() => {
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
          z-index: 2;
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
          z-index: 2;
        " :style="{ left: DActive ? '-35px' : '-20px' }">
          <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
          <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
          <v-icon v-else>mdi-chevron-right</v-icon>
        </button>
      </div>
      <div v-if="showAddTicket" class="add-ticket-vue" style="height: 87%;">
        <TicketForm :selectedZone="selectedZone" :workflowlist="workflowlist" :domainlist="domainlist"
          :priorities="priorities" :building="buildingInfo" :selectedObj="selectedObjectFromViewer"
          :config="ticketConfig" />
      </div>
      <div v-if="!showAddTicket" class="d-flex flex-row justify-space-between filtres-container" style="width: 100%;">
        <div class="d-flex flex-column justify-space-between filtre-half-holder" style="height: 150px;">
          <div>
            <div class="filtre-title">
              Étape
            </div>
            <div style="height: 50px;width: 100%;display:flex;font-weight: bold;margin: auto;color: azure;">
              <StatusFiltre :list="steps2()" v-model="step_filter" @update:modelValue="handleStepFilterUpdate" />

            </div>
          </div>
          <div>
            <div class="filtre-title">
              Priorité
            </div>
            <div class="priority-list-container"
              style="width: 100%; height: 50px; display: flex; flex-direction: row; justify-content: space-between;">

              <div v-for="priority in priorities" :key="priority.value" class="d-flex flex-row row-style align-center"
                style="align-items: center;">
                <v-checkbox v-model="priority.selected" @change="applyPriorityFilter"
                  style="margin-right: 0px!important;" />
                <div class="d-flex flex-row align-center">
                  <div class="priority-indicator" :style="{ background: getPriorityColor(priority.value) }">
                  </div>
                  <div class="prio-filtre-text"
                    :style="{ textDecoration: priority.selected ? 'none' : 'line-through', opacity: priority.selected ? '1' : '0.5' }">
                    {{ getPriorityLabel(priority.label) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="width: 1px; background-color: #14202c20; margin: 0 10px;height: 150px;"></div>

        <div class="d-flex flex-column justify-space-between filtre-half-holder">
          <div>
            <div class="filtre-title">
              Workflow
            </div>
            <div class="dropdown-holder">

              <v-select class="workflow-label" color="#14202c" background-color="#fff" style="max-width: calc(100%)"
                solo flat @click.stop v-model="workflow_filter" label="Tous les workflows"
                placeholder="Tous les workflows" :items="workflows()" append-icon="mdi-chevron-down" clearable
                clear-icon="mdi-close-circle-outline" multiple menu-props="offset-y">
                <template v-slot:selection="{ item, index }">
                  <v-chip @click:close="domain_filter = workflow_filter.filter((w) => w !== item)" close
                    :close-icon="'mdi-close-circle'"
                    style="font-size: 11px; height: 24px; max-width: calc(100% - 50px);" v-if="index < 1">
                    <span style="max-width: 90%; overflow: hidden">{{ item }}</span>
                  </v-chip>

                  <span v-if="index === 1" class="text-grey text-caption align-self-center">
                    (+{{ workflow_filter.length - 1 }})
                  </span>
                </template>
              </v-select>
            </div>

          </div>
          <div>
            <div class="filtre-title">
              Domaine
            </div>
            <div class="dropdown-holder">
              <v-select color="#14202C" background-color="#fff" style="max-width: calc(100% );" solo flat @click.stop
                v-model="domain_filter" label="Tous les domaines" placeholder="Tous les domaines" :items="domains()"
                append-icon="mdi-chevron-down" clearable clear-icon="mdi-close-circle-outline" multiple
                menu-props="offset-y">
                <template v-slot:selection="{ item, index }">
                  <v-chip @click:close="
                    domain_filter = domain_filter.filter((d) => d !== item)
                    " close :close-icon="'mdi-close-circle'" style="
                  font-size: 11px;
                  height: 24px;
                  max-width: calc(100% - 50px);
                " v-if="index < 1">
                    <span style="max-width: 90%; overflow: hidden">{{ item }}</span>
                  </v-chip>

                  <span v-if="index === 1" class="text-grey text-caption align-self-center">
                    (+{{ domain_filter.length - 1 }})
                  </span>
                </template>
              </v-select>
            </div>
          </div>
        </div>
      </div>
      <!-- <div style="height: 1px; background-color: #14202c20; margin: 10px 0;"></div> -->
      <!-- SAMPLE -->
      <div v-if="!showAddTicket" class="d-flex flex-column flex-fill overflow-y-auto ticket-table-outer-container">
        <TicketTable :data="sortedTickets" :config="selectedProfile" :isGroup="toggleSprites" @locate="locateTicket"
          @display="showDetails" />

      </div>
      <!-- \SAMPLE -->
      <div v-if="(selectedZone.type === 'building') || (selectedZone.name == 'Bâtiment')">
        <div v-if="!toggleSprites" class="floor-sprite-full-container">
          <div class="floor-list-container">
            <div v-for="floor in full_floor_tickets_with_positions" :key="floor.dynamicId"
              style="display: flex;justify-content: center;align-items: center;margin-bottom: 10px;" :style="{
                height: `${Math.min(350 / full_floor_tickets_with_positions.length, 40)}px`,
                ...computeFloorGradient(floor)
              }">
              <div class="floor-item" @click="DegroupredCard(floor)">
                <div class="floor-name">{{ floor.floorName }}:</div>
                <div class="floor-ticket-count">{{ floor.countFloorTickets }}</div>
              </div>
              <!-- <div class="separator"></div> -->
            </div>
          </div>
        </div>
      </div>
      <div class="legend-full-container">
        <LegendVue v-if="!showAddTicket" :legendItems="legendItems" :stepslist="steps2()" :isPriority="toggleLegend"
          @togglePriority="handleLegendSelected" />

      </div>
      <ticketDetails v-if="detailedTicket" style="z-index: 99" v-model="showDialog" @changeRoute="handleRouteChange"
        @reloadRequested="startReload" :detailed-ticket="detailedTicket" :token="token" :baseURL="baseURL"
        :steps="fullstepList" :config="ticketConfig"></ticketDetails>
      <FloorCardComponent v-if="showGlobalCard" :key="floorCardKey" :data="floorCardData"
        @close="showGlobalCard = false" />
    </div>

    <!-- <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected">
      Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
    </div> -->

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <v-progress-circular :size="70" :width="3" color="purple" indeterminate></v-progress-circular>
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
      <div>
        <v-icon color="red" style="font-size: 5em">mdi-alert-circle-outline</v-icon>
      </div>
      <div color="red">
        Quelque chose s'est mal passé ! Veuillez
        <v-btn small outlined color="red" @click="retriveData('building')">réessayer
        </v-btn>
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
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { computePriorityGradient, getPriorityColor, resizeWindow } from "../../services/store/appDataStore/utils/UiUtils";
import { filterTickets, getTicketsWithRank, extractSortedSteps, sortTicketsByPriorityDateRank } from "../../services/store/appDataStore/utils/TicketFilterUtils";
import { fullstepList } from "../../services/store/appDataStore/utils/ticketUtils";
import { updateItemCounts } from "../../utils/ticketUtils";
import updateSprites, { showAllSprites } from "../../services/store/appDataStore/utils/SpritesUtils";

import {
  EmitterViewerHandler,
  VIEWER_AGGREGATE_SELECTION_CHANGED,
} from "spinal-viewer-event-manager";

import TicketComponent from "./TicketComponent.vue";
import TicketTable from "./components/DataTable.vue";
import StatusFiltre from "./components/StatusFiltre.vue";
import SpriteCardComponent from "./SpriteCardComponent.vue";
import FloorCardComponent from "./FloorCardComponent.vue";
import FloorSpriteCardComponent from "./FloorSpriteCardComponent.vue";
import FloorSpriteComponent from "./FloorSpriteComponent.vue";
import ProfileSelector from "./components/ProfileSelector.vue";
import { Legend } from "../../interfaces/ILegend";
import LegendVue from "./components/LegendVue.vue";
import { on } from "events";
import { EventBus } from "../SpaceSelector/eventBus";
import TicketForm from "./components/TicketForm.vue";
import { debounce } from "lodash";
import { Building } from "micro-apps/spinal-app-viewer-space/src/interfaces/API/Geographic Context/DTO/Request";
import TicketDetails from "./TicketDetailsNew.vue";



@Component({
  components: { TicketComponent, TicketTable, StatusFiltre, SpriteCardComponent, FloorCardComponent, FloorSpriteComponent, ProfileSelector, LegendVue, TicketForm, TicketDetails },
  filters: {},
})
class dataSideApp extends Vue {
  @Prop() config!: IConfig;
  @Prop() ticketConfig: Object;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop() selectedId: number;
  @Prop() buildingInfo: any;
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;
  @Prop() refrech: boolean;
  @Prop({ type: String, required: true }) baseURL!: string;
  @Prop({
    type: String,
    required: false,
  }) token!: string;

  referenceObjects: any[];

  workflowlist: any[];
  domainlist: any[];
  fullstepList: any[] = fullstepList;
  selectedObjectFromViewer: any = null;




  reloadInterval: number;
  progress = 0;
  timer: ReturnType<typeof setInterval> | undefined;
  noDataChangedMessage: boolean = false;
  messageTimeout: ReturnType<typeof setTimeout> | null = null;
  isFirstLoad: boolean = true;
  toggleSprites: boolean = true;
  toggleLegend: boolean = false;
  detailedTicket = null;
  showDialog = false;
  tickets_with_positions: any[];
  floor_tickets_with_positions: any[];
  full_floor_tickets_with_positions: any[];
  full_room_tickets_with_positions: any[];
  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  domain_filter = <string[]>[];
  step_filter = <string[]>[];
  workflow_filter = <string[]>[];
  selectedProfile: string;
  buildingitemsnumber: number = 0;
  flooritemsnumber: number = 0;
  roomitemsnumber: number = 0;
  equipementitemsnumber: number = 0;
  modefull: boolean = false
  isSwitchingSptires: boolean = false;
  showGlobalCard: boolean = false;
  GlobalCardData: any = null;
  floorCardData: any = null;
  floorCardKey: number = Date.now();

  getPriorityColor = getPriorityColor;
  priorities = [
    { value: 0, label: "Élevée", selected: true },
    { value: 1, label: "Moyenne", selected: true },
    { value: 2, label: "Faible", selected: true },
  ];
  showAddTicket: boolean = false;
  legendItems: Legend[] = [];
  gradient(countFloorList) {
    return computePriorityGradient(countFloorList);
  }
  toggleAddTicket() {
    this.showAddTicket = !this.showAddTicket;
    if (!this.showAddTicket) {
      this.callUpdateSprites(this.data, this.toggleLegend);
      this.reloadData(this.selectedZone.type);
    } else {
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
      this.$store.dispatch(ActionTypes.REMOVE_CARDS);
      this.showGlobalCard = false;
    }

  }
  showDetails(ticket) {
    this.detailedTicket = ticket;
    this.showDialog = true;
  }
  handleRouteChange() {
    this.$emit('changeRoute');
  }


  tickets() {
    return getTicketsWithRank(this.data, this.selectedId);
  }

  workflows() {
    return [...new Set(this.tickets().map((t) => t.workflowName))];
  }

  workflowsFilteredTickets() {
    if (this.workflow_filter.length === 0 || this.tickets().length === 0)
      return this.tickets();
    return this.tickets().filter((t) =>
      this.workflow_filter.includes(t.workflowName)
    );
  }
  domains() {
    return [...new Set(this.filteredTickets.map((t) => t.process.name))];
  }
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async handleProfileSelected(isGrouped) {
    if (this.isSwitchingSptires) return;
    EventBus.$emit("reset-tickets");
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.showGlobalCard = false;
    this.isSwitchingSptires = true;
    this.toggleSprites = isGrouped;

    try {
      if (this.toggleSprites) {
        await this.callUpdateSprites(this.sortedTickets, this.toggleLegend);
      } else {
        await showAllSprites({
          store: this.$store,
          buildingId: localStorage.getItem("idBuilding") || "",
          config: this.config,
          selectedZone: this.selectedZone,
          data: this.sortedTickets,
          legend: this.toggleLegend,
          setContext: () => this.resetContext(localStorage.getItem("idBuilding")),
          setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
        });
      }
      await this.delay(1000); // Wait for 1 second
    } finally {
      this.isSwitchingSptires = false;
    }
  }
  async handleLegendSelected(isLegend) {
    this.toggleLegend = isLegend;
    try {
      if (this.toggleSprites) {
        await this.callUpdateSprites(this.sortedTickets, this.toggleLegend);
      } else {
        await showAllSprites({
          store: this.$store,
          buildingId: localStorage.getItem("idBuilding") || "",
          config: this.config,
          selectedZone: this.selectedZone,
          data: this.sortedTickets,
          legend: this.toggleLegend,
          setContext: () => this.resetContext(localStorage.getItem("idBuilding")),
          setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
        });
      }
    } finally {
      // this.isSwitchingSptires = false;
    }
  }

  domainFilteredTickets() {
    if (this.domain_filter.length === 0 || this.data.length === 0)
      return this.workflowsFilteredTickets();

    const filtered = this.workflowsFilteredTickets().filter((d) =>
      this.domain_filter.includes(d.process.name)
    );
    return filtered;
  }
  steps2() {
    return extractSortedSteps(this.domainFilteredTickets());
  }

  get filteredTickets() {
    return filterTickets(
      this.tickets(),
      this.workflow_filter,
      this.domain_filter,
      this.step_filter
    );
  }

  resize() {
    resizeWindow();
  }

  changeIcon() {
    this.modefull = !this.modefull
  }
  get sortedTickets() {
    const filteredTickets = this.filteredTickets.filter((ticket) =>
      this.priorities.find(
        (priority) => priority.value === ticket.priority && priority.selected
      )
    );
    const enrichedTickets = filteredTickets.map(ticket => {
      const lastModifDate = ticket.log_list && ticket.log_list.length > 1
        ? ticket.log_list[ticket.log_list.length - 1].date
        : ticket.creationDate;
      return { ...ticket, lastModifDate };
    });
    this.$emit("download", filteredTickets);
    return sortTicketsByPriorityDateRank(enrichedTickets);
  }


  showRecapCard(items: any | any[]) {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.showGlobalCard = false;
    const item = this.full_floor_tickets_with_positions.find(
      (floorItem) => floorItem.dynamicId === Number(items)
    );

    if (!item) {
      console.error(`No matching item found for dynamicId: ${items}`);
      return;
    }
    const buildingId = localStorage.getItem("idBuilding");
    item.buildingId = buildingId;
    item.parents = [buildingId];
    this.$store.dispatch(ActionTypes.ADD_CARD_COMPONENT, {
      items: item,
      buildingId: localStorage.getItem("idBuilding"),
      component: FloorSpriteCardComponent,
    });
  }
  callCard(items: any | any[]) {
    this.showGlobalCard = false;
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    const itemsArray = Array.isArray(items) ? items : [items];
    const validItems = itemsArray.filter(item => item != null);
    validItems.forEach(item => {
      item.steps = this.steps2();
    });

    validItems.forEach(item => {
      item.baseURL = this.baseURL;
      item.token = this.token;
    });
    this.$store.dispatch(ActionTypes.ADD_CARD_COMPONENT, {
      items: validItems,
      buildingId: localStorage.getItem("idBuilding"),
      component: SpriteCardComponent,
    });
    return;
  }
  callFloorCard(items: any | any[], type: "geographicFloor" | "geographicBuilding", clickedDynamicId?: number) {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.showGlobalCard = false;

    const itemsArray = Array.isArray(items) ? items : [items];

    let allTickets: any[] = [];

    if (type === "geographicFloor") {
      // For floor cards, flatten deeply
      allTickets = itemsArray.flatMap(item => {
        if (Array.isArray(item.data)) {
          return item.data.flatMap(subItem => subItem.data || subItem);
        } else if (item.data) {
          return item.data;
        } else {
          return item;
        }
      }).filter(Boolean);
    } else if (type === "geographicBuilding") {
      // For building cards, just collect tickets directly (no deep flattening)
      allTickets = itemsArray.flatMap(item => item.data || item).filter(Boolean);
    }

    const validItem = {
      data: allTickets,
      steps: this.steps2(),
      baseURL: this.baseURL,
      token: this.token,
      buildingId: itemsArray[0]?.buildingId || '',
      dynamicId: itemsArray[0]?.dynamicId || '',
      position: itemsArray[0]?.position || { x: 0, y: 0, z: 0 },
      withoutPosition: true,
      type: type,
      selectedDynamicId: clickedDynamicId, // Pass the clicked ticket id!
      selectedZone: this.selectedZone.type,
    };
    this.floorCardData = { ...validItem };
    this.floorCardKey = Date.now();
    this.$nextTick(() => {
      this.showGlobalCard = true;
    });
  }

  callBuildingCard(items: any | any[], type: "geographicFloor" | "geographicBuilding") {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    const itemsArray = Array.isArray(items) ? items : [items];

    const allTickets = itemsArray.flatMap(item => {
      if (Array.isArray(item.data)) {
        return item.data.flatMap(subItem => subItem.data || subItem);
      } else if (item.data) {
        return item.data;
      } else {
        return item;
      }
    }).filter(Boolean);

    const validItem = {
      data: allTickets,
      steps: this.steps2(),
      baseURL: this.baseURL,
      token: this.token,
      buildingId: itemsArray[0]?.buildingId || '',
      dynamicId: itemsArray[0]?.dynamicId || '',
      position: itemsArray[0]?.position || { x: 0, y: 0, z: 0 },
      withoutPosition: true,
      type: type,
      selectedZone: this.selectedZone.type,
    };
    this.floorCardData = { ...validItem };
    this.floorCardKey = Date.now();
    this.showGlobalCard = false;
    this.$nextTick(() => {
      this.showGlobalCard = true;
    });
  }

  DegroupredCard(floor) {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.showGlobalCard = false;
    const buildingId = localStorage.getItem("idBuilding");
    const dynamicId = floor.dynamicId;
    const position = floor.position || { x: 0, y: 0, z: 0 };
    const filteredTickets = this.sortedTickets.filter(ticket => ticket.elementSelected.dynamicId === floor.dynamicId);
    const validItem = {
      data: filteredTickets,
      steps: this.steps2(),
      baseURL: this.baseURL,
      token: this.token,
      buildingId,
      dynamicId,
      position,
      withoutPosition: true,
      type: "geographicFloor",
    };
    EventBus.$emit("move-tickets-to-selected", filteredTickets);
    this.callFloorCard([validItem], "geographicFloor", dynamicId);
  }



  async mounted() {
    this.selectedProfile = this.config.profilType;
    this.startTimer();
    this.reloadInterval = this.config.reloadInterval || 60000;

    const floors = await this.$store.dispatch(ActionTypes.GET_FLOORS, {
      buildingId: this.buildingInfo.buildingId,
      patrimoineId: this.buildingInfo.patrimoineId,
    });
    this.buildingInfo.floors = floors;
    // this.getDataDynamicIdtab();

    const emitterHandler = EmitterViewerHandler.getInstance();
    emitterHandler.on(VIEWER_AGGREGATE_SELECTION_CHANGED, (data) => {

      if (data)
        this.findDynamicIdByDbid(data[0].dbIds[0], data[0]);

    });

    EventBus.$on("call-card", this.locateTicket);
    EventBus.$on("showRecapCard", this.showRecapCard);
    EventBus.$on("show-modal-ticket-details", this.showDetails);

  }
  beforeDestroy() {
    clearInterval(this.timer);
    EventBus.$off("call-card", this.locateTicket);
    EventBus.$off("showRecapCard", this.showRecapCard);
    EventBus.$off("show-modal-ticket-details", this.showDetails);
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
              this.selectedObjectFromViewer = result

              return result;
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
      this.selectedObjectFromViewer = result
      return result;
    }
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

  async getDataDynamicIdtab() {
    const buildingId = localStorage.getItem("idBuilding");

    const promises = this.buildingInfo.floors.map(floor =>
      this.$store.dispatch(ActionTypes.GET_ROOMS, {
        buildingId,
        patrimoineId: this.buildingInfo.patrimoineId,
        floorId: floor.dynamicId,
        id: floor.dynamicId,
      })
    );
    const result = (await Promise.all(promises)).flat();

    const dynamicIds = result.map(obj => obj.dynamicId);

    this.fetchReferenceObjects(dynamicIds)
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
    // this.data_loading += 15
  }
  computeFloorGradient(floor) {
    if (!this.toggleLegend) {
      // PRIORITY mode using countFloorList
      const counts = floor.countFloorList || [];
      const total = counts.reduce((acc, val) => acc + val, 0) || 1;

      // Define the color map based on index: 0 = High, 1 = Medium, 2 = Low
      const colors = ["red", "orange", "green"];
      let currentAngle = 0;

      const segments = counts.map((count, idx) => {
        const angle = Math.round((count / total) * 360);
        const start = currentAngle;
        const end = currentAngle + angle;
        currentAngle = end;
        return `${colors[idx]} ${start}deg ${end}deg`;
      });

      return {
        background: `conic-gradient(${segments.join(", ")})`
      };

    } else {
      // STEP mode using stepCountFloorList
      const steps = floor.stepCountFloorList || [];
      const total = steps.reduce((acc, step) => acc + step.count, 0) || 1;
      let currentAngle = 0;

      const segments = steps
        .sort((a, b) => a.order - b.order)
        .map(step => {
          const angle = Math.round((step.count / total) * 360);
          const start = currentAngle;
          const end = currentAngle + angle;
          currentAngle = end;
          return `${step.color} ${start}deg ${end}deg`;
        });

      return {
        background: `conic-gradient(${segments.join(", ")})`
      };
    }
  }




  async retriveData(type: "building" | "geographicFloor" | "geographicRoom") {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.showGlobalCard = false;
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      if (type == "building") {
        const workflow_promises = [
          this.$store.dispatch(ActionTypes.LOAD_WORKFLOWS, {
            buildingId,
            dynamicId: 0,
          }),
        ];
        const workflow_result = await Promise.all(workflow_promises);
        this.workflowlist = workflow_result[0];
        this.workflowlist = workflow_result[0].filter(wf =>
          this.ticketConfig.workflowList.includes(wf.name)
        );

        const process_promises = [
          this.$store.dispatch(ActionTypes.LOAD_PROCESS, {
            buildingId,
            workflowlist: this.workflowlist,
          }),
        ];
        const process_result = await Promise.all(process_promises);
        this.domainlist = process_result[0];


        const promises = [
          this.$store.dispatch(ActionTypes.FILTER_TICKETS, {
            buildingId,
            dynamicId: 0,
          }),
        ];
        const result = await Promise.all(promises);
        result[0].forEach((item) => {
          if (item.priority === "") {
            item.priority = 0;
          }
        });
        await this.$store.commit(MutationTypes.SET_DATA, result[0]);
        await this.callUpdateSprites(result[0], this.toggleLegend);
        const counts = updateItemCounts(this.data);
        this.buildingitemsnumber = counts.buildingitemsnumber;
        this.flooritemsnumber = counts.flooritemsnumber;
        this.roomitemsnumber = counts.roomitemsnumber;
        this.equipementitemsnumber = counts.equipementitemsnumber;
        this.$emit("updateBuildingTickets", this.buildingitemsnumber);
      } else if (type == "geographicFloor" || type == "geographicRoom") {
        const promises = [
          this.$store.dispatch(ActionTypes.FILTER_TICKETS, {
            buildingId,
            dynamicId: this.selectedZone.dynamicId,
          }),
        ];
        const result = await Promise.all(promises);
        result[0].forEach((item) => {
          if (item.priority === "") {
            item.priority = 0;
          }
        });
        await this.$store.commit(MutationTypes.SET_DATA, result[0]);
        await this.callUpdateSprites(result[0], this.toggleLegend);
        const counts = updateItemCounts(this.data);
        this.buildingitemsnumber = counts.buildingitemsnumber;
        this.flooritemsnumber = counts.flooritemsnumber;
        this.roomitemsnumber = counts.roomitemsnumber;
        this.equipementitemsnumber = counts.equipementitemsnumber;
        this.$emit("updateBuildingTickets", this.buildingitemsnumber);
      }
      this.legendItems = [
        {
          title: "Bâtiment",
          color: "#14202c",
          type: "pentagon",
          number: this.buildingitemsnumber,
        },
        {
          title: "Étage",
          color: "#14202c",
          type: "square",
          number: this.flooritemsnumber,
        },
        {
          title: "Salle",
          color: "#14202c",
          type: "circle",
          number: this.roomitemsnumber,
        },
        {
          title: "Équipement",
          color: "#14202c",
          type: "triangle",
          number: this.equipementitemsnumber,
        },
      ]

      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }


  startReload() {
    this.reloadData(this.selectedZone.type);
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timer);
    this.progress = 0;

    this.timer = setInterval(() => {
      this.progress += 100 / (this.reloadInterval / 100);
      if (this.progress >= 100) {
        // this.reloadData("building");
        this.reloadData(this.selectedZone.type);
        this.progress = 0; // Reset the progress after calling reload
      }
    }, 100);
  }
  showNoDataChangedMessage() {
    this.noDataChangedMessage = true;
    if (this.messageTimeout) clearTimeout(this.messageTimeout);

    this.messageTimeout = setTimeout(() => {
      this.noDataChangedMessage = false;
    }, 3000);
  }

  get progressGradient() {
    return `conic-gradient(#14202c ${this.progress}%, #e0e0e0 ${this.progress}% 100%)`;
  }
  getPriorityLabel(label: string) {
    if (window.innerWidth < 1500) {
      switch (label) {
        case 'Élevée':
          return 'E';
        case 'Moyenne':
          return 'M';
        case 'Faible':
          return 'F';
        default:
          return label;
      }
    }
    return label;
  }

  async reloadData(type: "building" | "geographicFloor" | "geographicRoom") {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.showGlobalCard = false;
    try {
      const buildingId = localStorage.getItem("idBuilding");
      let newData = [];
      if (type === "building") {
        const promises = [
          this.$store.dispatch(ActionTypes.FILTER_TICKETS, {
            buildingId,
            dynamicId: 0,
          }),
        ];
        const result = await Promise.all(promises);
        newData = result[0];
      } else if (type === "geographicFloor" || type === "geographicRoom") {
        const promises0 = [
          this.$store.dispatch(ActionTypes.LOAD_TICKETS, {
            buildingId,
            config: this.config,
          }),
        ];
        const result0 = await Promise.all(promises0);
        const promises = [
          this.$store.dispatch(ActionTypes.FILTER_TICKETS, {
            buildingId,
            dynamicId: this.selectedZone.dynamicId,
          }),
        ];
        const result = await Promise.all(promises);
        newData = result[0];
      }
      // Normalize new data for comparison
      newData.forEach((item) => {
        if (item.priority === "") {
          item.priority = 0;
        }
      });

      // Compare new data with existing data
      if (JSON.stringify(this.data) === JSON.stringify(newData)) {
        // this.showNoDataChangedMessage();
      } else {
        this.$store.commit(MutationTypes.SET_DATA, []);
        this.$store.commit(MutationTypes.SET_DATA, newData);
        await this.callUpdateSprites(newData, this.toggleLegend);
        // this.resettickets();
        if (!this.isFirstLoad) {
          this.showNoDataChangedMessage();
        }
      }
      this.isFirstLoad = false;
    } catch (err) {
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
      console.error("Error during data reload:", err);
    }
  }

  resettickets() {
    this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    EventBus.$emit("reset-tickets");
  }


  selectDataView(item) {
    this.$emit("clickOnDataView", item);
  }
  unifyData(list) {
    // Extract buildingId and position from the first element
    const buildingId = list[0]?.buildingId || "";
    const position = list[0]?.position || { x: 0, y: 0, z: 0 };
    const dynamicId = list[0]?.dynamicId || 0;

    // Extract all data items into a single list
    const data = list.reduce((accumulator, current) => {
      return accumulator.concat(current.data || []);
    }, []);

    // Return the unified object
    return {
      buildingId,
      position,
      dynamicId, // Set the dynamicId to 4444
      data
    };
  }
  GlobalListData(list) {
    // Extract buildingId and position from the first element
    const buildingId = list[0]?.buildingId || "";
    const position = list[0]?.position || { x: 0, y: 0, z: 0 };
    const dynamicId = list[0]?.dynamicId || 0;
    const baseURL = this.baseURL;
    const token = this.token;

    // Extract all data items into a single list
    const data = list.reduce((accumulator, current) => {
      return accumulator.concat(current.data || []);
    }, []);

    // Return the unified object
    return {
      buildingId,
      position,
      dynamicId, // Set the dynamicId to 4444
      data: list,
      baseURL,
      token
    };
  }

  locateTicket(ticket) {
    function findGroupIndexByDynamicId(groups, dynamicId) {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const found = group.data.some(ticket => ticket.dynamicId === dynamicId);
        if (found) {
          return i;
        }
      }
      return -1; // Return -1 if not found
    }

    function reorderItems(array, dynamicId) {
      // Find the index of the item with the matching dynamicId
      const index = array.findIndex(item => item.dynamicId === dynamicId);
      if (index > -1) {
        // Move the matching item to the beginning of the array
        const [item] = array.splice(index, 1);
        array.unshift(item);
      }
      return array;
    }

    const dynamicIdToFind = ticket.dynamicId;
    const result = findGroupIndexByDynamicId(this.tickets_with_positions, dynamicIdToFind);
    if (result !== -1) {
      // Reorder the items in the found group
      const group = this.tickets_with_positions[result];
      group.data = reorderItems(group.data, dynamicIdToFind);
      if (group.data.length < 10) {
        EventBus.$emit("move-tickets-to-selected", group.data);
      }
      this.callCard(group);
    } else if (result === -1) {
      // Unify and reorder the floor tickets
      if (ticket.elementSelected.type === "geographicBuilding") {
        const BuildingTickets = this.sortedTickets.filter(ticket => ticket.elementSelected.type === "geographicBuilding");
        const item = this.GlobalListData(BuildingTickets);
        if (item.data.length < 10) {
          EventBus.$emit("move-tickets-to-selected", item.data);
        }
        this.callBuildingCard(item, "geographicBuilding");
        return;
      }
      else if (ticket.elementSelected.type === "geographicFloor") {
        const FloorTickets = this.sortedTickets.filter(ticket2 => ticket2.elementSelected.dynamicId === ticket.elementSelected.dynamicId);
        const item = this.GlobalListData(FloorTickets);
        if (item.data.length < 10) {
          EventBus.$emit("move-tickets-to-selected", item.data);
        }
        this.callFloorCard(item, "geographicFloor", dynamicIdToFind);
        return;
      }
      const floorItemsCard = this.unifyData(this.floor_tickets_with_positions);
      floorItemsCard.data = reorderItems(floorItemsCard.data, dynamicIdToFind);
      this.callCard(floorItemsCard);
    }
    const buildingId = localStorage.getItem("idBuilding");
    this.$store.commit(MutationTypes.SET_SELECTED_TICKETS, [ticket.dynamicId]);
    if (ticket.elementSelected.type === "geographicFloor" || ticket.elementSelected.type === "geographicBuilding") {
    }
    else {
      this.$store.dispatch(ActionTypes.SELECT_ITEMS, {
        ...ticket.elementSelected,
        buildingId,
      });
    }

    this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
      String(ticket.elementSelected.dynamicId),
    ]);
    const floor = document.querySelector("#floor-sprite");
    floor?.dispatchEvent(new Event("clickExteriorSprite"));
  }
  private callUpdateSprites(data: any[], legend: boolean): Promise<void> {
    const buildingId = localStorage.getItem("idBuilding");

    return updateSprites({
      store: this.$store,
      buildingId,
      config: this.config,
      selectedZone: this.selectedZone,
      data,
      legend: legend,
      setContext: () => this.resetContext(buildingId),
      setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
      setFullFloorTicketsWithPositions: (items) => { this.full_floor_tickets_with_positions = items },
      setFullRoomTicketsWithPositions: (items) => { this.full_room_tickets_with_positions = items },
    });
  }

  async resetContext(buildingId: string | null) {
    this.$store.dispatch(ActionTypes.RESET_API_ITERATOR_STORE, {
      buildingId,
    });
    return;
  }
  async applyPriorityFilter() {
    this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.toggleSprites) {
      await this.callUpdateSprites(this.sortedTickets, this.toggleLegend);
    } else {
      await showAllSprites({
        store: this.$store,
        buildingId: localStorage.getItem("idBuilding") || "",
        config: this.config,
        selectedZone: this.selectedZone,
        data: this.sortedTickets,
        legend: this.toggleLegend,
        setContext: () => this.resetContext(localStorage.getItem("idBuilding")),
        setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
      });
    }
  }

  handleStepFilterUpdate(newSteps) {
    this.step_filter = newSteps;
  }
  debouncedHandler = debounce((newVal, oldVal) => {
    this.$nextTick(() => {
      if (!newVal) return;
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
      if (!newVal.dynamicId && !oldVal) {
        this.retriveData("building");
        return;
      }

      this.$store.dispatch(ActionTypes.REMOVE_CARDS);
      this.showGlobalCard = false;
      this.isBuildingSelected = newVal.type === "building";
      this.retriveData(newVal.type);
    });
  }, 10).bind(this);


  @Watch("selectedZone", { immediate: true })
  async watchSelectedZone(newVal, oldVal) {
    this.debouncedHandler(newVal, oldVal);
  }

  @Watch("data")
  watchData() {
    // this.updateSprites(newData);
  }

  @Watch("workflow_filter")
  watchWorkflow() {

    // this.callUpdateSprites(this.filteredTickets, this.toggleLegend);
    if (this.toggleSprites) {
      this.callUpdateSprites(this.filteredTickets, this.toggleLegend);
    } else {
      showAllSprites({
        store: this.$store,
        buildingId: localStorage.getItem("idBuilding") || "",
        config: this.config,
        selectedZone: this.selectedZone,
        data: this.filteredTickets,
        legend: this.toggleLegend,
        setContext: () => this.resetContext(localStorage.getItem("idBuilding")),
        setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
      });
    }
  }

  @Watch("domain_filter")
  watchDomain() {
    if (this.toggleSprites) {
      this.callUpdateSprites(this.filteredTickets, this.toggleLegend);
    } else {
      showAllSprites({
        store: this.$store,
        buildingId: localStorage.getItem("idBuilding") || "",
        config: this.config,
        selectedZone: this.selectedZone,
        data: this.filteredTickets,
        legend: this.toggleLegend,
        setContext: () => this.resetContext(localStorage.getItem("idBuilding")),
        setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
      });
    }
  }

  @Watch("step_filter")
  watchStep() {
    if (this.toggleSprites) {
      this.callUpdateSprites(this.filteredTickets, this.toggleLegend);
    } else {
      showAllSprites({
        store: this.$store,
        buildingId: localStorage.getItem("idBuilding") || "",
        config: this.config,
        selectedZone: this.selectedZone,
        data: this.filteredTickets,
        legend: this.toggleLegend,
        setContext: () => this.resetContext(localStorage.getItem("idBuilding")),
        setTicketsWithPositions: (items) => { this.tickets_with_positions = items },
      });
    }
  }

  // @Watch("priorities", { deep: true })
  // watchPriorities() {

  // }
}

export { dataSideApp };
export default dataSideApp;
</script>
<style lang="scss">
.noMargin {
  margin: 0 !important;
  padding: 0 !important;
}

.filtres-container {
  border: #14202c20 1px solid;
  padding: 15px 10px;
  margin: 15px 0;
  border-radius: 5px;
}

.filtre-half-holder {
  margin: 0 !important;
  width: 48%;
}

.prio-filtre-text {
  font-size: 13px !important;
}

.dropdown-holder {
  width: calc(100%);
  box-shadow: 0 4px 14px 0 #00000020;
  height: 50px;
  overflow: hidden !important;
  border-radius: 8px;
}

.filtre-title {
  font-size: 12px;
  color: #14202c;
  opacity: 0.8;
  margin-bottom: 5px;
  font-weight: 600;
}

.priority-indicator {
  border-radius: 3px;
  width: 9px;
  height: 24px;
  margin-right: 5px;
  display: inline-block;
}

.row-style {
  align-items: center;
}

.row-style:hover {
  background-color: #f5f5f5;
}

.v-application--is-ltr .v-input--selection-controls__input {
  margin-right: 3px !important;
}

.app-title {
  font-size: 17px;
  font-weight: bold;
  color: #14202c;
}

.app-description {
  font-size: 13px;
  color: #14202c;
  opacity: 0.6;
  margin-top: 5px;
}

.add-ticket-button {
  cursor: pointer;
  background-color: #eaeef0;
  border-radius: 2px;
  justify-content: start;
  align-items: center;
  width: 35%;
  max-height: 60px;
  padding: 8px;
  display: flex;
}


.add-ticket-icon {
  background-color: #fff;
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 5px;
  width: 40px;
  height: 40px;
  // margin-left: 10px;
  box-shadow: 0 4px 14px 0 #00000020;

}

.list-tick {
  background-image: url(./assets/ticket-support.svg);
}

.key-tick {
  background-image: url(./assets/ticket-key.svg);
}


.add-ticket-text-holder {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  height: 100%;
  padding: 6px 0;
}

.add-ticket-text {
  color: #14202c70;
  font-size: 13px;
  margin-left: 5px;
}

.add-ticket-text-bold {
  color: #14202c;
  font-size: 13px;
  font-weight: bold;
  margin-left: 5px;
}

.card-container {
  font: normal normal normal 11px/13px Charlevoix Pro;
  font-size: 15px !important;
  padding: 20px;
}

.toggle-full-container {
  position: absolute;
  bottom: 0%;
  right: 105%;
  z-index: 10;
  padding: 10px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 4px 14px 0 #00000020;
  width: 120px;
  height: 70px;
}

.toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.toggle-switch {
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 20px;
  position: relative;
  transition: background 0.3s;
}

.toggle-circle {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 2px;
  transition: transform 0.3s ease-in-out;
}

.toggle-circle.active {
  transform: translateX(20px);
}

.toggle-container:hover .toggle-switch {
  background: #bbb;
}

.toggle-label {
  font-weight: bold;
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

@media (max-width: 970px) {
  .hide_inverse {
    display: none !important;
    visibility: hidden !important;
  }

  #floor-sprite {
    display: none !important;
    visibility: hidden !important;
  }
}

html .v-application .primary--text {
  color: #14202c !important;
  caret-color: #14202c !important;
}

// .v-input input::placeholder { 
//   font-size: 14px;
//   /* Adjust the font size */
// }
.v-text-field input::placeholder {
  color: green;
  // font-size: 10px !important;
}

.v-text-field input {
  color: green;
  // font-size: 10px !important;
}

.profil-selec-container {
  position: absolute;
  bottom: 170px;
  left: -145%;
  z-index: 10;
}

.legend-selec-container {
  position: absolute;
  bottom: 260px;
  left: -145%;
  z-index: 10;
}


.legend-full-container {
  position: absolute;
  bottom: 0px;
  left: -145%;
  z-index: 10;
}

.floor-sprite-full-container {
  z-index: 9;
  background-color: transparent;
  position: absolute;
  top: 55%;
  right: 105%;
  width: 90px;
  max-height: 350px;
  /* Limit the height */
  overflow-y: auto;
  /* Make it scrollable */
  // box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  // padding: 7px;
}

.floor-list-container {
  display: flex;
  flex-direction: column;
}

.floor-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  width: 80px;
  text-align: center;
  background-color: #f5f5f5;
  font-size: 13px;
  font-weight: bold;
  padding: 5px;
}

.floor-name {
  color: #14202c;
  font-size: 13px;
  font-weight: bold;
}

.floor-ticket-count {
  font-size: 11px;
  color: #777;
}

.separator {
  width: 80%;
  height: 1px;
  background-color: #ccc;
  margin-top: 5px;
}




.reload-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px 0 #00000020;
  cursor: pointer;
  // border: 2px solid #14202c;
  position: relative;

}

.reload-btn-inner {
  background: #fff;
  border-radius: 50%;
  width: 85%;
  height: 85%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.reload-btn-inner:hover {
  transform: rotate(180deg);
}

.v-icon {
  font-size: 24px;
  color: #14202c;
}

.no-data-message {
  position: absolute;
  top: 35px;
  left: 45%;
  transform: translateX(-50%);
  background: orange;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: opacity 0.5s ease-in-out;
}

.ticket-table-outer-container::-webkit-scrollbar {
  width: 10px;
  background: #14202c15 !important;
}

.ticket-table-outer-container::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: #14202c !important;
}

.ticket-table-outer-container::-webkit-scrollbar-track {
  // -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  // box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

/****************************       Media queries ********************************** */
@media (max-width: 1500px) {
  .workflow-label {
    font-size: 13px !important;
  }

  ::v-deep(.v-label) {
    font-size: 13px !important;
  }

  ::v-deep(.v-list-item .v-list-item__title) {
    font-size: 13px !important;
  }

  .v-list-item__title {
    font-size: 13px !important;
  }

  .v-input .v-label {
    font-size: 13px !important;
  }

  .priority-list-container {
    justify-content: flex-start !important;
    gap: 5px !important;
  }

  .v-select-list {
    width: 280px !important;
  }

  .prio-filtre-text {
    font-size: 12px !important;
  }

  .filtre-half-holder {
    overflow: auto ! important;
  }

  .status-filtre-container {
    width: 70px !important;
  }

  .separator {
    width: 40px !important;
  }

  .v-data-table .v-data-table__wrapper table {
    border-spacing: 0 !important;
    width: 180% !important;
  }

  .add-ticket-button {
    width: 50% !important;
  }
}
</style>
