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
      class="ma-2 pa-1"
      v-model="nav"
      :path.sync="path"
      :max-depth="3"
      :expand-selector="expandSelector"
    ></sc-spinal-navigator>
    <v-main class="pt-2 pl-1 pr-1">
      <sc-bar-card
        v-if="isLoaded(selectedSpace, current_workflow)"
        style="height: 50%"
        class="ma-2 pa-1"
        :title="'Activité des tickets en cours'"
        :labels="barChartData.labels"
        :datasets="barChartData.datasets"
        stacked
      >
        <template v-slot:extras>
          <v-select
            style="width: 15%"
            class="ml-8"
            label="Domaine"
            v-model="domain_filter"
            :items="domains(selectedSpace, current_workflow).map((d) => d.name)"
            variant="solo"
          ></v-select>
        </template>
      </sc-bar-card>
      <sc-loading-card
        style="height: 50%"
        class="ma-2 pa-1"
        v-else
      ></sc-loading-card>
      <div
        style="height: 7%"
        class="d-flex flex-row ma-2 justify-space-between"
      >
        <sc-stat-card
          v-if="isLoaded(selectedSpace, current_workflow)"
          class="flex-grow-1 mr-1"
          :type="'comparison'"
          :value="tickets(selectedSpace, current_workflow).year.length"
          :unit="'Tickets'"
          :title="'créés en ' + new Date().getFullYear()"
          :compared="comparedValue"
          :subtitle="'par rapport à l\'année dernière'"
        ></sc-stat-card>
        <sc-loading-card class="flex-grow-1 mr-1" v-else></sc-loading-card>
        <sc-stat-card
          v-if="isLoaded(selectedSpace, current_workflow)"
          class="flex-grow-1 ml-1 mr-1"
          :type="'comparison'"
          :value="tickets(selectedSpace, current_workflow).decade.length"
          :unit="'Tickets'"
          :title="'en cours'"
          :compared="''"
          :subtitle="midValue"
        ></sc-stat-card>
        <sc-loading-card class="flex-grow-1 ml-1 mr-1" v-else></sc-loading-card>
        <sc-stat-card
          v-if="isLoaded(selectedSpace, current_workflow)"
          class="flex-grow-1 ml-1"
          :value="tickets(selectedSpace, current_workflow).day.length"
          :unit="'Tickets'"
          :title="'créés'"
          :subtitle="'Aujourd\'hui'"
        ></sc-stat-card>
        <sc-loading-card class="flex-grow-1 ml-1" v-else></sc-loading-card>
      </div>
      <div
        style="height: 31%"
        class="d-flex flex-row ma-2 justify-space-between"
      >
        <sc-pie-card
          v-if="isLoaded(selectedSpace, current_workflow)"
          class="flex-grow-1 mr-1"
          :title="'Tickets par domaine'"
          :pie-chart-data="domainSplittenPie"
        ></sc-pie-card>
        <sc-loading-card class="flex-grow-1 mr-1" v-else></sc-loading-card>
        <sc-pie-card
          v-if="isLoaded(selectedSpace, current_workflow)"
          class="flex-grow-1 ml-1"
          :title="'Tickets par déclarant'"
          :pie-chart-data="declarants"
          :color="nav.element.color"
        ></sc-pie-card>
        <sc-loading-card class="flex-grow-1 ml-1" v-else></sc-loading-card>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import BarCard from "spinal-components/src/components/BarCard.vue";
import LoadingCard from "spinal-components/src/components/LoadingCard.vue";
import PieCard from "spinal-components/src/components/PieCard.vue";
import SpinalNavigator from "spinal-components/src/components/SpinalNavigator.vue";
import StatsCard from "spinal-components/src/components/StatsCard.vue";
import { mapActions, mapGetters } from "vuex";
import { label, previousYear } from "./date-comparison";
import { gradiant, HSVtoRGB, RGBtoHexa } from "./colors";
import {
  getBuildingAsync,
  getTicketWorkflowAsync,
  getFloorListAsync,
  getRoomListAsync,
} from "./api-requests";

export default {
  name: "App",
  components: {
    "sc-bar-card": BarCard,
    "sc-loading-card": LoadingCard,
    "sc-pie-card": PieCard,
    "sc-spinal-navigator": SpinalNavigator,
    "sc-stat-card": StatsCard,
    
  },
  data() {
    return {
      nav: {
        element: { name: "Liste des workflow", title: "" },
        period: { name: "SEMAINE", value: "week" },
      },
      current_workflow: 0,
      domain_filter: "Tous les domaines",
      path: {},
    };
  },
  computed: {
    ...mapGetters({
      tickets: "getTickets",
      domains: "getDomains",
      isLoaded: "isLoaded",
    }),
    selectedSpace() {
      return this.nav.element.dynamicId;
    },
    currentDomain() {
      return this.domains(this.selectedSpace, this.current_workflow).find(
        (d) => d.name === this.domain_filter
      );
    },
    comparedValue() {
      const tickets = this.tickets(this.selectedSpace, this.current_workflow);
      const current = tickets.year.length;
      const last_year = tickets.decade.filter((t) => {
        const date = t.creation_date.split("/");
        return previousYear(
          new Date(),
          new Date(date[2], date[1] - 1, date[1])
        );
      }).length;
      const result = current - last_year;
      return result > 0 ? "+" + result : result;
    },
    midValue() {
      const min = 4;
      const max = 7;
      const val = this.tickets(this.selectedSpace, this.current_workflow).decade
        .length;
      return val < min
        ? "En dessous de la moyenne"
        : val > max
        ? "Au dessus de la moyenne"
        : "Dans la moyenne";
    },
    selectedSeries() {
      return this.currentDomain.tickets;
    },
    domainSplittenPie() {
      const doms = this.domains(this.selectedSpace, this.current_workflow).map(
        (d) => {
          return { label: d.name, value: d.number };
        }
      );
      doms.shift();
      return doms.length > 0 ? doms : [{ label: "pas de tickets", value: 0 }];
    },
    declarants() {
      return this.currentDomain.declarants.length > 0
        ? this.currentDomain.declarants
        : [{ label: "pas de tickets", value: 0 }];
    },
    barChartData() {
      return {
        labels: label[this.nav.period.value],
        datasets: this.selectedSeries[this.nav.period.value],
      };
    },
  },
  methods: {
    ...mapActions({
      downloadCSV: "downloadCSV",
      initWorkflows: "initWorkflows",
      loadWorkflow: "loadWorkflow",
    }),
    async expandSelector(item) {
      let list,
        colors,
        i = 0;
      switch (item.level) {
        case 0:
          list = [await getBuildingAsync()];
          colors = gradiant(list.length);
          for (const item of list) {
            col = HSVtoRGB(colors[i++] / 100, 1, 1);
            item.color = RGBtoHexa(col.r, col.g, col.b);
          }
          return list;
        case 1:
          list = await getFloorListAsync(item.dynamicId);
          colors = gradiant(list.length);
          for (const item of list) {
            col = HSVtoRGB(colors[i++] / 100, 1, 1);
            item.color = RGBtoHexa(col.r, col.g, col.b);
          }
          return list;
        case 2:
          list = await getRoomListAsync(item.dynamicId);
          colors = gradiant(list.length);
          for (const item of list) {
            col = HSVtoRGB(colors[i++] / 100, 1, 1);
            item.color = RGBtoHexa(col.r, col.g, col.b);
          }
          return list;
        default:
          break;
      }
    },
  },
  async mounted() {
    const building = await getBuildingAsync();
    const workflow = await getTicketWorkflowAsync();
    this.nav.element.title = building.name;
    this.selectedSpace = this.nav.element.dynamicId = building.dynamicId;
    this.current_workflow = workflow.dynamicId;
    await this.initWorkflows();
  },
};
</script>

<style scoped>
#application {
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
}

.v-main {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 60px;
  bottom: 0px;
  left: 0;
  right: 0;
}

.section {
  height: 45%;
}
</style>
