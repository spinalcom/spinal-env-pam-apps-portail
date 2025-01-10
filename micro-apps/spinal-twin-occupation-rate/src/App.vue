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
    <div class="header">
      <sc-spinal-navigator
      class="ma-1 pa-1"
      v-model="navigator"
      :path.sync="path"
      :max-depth="2"
      :expand-selector="expand"
    ></sc-spinal-navigator>
    </div>
    
    <v-main v-if="loading">
      <sc-loader></sc-loader>
    </v-main>
    <v-main style="position: absolute; margin-top: 3.5%; width: 100%" v-else>
      <sc-bar-card
        id="bar-section"
        :title="'Taux d\'occupation'"
        :labels="barChartData.labels"
        :datasets="barChartData.datasets"
      ></sc-bar-card>

      
      <div>
        <v-card style="margin: 12px">
          <v-card-title>
            <span class="total-occupancy"
              >DETAIL DE L'OCCUPATION PAR GROUPE
            </span>
          </v-card-title>
          <v-card-text>
            <rectangle-viz-vue
              :display_levels_row="true"
              element_type="BATIMENT"
              :occupancy_persentage="this.occupancy_persentage[0]"
              :area="this.area[0]"
              :floorOccupancyValues="this.floorEndpointValues[0]"
              
            />
            <rectangle-viz-vue
              color="#1C5791"
              element_type="BUREAUX"
              :occupancy_persentage="this.occupancy_persentage[0]"
              :area="this.area[1]"
              :floorOccupancyValues="this.floorEndpointValues[0]"
              
            />
            <rectangle-viz-vue
              color="#418FDD"
              element_type="SALLES DE REUNION"
              :occupancy_persentage="this.occupancy_persentage[1]"
              :area="this.area[2]"
              :floorOccupancyValues="this.floorEndpointValues[0]"
            />
            <rectangle-viz-vue
              color="#41C5DD"
              element_type="BULLES"
              :occupancy_persentage="this.occupancy_persentage[0]"
              :area="this.area[3]"
              :floorOccupancyValues="this.floorEndpointValues[0]"
            />
          </v-card-text>
        </v-card>
      </div>
    </v-main>
  </v-app>
</template>

<script>

import { mapState, mapActions, mapGetters } from "vuex";
import { label } from "./date-comparison";
import { getEquipments, getFloors, getRooms } from "./functions/getBuilding";
import { buildingEndpoint } from "./data-management/numeric-time-series"
import {getBuildingFloorsOccupancyAsync, getAreaAndOccupancyByGroup, getRoomsGroupListById} from "./api-requests"
import rectangleVizVue from "./components/rectangle-viz.vue"
export default {
  components: {
    rectangleVizVue
  },
  data() {
    return {
      floor: [],
      area:[0,0,0,0],
      floorEndpointValues:[], // [0]: Building occupancy. [1]: Desks occupancy. [2]: Meeting rooms occupancy. [3]: Bulles occupancy
      
      /* [
        { name: "-2", value: 50 },
        { name: "-1", value: 55 },
        { name: "0", value: 78 },
        { name: "1", value: 32 },
        { name: "2", value: 25 },
        { name: "3", value: 88 },
        { name: "4", value: 41 },
        { name: "5", value: 79 },
        { name: "6", value: 32 },
        { name: "7", value: 85 },
        { name: "8", value: 96 }
      ], */
      buildingOccupancy:0,
      occupancy_persentage: [],
      navigator: {
        element: { title: 'Bâtiment', name: 'Liste des Bâtiments' },
        period: { name: "SEMAINE", value: "week" }
      },
      path: {},
      loading: true,
    };
  },

  computed: {
    ...mapState({
      building: state => state.building,
      building_time_series: state => state.building_time_series,
      floors_time_series: state => state.floors_time_series,
      endpoints: state => state.endpoints,
    }),
    ...mapGetters({
      energyConsumption: "energyConsumption",
      /* lightingConsumption: "lightingConsumption",
      heatingConsumption: "heatingConsumption", */
    }),
    selectedSeries() {
      this.floor = this.floors_time_series.map(fl => fl.floor)
      return this.navigator.element.title === "Bâtiment"
          ? this.building_time_series
          : this.floors_time_series.find(
              f => f.floor === this.navigator.element.title
          ).series;
    },
    barChartData() {
      console.log("this.selectedSeries[this.navigator.period.value][0]", this.selectedSeries[this.navigator.period.value][0]);
      console.log("this.building_time_series", this.building_time_series);
      return {
        labels: label[this.navigator.period.value],
        datasets: [
          {
            label: 'Taux d\'occupation',
            data: this.selectedSeries[this.navigator.period.value][0],
            backgroundColor: ["#418FDD"],
          },
        ]
      }
    },
 
    lastPeriodCompare() {
      let p = [0, 0];
      for(let i = -8; i>=-14; i--) p[1] += this.selectedSeries['month'][0][31+i];
      if(p[1]!=0) p[1] = 0 //(((this.lightingConsumption('month')-p[1])/p[1])*100).toFixed(2);
      else p[1] = Infinity;
      let lastYearConsumption = this.building_time_series.decade[0][8];
      let currentYearConsumption = this.building_time_series.decade[0][9];
      if(lastYearConsumption!=0) p[0] = (((currentYearConsumption-lastYearConsumption)/lastYearConsumption)*100).toFixed(2);
      else p[0] = Infinity;
      return p;
    },
  },

  methods: {
    async view(){
      let buildingFloorsOccupancy = await getBuildingFloorsOccupancyAsync();
      this.floorEndpointValues[0] = buildingFloorsOccupancy.floorsEndpointValues
      this.occupancy_persentage.push(buildingFloorsOccupancy.buildingEndpointValue)
      this.area[0] = buildingFloorsOccupancy.area;

      // Desks,occupancy 
      this.floorEndpointValues[1] = 0;
      let dataResultDesks = await getAreaAndOccupancyByGroup("Meeting Room");
      this.area[2] = dataResultDesks.areaResult;
      this.occupancy_persentage.push(dataResultDesks.occupancyResult);
      this.floorEndpointValues[2] = dataResultDesks.floorOccupancyResult.toFixed(2);
    },
    ...mapActions({
      getEnergyConsumption: "getEnergyConsumption",
      initializeBuilding: 'initializeBuilding',
    }),
    async expand(item) {
      switch (item.level) {
        case 0:
          return [{ name: 'Bâtiment', dynamicId: this.building.dynamicId, color: "#fff"}]
        case 1:
          return await getFloors();
        case 2:
          return await getRooms(item);
        case 3:
          return await getEquipments(item);
        default:
          break
      }
    }
  },

  async mounted() {
    this.initializeBuilding().then(() => {
      this.getEnergyConsumption();
      this.view();
    });
  },

  // rebuilding the component once the data is loaded
  watch: {
    floors_time_series() {
      this.loading = !this.loading; // the key will reconstruct itself if the key is modified
    },
  }
};
</script>

<style lang="scss">
html {
  overflow-y: auto !important;
}
.total-occupancy {
  top: 93px;
  left: 21px;
  width: 400px;
  height: 13px;
  /* UI Properties */
  text-align: left;
  font: normal normal normal 11px/13px Charlevoix Pro;
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
}
#application {
  // position: fixed;
  // top: 0px;
  // bottom: 0px;
  width: 100%;
  height: 100%;
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
}

.stat-card {
  height: 33%;
}

#stat-section {
  height: 55%;
}
</style>
