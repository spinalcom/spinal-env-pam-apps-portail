<!--
Copyright 2022 SpinalCom - www.spinalcom.com

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
  <v-app id="application">
    <v-container fluid
                 style="padding-bottom: 0px; padding-top: 12px; height: 64px;">
      <div style="width: 100%"
           class="d-flex justify-end">
        <!-- <div v-if="tableData.length>0" @click="downloadCSVLocally()"><ButtonIcon /></div> -->
        <sc-download-button :file-name="'Qualité de l\'air'"
                            :data="tableData"></sc-download-button>
        <div class="ma-1"></div>
        <space-selector :maxDepth="1"
                        :onopen="fct"
                        @select="selection"
                        :rootElement="root" />
      </div>
    </v-container>
    <v-container fill-height
                 fluid
                 class="parent-container pa-0 ma-0">
      <v-container style="height: 100%; max-width: 2560px;"
                   fluid
                   class="main-container desktop-version full-height grow flex-column flex-nowrap justify-space-around justify-lg-start">
        <v-row class="flex-grow-0 flex-shrink-1"
               ref="statcard">
          <v-col cols="12"
                 class="pb-0">
            <v-card class="d-flex justify-md-space-between flex-md-row flex-column stat-card rounded-lg"
                    elevation="4"
                    width="100%">
              <stat-bar squareColor="good"
                        :bigNumber="greenValue"
                        bigCaption="Niveau correct"
                        :smallCaption="percentage[0]" />
              <stat-bar squareColor="moderate"
                        :bigNumber="yellowValue"
                        bigCaption=Modéré
                        :smallCaption="percentage[1]" />
              <stat-bar squareColor="unhealthy"
                        :bigNumber="orangeValue"
                        bigCaption="Pas sain"
                        :smallCaption="percentage[2]" />
              <stat-bar squareColor="hazardous"
                        :bigNumber="redValue"
                        bigCaption="Dangereux"
                        :smallCaption="percentage[3]" />
            </v-card>
          </v-col>
        </v-row>
        <v-row class="flex-grow-1 flex-shrink-0 charlevoix">
          <v-col cols="12"
                 class="pb-0">
            <div ref="maintable"
                 style="height:100% !important;">
              <v-card class="d-flex flex-column table-card rounded-lg pt-3 pb-0"
                      elevation="4"
                      style="height: 100%;">
                <div ref="test">
                  <div ref="selected">
                    <span class="card-header-text pt-8 pl-3">ÉTAGES
                      SÉLECTIONNÉS</span>
                  </div>
                  <div style="margin-left: 40px;"
                       ref="filter">
                    <span class="card-header-text">Filtre</span>
                    <div class="d-flex flex-row">
                      <v-checkbox color="good"
                                  class="pr-3"
                                  dense
                                  label="Niveau correct"
                                  v-model="colorF[0]"></v-checkbox>
                      <v-checkbox color="moderate"
                                  class="pr-3"
                                  dense
                                  label="Modéré"
                                  v-model="colorF[1]"></v-checkbox>
                      <v-checkbox color="unhealthy"
                                  class="pr-3"
                                  dense
                                  label="Pas sain"
                                  v-model="colorF[2]"></v-checkbox>
                      <v-checkbox color="hazardous"
                                  class="pr-3"
                                  dense
                                  label=Hasardeux
                                  v-model="colorF[3]"></v-checkbox>
                    </div>
                  </div>
                  <div ref="desktopTable">
                    <v-data-table style="box-shadow: none !important;"
                                  :loading="(!cpList)"
                                  loadingText="Chargement des données"
                                  :headers="headers"
                                  :items="tableData"
                                  :page.sync="page"
                                  :items-per-page="10"
                                  class="elevation-1 table-data"
                                  :height="testVar"
                                  :footer-props="{
                    prevIcon: 'mdi-menu-left',
                    nextIcon: 'mdi-menu-right',
                    itemsPerPageText: '',
                    showCurrentPage: true,
                    itemsPerPageAllText: 'Tout',
                    itemsPerPageOptions: [5,10,15,-1],
                    pageText: '',
                  }"
                                  @page-count="pageCount = $event">
                      <v-progress-linear v-show="!cpList"
                                         slot="progress"
                                         color="accent"
                                         indeterminate
                                         style="margin-left: -16px; width: calc(100% + 32px)">
                      </v-progress-linear>
                      <template v-slot:[`item.currentValue`]="{ item }">
                        <div style="display:flex; flex-direction: row;">
                          <div :class="[colorCode(item.currentValue)]"
                               class="rectanlge-small"
                               style="margin-right: 10px"></div>
                          <div>{{ item.currentValue.toFixed(0) }} <span
                                  class="grey-color"> ppm</span></div>
                        </div>
                      </template>
                      <template v-slot:no-data>
                        Pas de données disponibles
                      </template>
                    </v-data-table>
                  </div>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
        <v-row class="flex-grow-0 flex-shrink-1 charlevoix"
               ref="bottomcharts">
          <v-col cols="6">
            <v-card elevation="4"
                    class="pa-3 rounded-lg"
                    style="height: 100%; background-color: #f9f9f9 !important;">
              <span class="card-header-text">ÉTAT DES SALLES</span>
              <Pie :chart-options="chartOptions"
                   :chart-data="roomStatusData"
                   :chart-id="chartId"
                   :dataset-id-key="datasetIdKey"
                   :css-classes="cssClasses"
                   :styles="styles"
                   :width="width"
                   :height="pieHeight" />
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card elevation="4"
                    class="pa-3 rounded-lg"
                    style="height: 100%; background-color: #f9f9f9 !important;">
              <span class="card-header-text">ÉTAT GLOBAL</span>
              <Doughnut :chart-options="chartOptions"
                        :chart-data="globalStateData"
                        :chart-id="chartId"
                        :dataset-id-key="datasetIdKey"
                        :css-classes="cssClasses"
                        :styles="styles"
                        :width="width"
                        :height="pieHeight" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-container fill-height
                   full-height
                   fluid
                   class="main-container fill-height mobile-version">
        <v-row align="center"
               justify="center"
               style="height: 100% !important">
          <v-col style="height: 100% !important"
                 class=" charlevoix d-flex flex-column align-content-space-between flex-nowrap"
                 v-if="tabDisplay==0">
            <span
                  class="card-header-text align-self-center flex-grow-0 flex-shrink-1 mb-sm-4">Bilan</span>
            <div class="d-flex mb-4"
                 style="width:100%; height: 100%">
              <div class="align-self-center flex-grow-1">
                <v-row class="mx-4 mb-2">
                  <v-col class="mr-0 mr-sm-1">
                    <v-card class="tile green-border d-flex flex-column justify-center align-center rounded-lg"
                            elevation="2">
                      <div class="portrait-display align-center">
                        <span
                              class="big-number align-self-center pr-0 mx-1">{{greenValue}}</span>
                        <span class="big-caption">Niveau correct</span>
                        <span
                              class="small-caption align-self-center">{{percentage[0]}}%</span>
                      </div>

                      <div class="landscape-display stat-element pa-4">
                        <div class="big-number">
                          {{greenValue}}
                        </div>
                        <div class="horizontal-split">
                          <div class="big-caption">Niveau correct</div>
                          <div class="small-caption">{{percentage[0]}}%</div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col class="mr-0 mr-sm-1">
                    <v-card class="tile yellow-border d-flex flex-column justify-center align-center rounded-lg"
                            elevation="2">
                      <div class="portrait-display align-center">
                        <span
                              class="big-number align-self-center pr-0 mx-1">{{yellowValue}}</span>
                        <span class="big-caption">Modéré</span>
                        <span
                              class="small-caption align-self-center">{{percentage[1]}}%</span>
                      </div>

                      <div class="landscape-display stat-element pa-4">
                        <div class="big-number">
                          {{yellowValue}}
                        </div>
                        <div class="horizontal-split">
                          <div class="big-caption">Modéré</div>
                          <div class="small-caption">{{percentage[1]}}%</div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row class="mx-4 mt-2">
                  <v-col class="mr-0 mr-sm-1">
                    <v-card class="tile orange-border d-flex flex-column justify-center align-center rounded-lg"
                            elevation="2">
                      <div class="portrait-display align-center">
                        <span
                              class="big-number align-self-center pr-0 mx-1">{{orangeValue}}</span>
                        <span class="big-caption">Pas sain</span>
                        <span
                              class="small-caption align-self-center">{{percentage[2]}}%</span>
                      </div>

                      <div class="landscape-display stat-element pa-4">
                        <div class="big-number">
                          {{orangeValue}}
                        </div>
                        <div class="horizontal-split">
                          <div class="big-caption">Pas sain</div>
                          <div class="small-caption">{{percentage[2]}}%</div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col class="mr-0 mr-sm-1">
                    <v-card class="tile red-border d-flex flex-column justify-center align-center rounded-lg"
                            elevation="2">
                      <div class="portrait-display align-center">
                        <span
                              class="big-number align-self-center pr-0 mx-1">{{redValue}}</span>
                        <span class="big-caption">Hasardeux</span>
                        <span
                              class="small-caption align-self-center">{{percentage[3]}}%</span>
                      </div>

                      <div class="landscape-display stat-element pa-4">
                        <div class="big-number">
                          {{redValue}}
                        </div>
                        <div class="horizontal-split">
                          <div class="big-caption">Hasardeux</div>
                          <div class="small-caption">{{percentage[3]}}%</div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-col>

          <v-col style="text-align: center;overflow: auto"
                 class="charlevoix"
                 v-if="tabDisplay==1">
            <v-dialog v-model="dialog"
                      width="500">
              <v-card class="rounded-lg">
                <v-card-title justify="center"
                              class="text-center text-h5 blue-grey darken-1 rounded-lg">
                  <span class="card-header-text text-center"
                        style="color: white">Filter</span>
                </v-card-title>

                <v-card-text>
                  <v-card flat
                          class="py-12">
                    <v-card-text>
                      <v-row align="center"
                             justify="center">
                        <div class="d-flex flex-row">
                          <v-checkbox color="good"
                                      class="pr-3"
                                      dense
                                      label="Niveau correct"
                                      v-model="colorF[0]"></v-checkbox>
                          <v-checkbox color="moderate"
                                      class="pr-3"
                                      dense
                                      label="Modéré"
                                      v-model="colorF[1]"></v-checkbox>
                          <v-checkbox color="unhealthy"
                                      class="pr-3"
                                      dense
                                      label="Pas sain"
                                      v-model="colorF[2]"></v-checkbox>
                          <v-checkbox color="hazardous"
                                      class="pr-3"
                                      dense
                                      label=Hasardeux
                                      v-model="colorF[3]"></v-checkbox>
                        </div>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary"
                         text
                         @click="dialog = false">
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <span
                  class="card-header-text align-self-center flex-grow-0 flex-shrink-1 mb-sm-8">ÉTAGES
              SÉLECTIONNÉS</span>
            <v-card class="d-flex flex-column rounded-lg">
              <div class="align-self-end">
                <v-speed-dial style="margin-top: -36px;margin-left: -60px;"
                              absolute
                              v-model="fab"
                              :top="trueVariable"
                              :right="trueVariable"
                              :direction="leftVariable"
                              :open-on-hover="trueVariable">
                  <template v-slot:activator>
                    <v-btn v-model="fab"
                           color="accent"
                           dark
                           fab
                           small>
                      <v-icon v-if="fab">
                        mdi-close
                      </v-icon>
                      <v-icon v-else>
                        mdi-dots-vertical
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-btn fab
                         dark
                         small
                         @click="dialog = true"
                         color="accent">
                    <v-icon>mdi-filter-variant</v-icon>
                  </v-btn>
                </v-speed-dial>
              </div>
              <div class="align-self-end">
              </div>
              <div>
                <v-data-table style="top:0%"
                              :loading="(!cpList)"
                              loadingText="Chargement des données"
                              fixed-header
                              :height="tableHeight"
                              :headers="headers"
                              :items="tableData"
                              :items-per-page="15"
                              class="elevation-1"
                              :mobile-breakpoint="0"
                              :footer-props="{
                    prevIcon: 'mdi-menu-left',
                    nextIcon: 'mdi-menu-right',
                    itemsPerPageText: '',
                    showCurrentPage: true,
                    itemsPerPageOptions: [5,10,15,-1],
                    pageText: '',
                  }">
                  <v-progress-linear v-show="!cpList"
                                     slot="progress"
                                     color="accent"
                                     indeterminate
                                     style="margin-left: -16px; width: calc(100% + 32px)">
                  </v-progress-linear>
                  <template v-slot:[`item.currentValue`]="{ item }">
                    <div style="display:flex; flex-direction: row;">
                      <div :class="[colorCode(item.currentValue)]"
                           class="rectanlge-small"
                           style="margin-right: 10px"></div>
                      <div>{{ item.currentValue.toFixed(2) }} <span
                              class="grey-color">ppm</span></div>
                    </div>
                    <!-- <div :class="[colorCode(item.currentValue)]" class="rectanlge-small" style="right: 80px; float:right"></div><span>{{ item.currentValue.toFixed(2) }}</span> -->
                  </template>
                  <template v-slot:no-data>
                    Pas de données disponibles
                  </template>
                </v-data-table>
              </div>
            </v-card>

          </v-col>

          <v-col style="text-align: center; height: 100%"
                 v-if="tabDisplay==2"
                 class="d-flex flex-column flex-nowrap charlevoix">
            <span
                  class="card-header-text align-self-center flex-grow-0 flex-shrink-1">ÉTAT
              DES SALLES</span>
            <Pie class="align-self-center flex-grow-1 flex-shrink-0"
                 style="max-width: 400px"
                 :chart-options="chartMobileOptions"
                 :chart-data="roomStatusData"
                 :chart-id="chartId"
                 :dataset-id-key="datasetIdKey"
                 :css-classes="cssClasses"
                 :styles="styles"
                 :width="width"
                 :height="height" />
          </v-col>
        </v-row>
      </v-container>

      <v-container fluid
                   pa-0
                   class="bottom-nav charlevoix">
        <v-bottom-navigation style="box-shadow: none;">
          <v-btn @click="tabDisplay=0"
                 class="activemobiletab bot-nav-buttons"
                 style=""
                 value="recent">
            <span>Bilan</span>

            <v-icon class="material-icons-rounded"
                    style="">mdi-view-grid</v-icon>
          </v-btn>

          <v-btn @click="tabDisplay=1"
                 class="bot-nav-buttons"
                 style="">
            <span>Tableau</span>

            <v-icon>mdi-table</v-icon>
          </v-btn>

          <v-btn @click="tabDisplay=2"
                 class="bot-nav-buttons"
                 style="">
            <span>Diagramme</span>

            <v-icon>mdi-chart-pie</v-icon>
          </v-btn>
        </v-bottom-navigation>
      </v-container>
    </v-container>
    <div class="main-loader"
         v-if="!cpList">
      <sc-loader></sc-loader>
    </div>
  </v-app>
</template>

<script>
import { getFloors, getRooms, getEquipments } from "./functions/getBuilding";
import SpaceSelector from "./components/minicomponents/space_selector/SpaceSelector.vue";
import { Pie, Doughnut } from "vue-chartjs/legacy";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

import { mapActions, mapGetters } from "vuex";
import StatBar from "./components/StatBar.vue";
import ButtonIcon from "./components/ButtonIcon.vue";
export default {
  name: "HelloWorld",
  components: {
    Pie,
    Doughnut,
    StatBar,
    SpaceSelector,
    ButtonIcon,
  },
  props: {
    chartId: {
      type: String,
      default: "first-chart",
    },
    datasetIdKey: {
      type: String,
      default: "first-label",
    },
    width: {
      type: Number,
      default: 250,
    },
    height: {
      type: Number,
      default: 250,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
    plugins: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    nextArray: [],
    desktopTableHeight: 0,
    page: 1,
    pageCount: 0,
    fab: false,
    sheight: 40,
    width2: 2,
    radius: 8,
    padding: 8,
    gradient: "#546e7a",
    lineCap: "round",
    value: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0],
    gradientDirection: "top",
    fill: false,
    type: "trend",
    autoLineWidth: false,
    chartData: {
      labels: ["VueJs", "EmberJs", "ReactJs", "AngularJs"],
      datasets: [
        {
          backgroundColor: ["#11eda9", "#ffe600", "#ffa400", "#ff000b"],
          data: [40, 20, 70, 10],
        },
      ],
    },
    chartData2: {
      labels: ["VueJs", "EmberJs", "ReactJs", "AngularJs"],
      datasets: [
        {
          backgroundColor: ["#14202c", "#00c4ff", "#cadee2"],
          data: [40, 20, 808],
        },
      ],
    },
    chartMobileOptions: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: 0,
      borderRadius: 8,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 20,
            boxHeight: 20,
            padding: 5,
            font: {
              family: "'calibri'",
              size: 8,
            },
          },
        },
      },
    },
    tabDisplay: 0,
    trueVariable: true,
    leftVariable: "left",
    toggle_exclusive: [],
    headers: [
      {
        text: "Nom",
        align: "start",
        sortable: true,
        value: "name",
      },
      { text: "Étage", sortable: true, value: "floor" },
      {
        text: "Niveau CO2",
        align: "start",
        sortable: true,
        value: "currentValue",
      },
    ],
    tableHeight: window.innerHeight - (112 + 90 + 30 + 12),
    dialog: false,
    floorList: [],
    isDroppedLeft: false,
    isDropped: false,
    colorF: [true, true, true, true],
    name: "Qualité de l'air",
    constTable: [],
    tableData: [],
    searchedData: [],
    meCurrentSort: "room",
    meCurrentSortOrder: "asc",
    pagination: {
      perPage: 5,
      currentPage: 1,
    },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: 0,
      borderRadius: 10,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 20,
            boxHeight: 20,
            padding: 5,
            font: {
              family: "charlevoixpro",
              size: 14,
            },
          },
        },
      },
    },
    pieHeight: window.innerHeight / 5,
    //continue DATA
  }),
  computed: {
    root() {
      if (this.building)
        return {
          name: this.building.name,
          dynamicId: this.building.dynamicId,
          color: "#2693ff",
        };
      return { name: "" };
    },
    testVar() {
      return this.desktopTableHeight > 150 ? this.desktopTableHeight : 150;
    },
    windowWidth() {
      return window.innerWidth;
    },
    percentage() {
      if (this.constTable.length !== 0)
        return [
          "" +
            (
              (this.greenValue /
                this.arrangeSpaceTableManually(this.constTable).length) *
              100
            ).toFixed(0),
          "" +
            (
              (this.yellowValue /
                this.arrangeSpaceTableManually(this.constTable).length) *
              100
            ).toFixed(0),
          "" +
            (
              (this.orangeValue /
                this.arrangeSpaceTableManually(this.constTable).length) *
              100
            ).toFixed(0),
          "" +
            (
              (this.redValue /
                this.arrangeSpaceTableManually(this.constTable).length) *
              100
            ).toFixed(0),
        ];
      return ["0", "0", "0", "0"];
    },
    greenValue() {
      return this.arrangeSpaceTableManually(this.constTable).filter(
        (x) => x.currentValue < 600
      ).length;
    },
    yellowValue() {
      return this.arrangeSpaceTableManually(this.constTable).filter(
        (x) => x.currentValue > 600 && x.currentValue < 1200
      ).length;
    },
    orangeValue() {
      return this.arrangeSpaceTableManually(this.constTable).filter(
        (x) => x.currentValue > 1200 && x.currentValue < 5000
      ).length;
    },
    redValue() {
      return this.arrangeSpaceTableManually(this.constTable).filter(
        (x) => x.currentValue > 5000
      ).length;
    },
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.tableData.length;
    },
    roomStatusData() {
      if (
        (this.greenValue &&
          this.yellowValue &&
          this.orangeValue &&
          this.redValue) ||
        this.greenValue + this.yellowValue + this.orangeValue + this.redValue ==
          0
      )
        return {
          labels: ["Pas de données"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["#e8e9e9"],
            },
          ],
        };
      else
        return {
          labels: ["Niveau correct", "Modéré", "Pas sain", "Hasardeux"],
          datasets: [
            {
              data: [
                this.greenValue,
                this.yellowValue,
                this.orangeValue,
                this.redValue,
              ],
              backgroundColor: ["#11eda9", "#ffe600", "#ffa400", "#ff000b"],
            },
          ],
        };
    },
    equipedState() {
      if (this.cpList) return this.cpList.equiped;
      return 0;
    },
    maintainanceState() {
      if (this.cpList) return this.cpList.maintainance;
      return 0;
    },
    noSensorState() {
      if (this.cpList) return this.cpList.noSensor;
      return 0;
    },
    globalStateData() {
      if (!(this.equipedState, this.maintainanceState, this.noSensorState))
        return {
          labels: ["Pas de données"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["#e8e9e9"],
            },
          ],
        };
      else
        return {
          labels: [
            "Équipé d'un capteur de Co2",
            "Entretien requis",
            "Aucun capteur trouvé",
          ],
          datasets: [
            {
              data: [
                this.equipedState,
                this.maintainanceState,
                this.noSensorState,
              ],
              backgroundColor: ["#14202c", "#00c4ff", "#cadee2"],
            },
          ],
        };
    },
    ...mapGetters({
      building: "building",
      cpList: "cpList",
      spaceFilter: "spaceFilter",
    }),
  },
  methods: {
    downloadCSVLocally() {
      let t = this.tableData;
      t.map((element) => delete element.id);
      this.downloadCSV({ tab: t, measure: "Qualité de l'Air" });
    },
    async fct(a) {
      switch (a.level) {
        case 0:
          return await getFloors();
        case 1:
          return await getRooms(a);
        case 2:
          return await getEquipments(a);
        default:
          break;
      }
    },
    async selection(element) {
      if (element.level == 0) this.setSpaceFilter("SHOW ALL");
      else this.setSpaceFilter(element.name);
    },
    colorCode(v) {
      if (v < 600) return "green-color";
      else if (v < 1200) return "yellow-color";
      else if (v < 5000) return "orange-color";
      else if (v > 5000) return "red-color";
    },
    myEventHandler() {
      this.pieHeight = window.innerHeight / 5;
      this.tableHeight = window.innerHeight - (112 + 90 + 30 + 12);
      if (
        this.$refs.statcard.clientHeight &&
        this.$refs.bottomcharts.clientHeight
      ) {
        this.desktopTableHeight =
          window.innerHeight -
          (this.$refs.statcard.clientHeight +
            this.$refs.bottomcharts.clientHeight +
            this.$refs.selected.clientHeight +
            this.$refs.filter.clientHeight +
            160);
      }
    },
    dropIt(LR) {
      if (LR === "right") {
        this.isDropped = !this.isDropped;
      } else {
        this.isDroppedLeft = !this.isDroppedLeft;
      }
    },
    colorArrange() {
      this.tableData = [];
      let tempTable = this.arrangeSpaceTableManually(this.constTable);
      if (this.colorF[0]) {
        tempTable
          .filter((x) => x.currentValue < 600)
          .forEach((element) => {
            this.tableData.push(element);
          });
      }
      if (this.colorF[1]) {
        tempTable
          .filter((x) => x.currentValue >= 600 && x.currentValue < 1200)
          .forEach((element) => {
            this.tableData.push(element);
          });
      }
      if (this.colorF[2]) {
        tempTable
          .filter((x) => x.currentValue < 5000 && x.currentValue >= 1200)
          .forEach((element) => {
            this.tableData.push(element);
          });
      }
      if (this.colorF[3]) {
        tempTable
          .filter((x) => x.currentValue >= 5000)
          .forEach((element) => {
            this.tableData.push(element);
          });
      }
    },
    arrangeSpaceTableManually(v) {
      this.isDroppedLeft = false;
      this.isDropped = false;
      if (v) {
        if (this.spaceFilter === "SHOW ALL") return v;
        else if (this.spaceFilter === "BUILDING")
          return v.filter((element) => element.name === "-");
        else
          return v.filter(
            (element) =>
              element.floor === this.spaceFilter && element.name !== "-"
          );
      }
      return [];
    },
    customSort() {
      if (this.sortOrder == "asc")
        this.tableData.sort((prev, next) => {
          return prev.currentValue - next.currentValue;
        });
      else
        this.tableData.sort((prev, next) => {
          return -prev.currentValue + next.currentValue;
        });
      this.sortOrder = this.sortOrder == "desc" ? "asc" : "desc";
    },
    ...mapActions({
      initControlEndpoints: "initControlEndpoints",
      setSpaceFilter: "setSpaceFilter",
      downloadCSV: "downloadCSV",
    }),
  },
  async mounted() {
    this.desktopTableHeight =
      window.innerHeight -
      (this.$refs.statcard.clientHeight +
        this.$refs.bottomcharts.clientHeight +
        this.$refs.selected.clientHeight +
        this.$refs.filter.clientHeight +
        160);

    if (!this.cpList) {
      this.initControlEndpoints(this.name).then();
    } else {
      this.constTable = JSON.parse(JSON.stringify(this.cpList.data));
      this.floorList = this.building.children;
    }
  },
  created() {
    window.addEventListener("resize", this.myEventHandler);
  },
  watch: {
    windowWidth(v1) {
      this.chartOptions.plugins.legend.position =
        v1 >= 960 ? "right" : "bottom";
    },
    constTable(v1) {
      this.tableData = this.arrangeSpaceTableManually(v1);
    },
    building(v1) {
      this.floorList = JSON.parse(JSON.stringify(v1)).children;
    },
    cpList(v1) {
      this.constTable = JSON.parse(JSON.stringify(v1.data));
    },
    spaceFilter() {
      this.pagination.currentPage = 1;
      this.tableData = this.arrangeSpaceTableManually(this.constTable);
      this.colorArrange();
    },
    colorF() {
      this.colorArrange();
    },
  },
};
</script>

<style scoped>
html {
  overflow-y: auto !important;
}

#application {
  background: transparent linear-gradient(121deg, #f8fafa 0%, #d6e2e6 100%) 0%
    0% no-repeat padding-box;
}
.main-container {
  display: flex !important;
}
.square {
  height: 30px;
  width: 30px;
  background-color: #555;
  border-radius: 6px;
}
.stat-card {
  background-color: #f9f9f9 !important;
}

.stat-element {
  display: flex;
  align-items: center;
}

.big-number {
  padding-right: 0.5em;
  font-weight: 400;
  color: #374063;
  font-size: 36px !important;
  letter-spacing: 2px;
}

.big-caption {
  letter-spacing: 2px;
  font-size: 14px;
}

.small-caption {
  letter-spacing: 2px;
  font-size: 10px;
}

.horizontal-split {
  display: flex;
  flex-flow: column;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
}

.green-background {
  background-color: #11eda9 !important;
}
.yellow-background {
  background-color: #ffe600 !important;
}
.orange-background {
  background-color: #ffa400 !important;
}
.red-background {
  background-color: #ff000b !important;
}

@media (min-width: 960px) {
  .parent-container {
    /* background-image: linear-gradient(135deg, #f5f8f8, 80%, #d3dfe3) !important; */
  }
  .bottom-nav {
    visibility: hidden;
  }
  .mobile-version {
    display: none !important;
  }
}

@media (max-width: 959px) {
  .main-container {
    padding-bottom: 68px;
  }
  .desktop-version {
    display: none !important;
  }
  .tile.green-border {
    border-left: 7px solid #1de9b6 !important;
    animation-name: fadeIn;
    animation-duration: 0.2s;
  }

  .tile.yellow-border {
    border-left: 7px solid #ffee58 !important;
    animation-name: fadeIn;
    animation-duration: 0.5s;
  }
  .tile.orange-border {
    border-left: 7px solid #ffa726 !important;
    animation-name: fadeIn;
    animation-duration: 0.8s;
  }
  .tile.red-border {
    border-left: 7px solid #ff1744 !important;
    animation-name: fadeIn;
    animation-duration: 1.1s;
  }

  .small-caption {
    letter-spacing: 2px;
    font-size: 14px;
  }
  .big-number {
    font-size: 26px !important;
  }
}

@media (max-width: 959px) {
  .parent-container {
    /* background-image: linear-gradient(135deg, #f5f8f8, 80%, #d3dfe3) !important; */
  }
}

@media (max-width: 959px) and (orientation: landscape) {
  .tile {
    min-width: 200px;
    min-height: 100px;
    flex-direction: row;
  }
  .portrait-display {
    display: none;
  }
}

@media (max-width: 959px) and (orientation: portrait) {
  .tile {
    min-height: 150px;
    min-width: auto;
    flex-direction: column;
  }
  .portrait-display {
    display: flex;
    flex-direction: column !important;
  }
  .landscape-display {
    display: none;
  }
  .card-header-text {
    font-weight: 500;
    color: #677088;
    letter-spacing: 2px;
    font-size: 20px !important;
  }
}

.card-header-text {
  font-weight: 500;
  color: #677088;
  letter-spacing: 2px;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

::v-deep .theme--light.v-pagination .v-pagination__item--active {
  background-color: #eaeef0 !important;
  color: #59636b;
  border: 1px solid #d7dee3 !important;
}

::v-deep .theme--light.v-pagination .v-pagination__item {
  background-color: transparent !important;
  color: #59636b;
  box-shadow: none;
  border: 1px solid #d7dee3;
  min-width: 50px;
  border-radius: 8px;
}

::v-deep .theme--light.v-pagination .v-pagination__navigation {
  background-color: transparent !important;
  color: #59636b;
  box-shadow: none;
  border: 1px solid #d7dee3;
}

::v-deep .v-input--selection-controls {
  margin-top: 0;
}

::v-deep .v-item-group.v-bottom-navigation .v-btn.v-btn--active {
  color: #f6f6f6;
  background-color: #546e7a !important;
}

::v-deep .v-btn:before {
  background-color: none;
}
.activemobiletab {
  color: #f6f6f6 !important;
  background-color: #546e7a !important;
}
.table-data {
  box-shadow: none !important;
  background-color: white !important;
}

.table-card {
  background-color: #f9f9f9 !important;
}
.header-table-data {
  box-shadow: none !important;
  background-color: rgb(175, 30, 30) !important;
}
.bot-nav-buttons {
  box-shadow: none !important;
  background-color: transparent !important;
  border: none;
  min-height: 60px;
  margin-right: 20px;
  margin-bottom: 80px;
  border-radius: 10px 10px 10px 10px !important;
}
::v-deep
  .theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th {
  color: #546e7a;
}

tr {
  background-color: transparent !important;
}

.rectanlge-small {
  height: 20px;
  width: 10px;

  border-radius: 3px;
}
.green-color {
  background-color: #11eda9;
}
.yellow-color {
  background-color: #ffe600;
}

.orange-color {
  background-color: #ffa400;
}

.red-color {
  background-color: #ff000b;
}

.grey-color {
  color: #677088;
}
::v-deep .v-app-bar.v-app-bar--fixed {
  position: relative !important;
}

::v-deep .v-input--selection-controls .v-input__slot > .v-label,
.v-input--selection-controls .v-radio > .v-label {
  font-size: 12px;
  font-weight: 500;
  color: #677088;
}
</style>

<style>
html {
  /* overflow-y: hidden !important; */
}
</style>