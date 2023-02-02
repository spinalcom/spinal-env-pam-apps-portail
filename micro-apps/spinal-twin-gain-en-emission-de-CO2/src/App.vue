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
    <sc-spinal-navigator
      class="ma-1 pa-1"
      v-model="navigator"
      :path.sync="path"
      :max-depth="2"
      :expand-selector="expand"
    ></sc-spinal-navigator>
    <v-main v-if="loading">
      <sc-loader></sc-loader>
    </v-main>
    <v-main style="position: absolute; margin-top: 3.5%; width: 100%" v-else>
      <sc-bar-card
        id="bar-section"
        :title="'Gain en émission de CO2'"
        :labels="barChartData.labels"
        :datasets="barChartData.datasets"
      ></sc-bar-card>

      <v-row id="stat-section">
        <v-col>
          <sc-stat-card
            :value="+energyConsumption('year') + '%'"
            :unit="' '"
            :title="'DE GAIN EN ÉMISSION DE CO2 CETTE ANNÉE'"
            :color="'#418FDD'"
          ></sc-stat-card>
        </v-col>
        <v-col>
          <sc-stat-card
            :value="+energyConsumption('month') + '%'"
            :unit="' '"
            :title="'DE GAIN EN ÉMISSION DE CO2 CE MOIS'"
            :subtitle="' '"
            :color="'#418FDD'"
          ></sc-stat-card>
        </v-col>
        <v-col>
          <sc-stat-card
            :value="+energyConsumption('day') + '%'"
            :unit="' '"
            :title="'DE GAIN EN ÉMISSION DE CO2 AUJOURD\'HUI'"
            :subtitle="' '"
            :color="'#418FDD'"
          ></sc-stat-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { label } from "./date-comparison";
import { getEquipments, getFloors, getRooms } from "./functions/getBuilding";
export default {
  data() {
    return {
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
            label: 'GAIN EN ÉMISSION DE CO2',
            data: this.selectedSeries[this.navigator.period.value][0],
            backgroundColor: ["#418FDD"],
          },
        ]
      }
    },
    percentageCalculator() {
      let p = [0, 0, 0, 0, 0, 0];
      if(this.energyConsumption('day')!==0){
        p[2] = 0//(this.lightingConsumption('day') * 100 / this.energyConsumption('day')).toFixed(2);
        p[5] = 0//(this.heatingConsumption('day') * 100 / this.energyConsumption('day')).toFixed(2);
      }
      if(this.energyConsumption('week')!==0){
        p[1] = 0//(this.lightingConsumption('week') * 100 / this.energyConsumption('week')).toFixed(2);
        p[4] = 0 //(this.heatingConsumption('week') * 100 / this.energyConsumption('week')).toFixed(2);
      }
      if(this.energyConsumption('year')!==0){
        p[0] = 0 //(this.lightingConsumption('year') * 100 / this.energyConsumption('year')).toFixed(2);
        p[3] = 0 //(this.heatingConsumption('year') * 100 / this.energyConsumption('year')).toFixed(2);
      }
      return p;
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

#application {
  position: fixed;
  top: 0px;
  bottom: 0px;
  width: 100%;
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
}

.stat-card {
  height: 33%;
}

#stat-section {
  height: 55%;
}
</style>
