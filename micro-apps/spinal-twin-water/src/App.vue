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
  <!--Binding a key to the component-->
  <v-app id="application">
    <sc-spinal-navigator class="ma-1 pa-1"
                         v-model="navigator"
                         :path.sync="path"
                         :max-depth="2"
                         :expand-selector="expand"
    ></sc-spinal-navigator>
    <v-main v-if="loading">
      <sc-loader></sc-loader>
    </v-main>
    <v-main style="position: absolute; margin-top: 3.5%; width: 100%" v-else>
      <sc-bar-card id="bar-section"
          :title="'Consommation d\'eau'"
          :labels="barChartData.labels"
          :datasets="barChartData.datasets"
      ></sc-bar-card>

      <v-row id="stat-section">
        <v-col>
          <sc-double-stat-card
              :first-value="globalWaterConsumption('year')"
              :first-unit="'L'"
              :first-title="'CONSOMMÉE PAR LE BÂTIMENT CETTE ANNÉE'"
              :first-type="'comparison'"
              :first-compared="(lastPeriodCompare[0]>=0 ? '+' : '') + lastPeriodCompare[0] + ' %'"
              :first-subtitle="'PAR RAPPORT À L\'ANNÉE DERNIÈRE'"
              :second-value="sanitaryWaterConsumption('year')"
              :second-unit="'L'"
              :second-title="'EN EAU SANITAIRE'"
              :second-type="'comparison'"
              :second-compared="percentageCalculator[0] + ' %'"
              :second-subtitle="'DE LA CONSOMMATION TOTALE'"
              :second-color="'#29a0b1'"
          ></sc-double-stat-card>
        </v-col>
        <v-col>
          <sc-double-stat-card
              :first-value="globalWaterConsumption('week')"
              :first-unit="'KW'"
              :first-title="'CONSOMMÉE PAR LE BÂTIMENT CETTE SEMAINE'"
              :first-type="'comparison'"
              :first-compared="(lastPeriodCompare[1]>=0 ? '+' : '') + lastPeriodCompare[1] + ' %'"
              :first-subtitle="'PAR RAPPORT À L\'ANNÉE DERNIÈRE'"
              :second-value="sanitaryWaterConsumption('week')"
              :second-unit="'L'"
              :second-title="'EN EAU SANITAIRE'"
              :second-type="'comparison'"
              :second-compared="percentageCalculator[1] + ' %'"
              :second-subtitle="'DE LA CONSOMMATION TOTALE'"
              :second-color="'#29a0b1'"
          ></sc-double-stat-card>
        </v-col>
        <v-col>
          <sc-double-stat-card
              :first-value="globalWaterConsumption('day')"
              :first-unit="'KW'"
              :first-title="'CONSOMMÉ PAR LE BÂTIMENT AUJOURD\'HUI'"
              :first-subtitle="'AUJOURD\'HUI'"
              :second-value="sanitaryWaterConsumption('day')"
              :second-unit="'L'"
              :second-title="'EN EAU SANITAIRE'"
              :second-type="'comparison'"
              :second-compared="percentageCalculator[2] + ' %'"
              :second-subtitle="'DE LA CONSOMMATION TOTALE'"
              :second-color="'#29a0b1'"
          ></sc-double-stat-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { label } from "./date-comparison";
import {getEquipments, getFloors, getRooms} from "./functions/getBuilding";
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
      globalWaterConsumption: "globalWaterConsumption",
      sanitaryWaterConsumption: "sanitaryWaterConsumption",
    }),
    selectedSeries() {
      return this.navigator.element.title === "Bâtiment"
          ? this.building_time_series
          : this.floors_time_series.find(
              f => f.floor === this.navigator.element.title
          ).series;
    },
    barChartData() {
      return {
        labels: label[this.navigator.period.value],
        datasets: [
          {
            label: 'Eau globale',
            data: this.selectedSeries[this.navigator.period.value][0],
            backgroundColor: ["#14202c"],
          },
          {
            label: 'Eau sanitaire',
            data: this.selectedSeries[this.navigator.period.value][1],
            backgroundColor: ["#29A0B1"],
          }
        ]
      }
    },
    percentageCalculator() {
      let p = [0, 0, 0];
      if(this.globalWaterConsumption('day')!==0)
        p[2] = (this.sanitaryWaterConsumption('day') * 100 / this.globalWaterConsumption('day')).toFixed(2);
      if(this.globalWaterConsumption('week')!==0)
        p[1] = (this.sanitaryWaterConsumption('week') * 100 / this.globalWaterConsumption('week')).toFixed(2);
      if(this.globalWaterConsumption('year')!==0)
        p[0] = (this.sanitaryWaterConsumption('year') * 100 / this.globalWaterConsumption('year')).toFixed(2);
      return p;
    },
    lastPeriodCompare() {
      let p = [0, 0];
      for(let i = -8; i>=-14; i--) p[1] += this.selectedSeries['month'][0][31+i];
      if(p[1]!=0) p[1] = (((this.globalWaterConsumption('month')-p[1])/p[1])*100).toFixed(2);
      else p[1] = Infinity;
      let lastYearConsumption = this.building_time_series.decade[0][8];
      let currentYearConsumption = this.building_time_series.decade[0][9];
      if(lastYearConsumption!=0) p[0] = (((currentYearConsumption-lastYearConsumption)/lastYearConsumption)*100).toFixed(2);
      else p[0] = Infinity;
      return p;
    }
  },

  methods: {
    ...mapActions({
      getWaterConsumption: "getWaterConsumption",
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
      this.getWaterConsumption();
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
html{
  overflow-y: auto !important;
}

#application {
  position: fixed;
  top: 0px;
  bottom: 0px;
  width: 100%;
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
}

</style>
