<template>
  <v-card elevation="2" class="extend" height="100%">
    <div class="grid-cont" :class="gridClass">
      <div class="component-wrapper cw-left" v-if="viewMode === 'radar-grid'">
        <div class="header-wrapper hw-left">
          <div class="header">
            <div class="title-wrapper">
              <div class="title">
                <div class="title-content" v-if="radarGridMode === 'radar'">Radar</div>
                <div class="title-content" v-else-if="radarGridMode === 'nomenclature'">Nomenclature</div>
              </div>
              <!-- <div class="subtitle-wrapper" v-if="grpRoomFocus === 'GrpRoom'">
                <div class="subtitle">
                  contient
                  <span class="bold-element">{{
      grpRoomWithChildrenController.groupToDisplay.filter(
        (room) => room.display
      ).length
    }}</span>
                  pièce<span>s</span>
                </div>
              </div> -->
            </div>
          </div>
        </div>
        <div class="body-wrapper">
          <div v-if="radarGridMode === 'radar'" class="radar-wrapper big-radar">
            <Radar id="radar-chart-chart" :options="radarOptions" :data="dataRadar"></Radar>
          </div>
          <div v-else-if="radarGridMode === 'nomenclature'" :style="{ height: '100%' }">
            <Nomenclature :selectedItems.sync="selectedRoomsNomenclature" :style="{ height: '100%' }">
            </Nomenclature>
          </div>
        </div>
        <div class=" footer-wrapper">
          <div class="footer">
            <div class="toggle-group tg-left">
              <ToggleButtonV1 color1="black" color2="white" symbol-left="mdi-radar" symbol-right="mdi-dots-grid"
                ref="toggleRadarNomenclature" v-on:toggled="switchRadarNomenclature()" tooltip-left="Radar"
                tooltip-right="Nomenclature">
              </ToggleButtonV1>
              <v-btn color="primary" @click="assignRoomFromNomenclature()">Assigner</v-btn>
            </div>
          </div>
        </div>
      </div>
      <div class="component-wrapper">
        <div class="icon-fullscreen">
          <v-tooltip bottom z-index="80">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon @click="reset()" v-bind="attrs" v-on="on">
                <v-icon color="greyed">mdi-restore</v-icon>
              </v-btn>
            </template>
            <span class="z-index-60">Reinitialiser</span>
          </v-tooltip>
        </div>
        <div class="header-wrapper">
          <div class="header">
            <div class="title-wrapper">
              <div class="title">
                <div class="title-content" v-if="grpRoomFocus === 'GrpRoomList'">
                  Assignation <br />
                  des espaces
                </div>
                <div class="title-content" v-else-if="grpRoomFocus === 'GrpRoom' && currentGrpRoom">
                  {{ currentGrpRoom.title ?? "" }}
                  <!-- Grp Piece 1 -->
                </div>
                <div class="sub-title" v-if="currentGrpRoom &&
      currentGrpRoom.parentTitle &&
      grpRoomFocus === 'GrpRoomList'
      ">
                  <span class="sub-title-content">categorie :</span>
                  <span class="name-category">{{
      currentGrpRoom.parentTitle
    }}</span>
                </div>
                <div class="tooltip">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn color="grey" dark v-bind="attrs" v-on="on" icon>
                        <v-icon>mdi-information-outline</v-icon>
                      </v-btn>
                    </template>
                    <span v-if="grpRoomFocus === 'GrpRoom'">
                      <span class="bold-element">{{
      currentGrpRoom.title
    }}</span>
                      est un
                      <span class="bold-element">groupe de pièce</span> qui
                      appartient à la categorie ...</span>
                    <span v-if="grpRoomFocus === 'GrpRoomList'">Le composant Assignation des espaces permet de: <br />
                      - visualiser des groupes de pièces appartenant à la même
                      catégorie <br />
                      - assigner des pièces à des groupes de pièces</span>
                  </v-tooltip>
                </div>
              </div>
              <div class="subtitle-wrapper" v-if="grpRoomFocus === 'GrpRoom'">
                <div class="subtitle">
                  contient
                  <span class="bold-element">{{
      grpRoomWithChildrenController.groupToDisplay.filter(
        (room) => room.display
      ).length
    }}</span>
                  pièce<span>s</span>
                </div>
              </div>
            </div>
            <div class="info-wrapper">
              <div class="area-wrapper">
                <div class="initial-area area" :class="globalKpiClass">
                  <div class="value">
                    {{
      grpRoomFocus === "GrpRoomList"
        ? grpRoomWithChildrenController.globalArea.toFixed(2)
        : currentGrpRoom.area.toFixed(2)
    }}
                  </div>
                  <div class="unit">m2</div>
                </div>
                <div class="separator-wrapper" v-if="grpRoomWithChildrenController.totalGain.value !== 0">
                  <div class="separator"></div>
                </div>
                <div class="new-area area" v-if="grpRoomWithChildrenController.totalGain.value !== 0">
                  <div class="value">
                    {{ grpRoomWithChildrenController.totalArea.value.toFixed(2) }}
                  </div>
                  <div class="unit">m2</div>
                </div>
              </div>
              <div class="gain-wrapper">
                <div class="arrow">
                  <v-icon color="green"
                    v-if="grpRoomWithChildrenController.totalGain.percentage > 0">mdi-arrow-up-thick</v-icon>
                  <v-icon color="red"
                    v-else-if="grpRoomWithChildrenController.totalGain.percentage < 0">mdi-arrow-down-thick</v-icon>
                </div>
                <div class="text" v-if="grpRoomWithChildrenController.totalGain.percentage > 0 ||
      grpRoomWithChildrenController.totalGain.percentage < 0
      ">
                  <span v-if="unitMode === 'm2'">
                    {{ grpRoomWithChildrenController.totalGain.value.toFixed(2) }} m2
                  </span>
                  <span v-else-if="unitMode === 'percentage'">
                    {{ grpRoomWithChildrenController.totalGain.percentage.toFixed(2) }} %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="body-wrapper">
          <div class="component-actions-wrapper" v-if="!showRadar">
            <div class="actions">
              <div class="search-wrapper">
                <v-autocomplete multiple v-if="grpRoomFocus === 'GrpRoom'" :label="searchBarPlaceholder"
                  :items="availableRooms" item-text="name" item-value="dynamicId" single-line hide-details="true"
                  outlined dense v-model="searchModel" :loading="isLoading">
                  <template #prepend-inner>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on"> mdi-magnify </v-icon>
                      </template>
                      <span>Rechercher</span>
                    </v-tooltip>
                  </template>
                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-title>
                        {{ searchBarPlaceholder }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ attr, on, item, selected, index }">
                    <v-chip v-if="index < 3" v-bind="attr" :input-value="selected" label
                      :color="createColorPropChipsBefore(item)" :text-color="createColorPropChipsBefore(item, 'text')"
                      deletable-chips class="white--text ma-1" close v-on="on"
                      @click:close="deleteChipFromRoomSelection(item)">
                      <span v-text="item.name"></span>
                    </v-chip>
                    <span v-if="index === 3" class="grey--text text-caption">
                      (+{{ searchModel.length - 3 }} autre<span v-if="searchModel.length - 3 > 1">s</span>)
                    </span>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-list-item-content class="d-flex inline chips-legend-container">
                      <span v-if="grpRoomFocus === 'GrpRoom'" :style="createStyleTitleSelectBefore(item)"
                        class="chip-legend-item">
                      </span>
                      <v-list-item-title class="ml-4" v-text="item.name"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon :color="getFutureOperation(item)">
                        mdi-arrow-right-bold
                      </v-icon>
                    </v-list-item-icon>
                  </template>
                </v-autocomplete>

                <v-row>
                  <v-col lg="8" md="8" sm="8">
                    <v-text-field v-if="grpRoomFocus === 'GrpRoomList'" class="" dense v-model="searchModelGrp"
                      label="Rechercher un groupe de pièce" placeholder="" outlined hide-details="true"
                      single-line></v-text-field>
                  </v-col>
                </v-row>
              </div>
              <div class="button-wrapper" v-if="grpRoomFocus === 'GrpRoom'">
                <v-btn :disabled="searchModel === null" width="80%" max-width="80%" color="primary"
                  @click="addRoom('search')">Ajouter</v-btn>
              </div>
            </div>
          </div>
          <div class="radar-wrapper" v-if="showRadar && viewMode === 'grid'">
            <Radar id="radar-chart" :options="radarOptions" :data="dataRadar"></Radar>
          </div>
          <RoomGroupDataTable ref="roomGroupDataTable" :data="dataFiltered" :showRadar="showRadar"
            :is-loading-data="isLoadingData" :grpRoomFocus="grpRoomFocus" :headersTable="headersTable"
            :dataTableHeight="dataTableHeight" :unitMode="unitMode" @selectItem="selectItem"
            @getOperationsItem="getOperationsItem" @guessItemColor="guessItemColor" @restore="restore"
            @deleteEntity="deleteEntity" :showSelect="false">
          </RoomGroupDataTable>
        </div>
        <div class="footer-wrapper">
          <div class="footer">
            <div class="toggle-group">
              <ToggleButtonV1 color1="black" color2="white" symbol-left="mdi-tape-measure" symbol-right="mdi-percent"
                tooltip-left="M2" tooltip-right="Pourcentage" v-on:toggled="toggleUnitMode">
              </ToggleButtonV1>
              <ToggleButtonV1 color1="black" color2="white" symbol-left="mdi-grid" v-if="viewMode === 'grid'"
                symbol-right="mdi-radar" ref="radar" v-on:toggled="toggleRadarVisibility" tooltip-left="Grid"
                tooltip-right="Radar">
              </ToggleButtonV1>
            </div>
            <div class="actions">
              <v-btn color="primary" text outlined @click="updateDataTableHeight()"
                v-show="grpRoomFocus === 'GrpRoomList'">Fermer</v-btn>
              <v-btn color="primary" @click="goBack()" v-show="grpRoomFocus === 'GrpRoom'">Retour</v-btn>
              <!-- <v-btn color="primary" @click="saveGrpRoom()"
                                v-show="grpRoomFocus === 'GrpRoom' && !showRadar">Valider</v-btn> -->
              <v-btn color="primary" @click="commitChange()"
                v-show="grpRoomFocus === 'GrpRoomList' && !showRadar">Valider
              </v-btn>
              <v-btn color="primary" @click="commitChangeGrpRoom()"
                v-show="grpRoomFocus === 'GrpRoom' && !showRadar">Valider
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
// * API
import { RoomsGroupAPI } from "../../../services/spinalAPI/Rooms Group";

// * Controllers
import { GroupRoomWithChildrenController } from "../../../controllers";

// * Components
import Nomenclature from "../Nomenclature/Nomenclature.vue";
import ToggleButtonV1 from "../utils/ToggleButtonV1.vue";
import ToggleButtonV2 from "../utils/ToggleButtonV2.vue";
import RoomGroupDataTable from "./DataTable/RoomGroupDataTable.vue";

// * DTO
import { Room } from "../../../interfaces/API/Geographic Context/DTO/Request/Room";

// * Factory
import { iGroupRoomItemFactory } from "../../../controllers/GroupeWithChildren";
import { ExpansionMode, iListObjFactory } from "../../../interfaces/";

// * Plot
import { Line, Radar } from "vue-chartjs";
import {
  Chart as ChartJs,
  Title,
  Legend as LegendChart,
  Filler,
  LegendElement,
  RadialLinearScale,
  PointElement,
  LineElement,
} from "chart.js";

// * Services
import { GroupContextApi, NodeAttributsAPI } from "../../../services";
import { SpinalAPI } from "../../../services";

// * Types
import {
  EGroupType,
  GroupRoomFocus,
  OperationMapWithId,
} from "../../../services/GroupeWithChildren/Interfaces/";
import { IGroupRoomItem } from "../../../services/GroupeWithChildren/Interfaces/IGroupRoomItem";
import { TypeLegend } from "../../../services/GroupeWithChildren/Interfaces/";
import { type UnitMode, type ViewMode } from "./Type";

// * Vue
import { Ref, computed, onMounted, ref } from "vue";

// * Vuetify
import { VAutocomplete } from "vuetify/lib";
import { VBtn } from "vuetify/lib";
import { VCard } from "vuetify/lib";
import { VChip } from "vuetify/lib";
import { VCol } from "vuetify/lib";
import { VDataTable } from "vuetify/lib";
import { VIcon } from "vuetify/lib";
import { VList } from "vuetify/lib";
import { VListIcon } from "vuetify/lib";
import { VListItem } from "vuetify/lib";
import { VListItemTitle } from "vuetify/lib";
import { VListItemIcon } from "vuetify/lib";
import { VListItemContent } from "vuetify/lib";
import { VMenu } from "vuetify/lib";
import { VSelect } from "vuetify/lib";
import { VTextField } from "vuetify/lib";
import { VTooltip } from "vuetify/lib/components";
import { VRow } from "vuetify/lib";

ChartJs.register(
  Filler,
  LegendChart,
  RadialLinearScale,
  LineElement,
  PointElement,
  Title
);

// TODO Creer une search bar sur le grp de piece
export default {
  components: {
    VAutocomplete,
    VCard,
    VChip,
    VTooltip,
    VMenu,
    ToggleButtonV1,
    ToggleButtonV2,
    Nomenclature,
    Radar,
    VBtn,
    VIcon,
    VDataTable,
    VSelect,
    VList,
    VListIcon,
    VListItem,
    VListItemTitle,
    VListItemIcon,
    VListItemContent,
    VTextField,
    RoomGroupDataTable,
  },
  data() {
    let spinalAPI = SpinalAPI.getInstance();
    let apiGrpContext = new GroupContextApi(spinalAPI);
    let apiNodeAttributs = new NodeAttributsAPI();
    let apiRoomGroup = new RoomsGroupAPI();
    let unitMode: UnitMode = "m2";
    const showRadar = false;
    const showDataTableGrpRoom: boolean = false;
    const showDataTableGrpRoomList: boolean = true;
    const dataTable = ref(null);
    const dataTableHeight: number = 0;
    const radarOptions = ref({
      responsive: true,
    });
    const isLoadingData = ref(true);
    const dataTableWrapper = ref(null);
    const radar = ref(null);
    const searchModel: Ref<Array<string>> = ref([]);
    const searchModelGrp: Ref<string> = ref("");
    const categoriesModel: Ref<IGroupRoomItem> = ref(null);
    const grpRoomFocus: Ref<GroupRoomFocus> = ref("GrpRoomList");
    const isLoading: Ref<boolean> = ref(false);
    const currentGrpRoom: Ref<IGroupRoomItem | undefined> = ref(undefined);
    const grpRoomWithChildrenController = new GroupRoomWithChildrenController(apiGrpContext, apiNodeAttributs, apiRoomGroup);
    const viewMode: ViewMode = "grid";
    const radarGridMode: 'radar' | 'nomenclature' = 'radar';

    const assignationSpaceHeaders: Array<any> = [
      {
        text: "Groupe de pièces",
        align: "start",
        value: "title",
      },
      { text: "Gains", align: "end", value: "gain" },
      { text: "Actions", align: "end", value: "operations" },
      { text: "Nb pièces", align: "end", value: "length" },
      { text: "Superficie (m2)", align: "end", value: "newArea" },
    ];

    const grpRoomHeader: Array<any> = [
      {
        text: "Pièces",
        align: "start",
        value: "title",
      },
      { text: "Categorie", align: "start", value: "categorie" },
      { text: "Groupe", align: "start", value: "groupe" },
      { text: "Etage", align: "start", value: "floorName" },
      { text: "Superficie (m2)", align: "end", value: "area" },
      { text: "Actions", align: "end", value: "action" },
    ];

    let headersTable: Ref<any> = ref(assignationSpaceHeaders);
    const data: Ref<any> = ref();
    const roomListAndObj = ref(iListObjFactory.build());
    const selectedRoomsNomenclature: Room[] = []

    return {
      searchModel,
      searchModelGrp,
      isLoading,
      headersTable,
      data,
      dataTable,
      grpRoomFocus,
      currentGrpRoom,
      assignationSpaceHeaders,
      grpRoomHeader,
      grpRoomWithChildrenController,
      roomListAndObj,
      unitMode,
      showRadar,
      showDataTableGrpRoom,
      showDataTableGrpRoomList,
      radarOptions,
      radar,
      radarGridMode,
      isLoadingData,
      dataTableHeight,
      dataTableWrapper,
      categoriesModel,
      viewMode,
      selectedRoomsNomenclature
    };
  },
  mounted() {
    this.dataTableHeight = this.$refs.roomGroupDataTable.$el.clientHeight - 130;
    this.loadData();
  },
  methods: {
    assignRoomFromNomenclature() {
      let mapIds = this.selectedRoomsNomenclature.map((x: Room) => x.dynamicId);


      if (Array.isArray(this.searchModel)) {
        mapIds = mapIds.filter((x) => !this.searchModel.includes(x));
        this.searchModel.splice(this.searchModel.length, 0, ...mapIds)
      } else {
        this.searchModel = mapIds
      }
      this.selectedRoomsNomenclature.splice(0, this.selectedRoomsNomenclature.length)
    },
    assignNewHeader() {
      if (this.grpRoomFocus === "GrpRoom") {
        this.headersTable = [...this.grpRoomHeader];
      } else if (this.grpRoomFocus === "GrpRoomList") {
        this.headersTable = [...this.assignationSpaceHeaders];
      }
    },
    loadData(categorieId?: number) {
      if (categorieId) {
        this.switchCategory(categorieId);
      }
      this.grpRoomWithChildrenController
        .loadData()
        .then(() => this.grpRoomWithChildrenController.reloadGroupToDisplay())
        .then((grps) => {
          this.data = grps;
          this.roomListAndObj = this.grpRoomWithChildrenController.rooms;
          this.categoriesModel = this.grpRoomWithChildrenController.currentCategory;
          this.isLoadingData = false;
        })
        .catch((err: any) => {
          console.error(err);
        });
    },
    updateDataTableHeight() {
      console.log("this refs = ", this.$refs);
    },
    toggleComponentMode(context: "item" | "actions" | "func") {
      try {
        if (this.grpRoomFocus !== "GrpRoomList" && context === "item") return;
        this.grpRoomFocus =
          this.grpRoomFocus === "GrpRoomList" ? "GrpRoom" : "GrpRoomList";
        if (this.grpRoomFocus === "GrpRoomList") {
          this.showDataTableGrpRoom = false;
          this.showDataTableGrpRoomList = !this.showDataTableGrpRoom;
        } else if (this.grpRoomFocus === "GrpRoom") {
          this.showDataTableGrpRoom = true;
          this.showDataTableGrpRoomList = !this.showDataTableGrpRoom;
        }
        this.assignNewHeader();
        this.updateDataTableHeight();
        this.$refs.roomGroupDataTable.animDataTable();
      } catch (err: any) {
        console.error(err);
      }
    },
    saveGrpRoom() { },
    switchRadarNomenclature() {
      if (this.radarGridMode === 'nomenclature') {
        this.radarGridMode = 'radar';
      } else {
        this.radarGridMode = 'nomenclature';
      }
    },
    commitChangeGrpRoom() {
      this.grpRoomWithChildrenController
        .commitChangeGrpRoom()
        .then(() => {
          console.log("Selected Grp Room Commited");
          this.goBack();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    selectItem(item: IGroupRoomItem, context: "item") {
      this.updateDataTableHeight();
      this.grpRoomWithChildrenController.selectItem(item);
      if (this.grpRoomFocus !== "GrpRoomList" && context === "item") return;
      this.searchModel = "";
      this.toggleComponentMode(context);
      this.grpRoomWithChildrenController.setFocus(this.grpRoomFocus);
      this.currentGrpRoom = this.grpRoomWithChildrenController.getSelected();
      this.data = this.grpRoomWithChildrenController.reloadGroupToDisplay();
      this.updateFocus();
    },
    goBack() {
      this.grpRoomFocus = "GrpRoomList";
      this.searchModel = "";
      this.updateFocus();
      this.assignNewHeader();
      this.reloadData();
      this.$refs.roomGroupDataTable.animDataTable();
      if (this.showRadar) {
        this.$refs.radar.$el.click();
      }
    },
    setViewModeByExpansion(expansionMode: ExpansionMode) {
      switch (expansionMode) {
        case "one-tier":
          this.viewMode = "grid";
          break;
        case "half":
          this.viewMode = "grid";
          break;
        case "full":
          this.viewMode = "radar-grid";
          this.showRadar = false;
          break;
        default:
      }
    },
    reloadData() {
      this.data = [...this.grpRoomWithChildrenController.reloadGroupToDisplay()];
    },
    reset() {
      this.grpRoomWithChildrenController
        .reset()
        .then(() => {
          this.reloadData();
          this.searchModel.splice(0, this.searchModel.length)
        })
        .catch((err: any) => {
          console.error(err);
        });
    },
    commitChange() {
      this.grpRoomWithChildrenController
        .commitChange()
        .then(() => {
          this.goBack();
        })
        .catch((e: any) => {
          console.error(e);
        });
    },
    getOperationsItem(item: IGroupRoomItem, op: TypeLegend) {
      let value: number = 0;

      if (item.operations.length === 0) {
        return 0;
      }
      value = item.children?.reduce(
        (acc: number, el: IGroupRoomItem) =>
          acc + (el.operations === op ? 1 : 0),
        0
      );
      if (op === "ToAssign") {
        value += item.children?.reduce(
          (acc: number, el: IGroupRoomItem) =>
            acc + (el.operations === "ToReAssign" ? 1 : 0),
          0
        );
      }
      return value;
    },
    guessItemColor(item: IGroupRoomItem) {
      return GroupRoomWithChildrenController.guessItemColor(item.operations);
    },
    getFutureOperation(item: IGroupRoomItem) {
      const ops = this.grpRoomWithChildrenController.getFutureOperation(item);
      return GroupRoomWithChildrenController.guessItemColor(ops);
    },
    addRoom(ctx: "search" | "", item?: Partial<IGroupRoomItem | any>) {
      let pms: Array<Promise<any>> = [];

      if (!item) {
        for (const id of this.searchModel) {
          pms.push(
            this.grpRoomWithChildrenController.addItemFromViewer(
              ctx,
              iGroupRoomItemFactory.build({ id: id })
            )
          );
        }
      }

      Promise.all(pms)
        .then(() => {
          this.reloadData();
        })
        .catch((err: any) => {
          console.error(err);
        });
      this.searchModel = [];
    },
    updateFocus() {
      this.grpRoomWithChildrenController.setFocus(this.grpRoomFocus);
    },
    tmpItemClass(item: IGroupRoomItem) {
      if (!item.display) {
        return "soft-deleted-item";
      }
      if (item.tmp) {
        return "tmp-item";
      }
      return;
    },
    deleteEntity(item: IGroupRoomItem, context: "menu" | "actions") {
      this.grpRoomWithChildrenController
        .deleteItem(item)
        .then(() => {
          this.reloadData();
        })
        .catch((err: any) => {
          console.error(err);
        });
    },
    toggleUnitMode() {
      if (this.unitMode === "m2") {
        this.unitMode = "percentage";
      } else if (this.unitMode === "percentage") {
        this.unitMode = "m2";
      }
    },
    restore(item: IGroupRoomItem) {
      this.grpRoomWithChildrenController
        .restoreItem(item)
        .then(() => { })
        .catch((err: any) => {
          console.error(err);
        });
    },
    toggleRadarVisibility() {
      this.showRadar = !this.showRadar;
    },
    buildAreaBeforeGrpRoom() {
      return this.data.map((room: IGroupRoomItem) => {
        switch (room.operations) {
          case "Assigned":
            return room.area;
            break;
          case "Not-assigned":
            return 0;
            break;
          case "ToDeAssign":
            return 0;
            break;
          case "ToAssign":
            return 0;
            break;
          case "AssignedToAnother":
            return 0;
          default:
            return 0;
            break;
        }
      });
    },
    buildAreaAfterGrpRoom() {
      return this.data.map((room: IGroupRoomItem) => {
        switch (room.operations) {
          case "Assigned":
            return room.newArea;
            break;
          case "Not-assigned":
            return 0;
            break;
          case "ToDeAssign":
            return room.area;
            break;
          case "ToAssign":
            return room.area;
            break;
          case "AssignedToAnother":
            return 0;
          default:
            return room.area;
            break;
        }
      });
    },
    createStyleTitleSelectBefore(item: any) {
      let itemColorBefore = undefined;
      let LegBefore: TypeLegend = item.operations;
      let futureOp = this.grpRoomWithChildrenController.getFutureOperation(item);
      let styleObj = {};

      styleObj["height"] = "2em";
      if (
        this.grpRoomWithChildrenController.selectedGrpRoom.children.find(
          (room) => room.title === item.name
        )
      ) {
        styleObj["background"] =
          GroupRoomWithChildrenController.guessItemColor("Assigned");
        return styleObj;
      }
      switch (futureOp) {
        case "ToAssign":
          LegBefore = "Not-assigned";
          break;
        case "ToReAssign":
          LegBefore = "AssignedToAnother";
          break;
        default:
          LegBefore = "Not-assigned";
      }
      itemColorBefore = GroupRoomWithChildrenController.guessItemColor(LegBefore);
      styleObj["background"] = itemColorBefore;
      return styleObj;
    },
    createColorPropChipsBefore(item: any, ctx = "bg"): string {
      let itemColorBefore = undefined;
      let LegBefore: TypeLegend = item.operations;
      let futureOp = this.grpRoomWithChildrenController.getFutureOperation(item);
      let textColor = "";

      if (
        this.grpRoomWithChildrenController.selectedGrpRoom.children.find(
          (room) => room.title === item.name
        )
      ) {
        itemColorBefore = GroupRoomWithChildrenController.guessItemColor("Assigned");
        textColor = "white";
        return ctx === "bg" ? `${itemColorBefore}` : textColor;
      }
      switch (futureOp) {
        case "ToAssign":
          LegBefore = "Not-assigned";
          textColor = "white";
          break;
        case "ToReAssign":
          LegBefore = "AssignedToAnother";
          textColor = "white";
          break;
        default:
          textColor = "white";
          LegBefore = "Not-assigned";
      }
      itemColorBefore = GroupRoomWithChildrenController.guessItemColor(LegBefore);
      return ctx === "bg" ? `${itemColorBefore}` : textColor;
    },
    deleteChipFromRoomSelection(item: any) {
      this.searchModel = this.searchModel.filter((el) => el !== item.dynamicId);
    },
    switchCategory(category: number | IGroupRoomItem) {
      this.isLoadingData = true;
      if (category && typeof category === "number") {
        this.grpRoomWithChildrenController
          .switchCategories(category)
          .then((newCategories) => {
            this.reloadData();
            this.isLoadingData = false;
          })
          .catch((err: any) => {
            console.error(err);
          });
      } else if (category && typeof category === "object") {
        this.grpRoomWithChildrenController
          .switchCategories(category.id)
          .then((newCategories) => {
            this.reloadData();
            this.isLoadingData = false;
          })
          .catch((err: any) => {
            console.error(err);
          });
      }
    },
  },
  computed: {
    availableRooms() {
      try {
        const zoneSelected = this.$store.state.appDataStore.zoneSelected;
        const rooms = this.grpRoomWithChildrenController.rooms.list;
        const floorRooms = this.grpRoomWithChildrenController.rooms.list.filter(
          (x: IGroupRoomItem) => x.floorId === zoneSelected.dynamicId
        );
        const filteredRooms = zoneSelected.level === 0 ? rooms : floorRooms;
        // const finalRooms = filteredRooms.filter((room) => {
        //     const exist = this.currentGrpRoom.children.find((x: IGroupRoomItem) => x.id === room.dynamicId);
        //     if (exist === undefined) {
        //         return true;
        //     }
        //     return false;
        // })
        return filteredRooms;
      } catch (err: any) { }
      return [];
    },
    searchBarPlaceholder() {
      return this.grpRoomFocus === "GrpRoomList"
        ? "Recherchez un groupe de pièces"
        : "Selectionner une ou plusieurs pièce(s)";
    },
    globalKpiClass() {
      if (this.grpRoomWithChildrenController.totalGain.value !== 0) {
        return "greyed mini-text";
      } else {
        return "";
      }
    },
    gridClass() {
      switch (this.viewMode) {
        case "radar-grid":
          return "grid-fullscreen";
        case "grid":
          return "";
        default:
          break;
      }
      return "";
    },
    dataFiltered() {
      if (this.grpRoomFocus === "GrpRoom") {
        return this.data;
      } else if (this.grpRoomFocus === "GrpRoomList") {
        return this.data?.filter((grp) =>
          grp?.title.toLowerCase().startsWith(this.searchModelGrp.toLowerCase())
        );
      }
      return [];
    },
    // TODO Refaire cette function
    dataRadar() {
      let labelRadar: string[] = [];
      let areaBefore: number[] = [];
      let areaAfter: number[] = [];
      let grpCurrentCategory: IGroupRoomItem = [];

      const obj: any = {};

      obj.labels = labelRadar;
      obj.datasets = [];
      if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
        return obj;
      }

      console.log("ViewMode = ", this.viewMode)
      if (this.viewMode === 'radar-grid') {
        console.log("View Mode === radar-grid")
      }
      if (this.viewMode === 'radar-grid' || this.grpRoomFocus === "GrpRoomList") {
        grpCurrentCategory = this.grpRoomWithChildrenController?.groupRoomTree?.filter((x: IGroupRoomItem) => x.parentId === this.categoriesModel.id);
        areaAfter = grpCurrentCategory.map(
          (grpGroup: IGroupRoomItem) => grpGroup.newArea
        );
        labelRadar = grpCurrentCategory.map((grpGroup: IGroupRoomItem) => grpGroup.title);
        areaBefore = grpCurrentCategory.map((grpGroup: IGroupRoomItem) => grpGroup.area);
      } else if (this.grpRoomFocus === "GrpRoom") {
        labelRadar = this.data.map((grpGroup: IGroupRoomItem) => grpGroup.title);
        areaAfter = this.buildAreaAfterGrpRoom();
        areaBefore = this.buildAreaBeforeGrpRoom();
      }

      obj.datasets.push({
        label: "Nouvelle superficie (m2)",
        data: areaAfter,
        fill: true,
        backgroundColor: "rgba(255, 0, 2, 0.2)",
        borderColor: "rgb(255, 0, 2)",
        pointBackgroundColor: "rgb(255, 0, 2)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 0, 2)",
      });

      obj.datasets.push({
        label: "Ancienne superficie (m2)",
        data: areaBefore,
        fill: true,
        backgroundColor: "rgba(20,32,44, 0.4)",
        borderColor: "rgb(20,32,44)",
        pointBackgroundColor: "rgb(20,32,44)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(20,32,44)",
      });
      obj.labels = labelRadar;
      return obj;
    },
    roomList() {
      if (!this.roomManager) return [];
      return this.roomManager.rooms;
    },
  },
  watch: {
    categoriesModel: function (category: IGroupRoomItem | number) {
      this.switchCategory(category);
    },
  },
};

// Quand tu auras le temps ecris les rules pour touts les navigateurs
// Pas urgent
</script>

<style lang="scss" scoped>
.sub-title-content {
  font-size: 0.3em;
  margin-top: 0.5em;
}

.name-category {
  font-size: 0.3em;
  background-color: var(--mdc-theme-primary);
  color: #f9f9f9;
  padding: 0.2em;
  border-radius: 0.2em;
}

.select-wrapper {
  width: 100%;
  margin-top: 2em;
}

.z-index-60 {
  z-index: 160;
}

.grid-cont {
  // Increase this value for scaler
  --global-font-size: 16px;

  display: grid;
  grid-template-columns: 1fr 0fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  height: 100%;
  transition: all 0.1s;
  background-color: #f9f9f9;
  overflow-x: hidden;
  color: var(--mdc-theme-primary);
  font-size: var(--global-font-size);
}

.grid-fullscreen {
  grid-template-columns: 1fr 1fr !important;

  .radar-fullscreen {
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.cw-left {
  grid-template-rows: 0.2fr 4fr 0.3fr !important;
}

.component-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 4fr 0.3fr;
  padding: 2em;
  position: relative;
  background-color: #f9f9f9;
  height: 100%;
  overflow: hidden;

  .data-table-wrapper {
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    font-family: "Charlevoix" !important;

    tbody {
      td {
        font-size: 2em !important;
      }
    }
  }

  .hw-left {
    height: 6em !important;
  }

  .header-wrapper {
    display: block;
    height: fit-content;
    // background-color: blue;
    height: 11em;

    .header {
      display: grid;
      grid-template-columns: 1fr 1fr;

      .title-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;

        .title {
          position: relative;
          font-family: "charlevoix" !important;
          font-weight: 900;
          font-size: 3em !important;
          line-height: 1em;
          text-transform: uppercase;

          .tooltip {
            position: absolute;
            top: -0.6em;
            right: -0.9em;
          }
        }
      }

      .info-wrapper {
        // background-color: blueviolet;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: flex-end;
        position: relative;

        .area-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;

          .area {
            display: inline-flex;
            flex-direction: row;
            justify-content: flex-end;
            flex-wrap: nowrap;
            align-items: baseline;
            padding: 0 0.4em;
            transition: 0.5s all;

            .value {
              font-family: var(--main-font) !important;
              font-weight: 900;
              font-size: 2.9em !important;
            }

            .unit {
              margin-left: 10px;
              color: gray;
              font-weight: 600;
            }
          }

          .initial-area {}

          .separator-wrapper {
            display: flex;
            justify-content: flex-end;

            padding: 0 0.3em;

            .separator {
              width: 50%;
              height: 0.2em;
              background-color: gray;
            }
          }
        }

        .gain-wrapper {
          padding: 0 0.5em;
          display: inline-flex;
          flex-wrap: nowrap;
          align-items: flex-start;
        }
      }
    }
  }

  .body-wrapper {
    overflow-y: hidden;

    .component-actions-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0em 0;

      .actions,
      .categories-wrapper {
        margin-top: 0em;
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-template-rows: 1fr;
        grid-column-gap: 0.5em;
        grid-row-gap: 0px;
      }

      .actions {
        margin: 1em 0;
      }
    }
  }

  .subtitle-wrapper {
    margin-top: 0.7em;
    font-family: "Charlevoix";
  }

  .footer-wrapper {
    display: flex;
    justify-content: flex-end;

    .footer {
      margin-top: 0.5em;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
    }
  }

  .v-btn {
    margin-left: 1em;
  }

  .gain-cell {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
  }

  .greyed {
    color: var(--mdc-theme-primary) !important;
    opacity: 0.35;
    background-color: transparent !important;
  }

  .elevation {
    box-shadow: 0px 10px 8px -5px rgba(0, 0, 0, 0.1);
  }

  .extend {
    height: 100%;
  }

  .highlighted-row {
    background-color: gray !important;
    color: white;
  }

  .normal-row {
    background-color: green;
  }

  .bold-element {
    font-weight: 600;
  }

  .bold-darkgrey {
    font-weight: 900;
    text-transform: uppercase;
    color: darkgray;
  }

  .charlevoix {
    font-family: "Charlevoix";
  }

  .radar-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 100%;
    height: 90%;
    width: 100%;
  }

  .big-radar {
    height: 100%;
  }

  .tg-left {
    width: 100% !important;
    justify-content: space-between !important;
  }

  .toggle-group {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 10em;
    justify-content: space-around;
  }

  .mini-text {
    font-size: 0.6em !important;
  }

  .icon-fullscreen {
    display: inline-flex !important;
    position: absolute;
    right: 1em;
    top: 1em;
    z-index: 20;
    cursor: pointer;
  }
}

.chips-legend-container {
  position: relative;
}

.chip-legend-item {
  width: 0.5em;
  height: 3em;
  position: absolute;
  top: calc(50% - (2em / 2));
  left: 0.2em;
  border-radius: 0.5em;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
