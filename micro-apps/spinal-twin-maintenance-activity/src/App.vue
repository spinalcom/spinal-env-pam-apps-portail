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
      :max-depth="2"
      :expand-selector="expandSelector"
    ></sc-spinal-navigator>
    <sc-loader v-if="!isLoaded(current_workflow)"></sc-loader>
    <v-main class="pa-1" v-else>
      <sc-bar-card
        :title="'Activité des tickets'"
        :labels="barChartData.labels"
        :datasets="barChartData.datasets"
      ></sc-bar-card>
      <div class="d-flex flex-row">
        <sc-pie-card
          :title="'Tickets par déclarants'"
          :pie-chart-data="declarants(current_workflow)"
        ></sc-pie-card>
        <sc-pie-card
          :title="'Tickets par domaines'"
          :pie-chart-data="domainSplittenPie"
        ></sc-pie-card>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { label } from "./date-comparison";
import { gradiant, HSVtoRGB, RGBtoHexa } from "./colors";
import {
  getTicketWorkflowAsync,
  getWorkflowListAsync,
  getProcessListAsync,
} from "./api-requests";

export default {
  name: "App",

  data() {
    return {
      nav: {
        element: { name: "Liste des workflow", title: "" },
        period: { name: "SEMAINE", value: "week" },
      },
      current_workflow: 0,
      path: {},
      loading: true,
    };
  },
  computed: {
    ...mapGetters({
      tickets: "getTickets",
      steps: "getSteps",
      domains: "getDomains",
      declarants: "getDeclarants",
      isLoaded: "isLoaded",
    }),
    selectedSeries() {
      const domain =
        this.domains(this.current_workflow).find(
          (d) => d.name === this.nav.element.title
        ) ||
        this.domains(this.current_workflow).find(
          (d) => d.name === "Tous les domaines"
        );
      return domain.tickets;
    },
    domainSplittenPie() {
      const doms = this.domains(this.current_workflow).map((d) => {
        return { label: d.name, value: d.number };
      });
      doms.shift();
      return doms;
    },
    barChartData() {
      const series = this.selectedSeries[this.nav.period.value];
      const colors = gradiant(series.length);
      let i = 0;
      for (const serie of series) {
        col = HSVtoRGB(colors[i++] / 100, 1, 1);
        serie.backgroundColor = RGBtoHexa(col.r, col.g, col.b);
      }
      return {
        labels: label[this.nav.period.value],
        datasets: series,
      };
    },
  },
  methods: {
    ...mapActions({
      downloadCSV: "downloadCSV",
      initWorkflows: "initWorkflows",
      loadWorkflow: "loadWorkflow",
    }),
    setSearchedData() {
      return this.tickets(this.current_workflow).length === 0
        ? [
            {
              gmaoId: "en attente",
              name: "en attente",
              step: "en attente",
              domain: "en attente",
              creation_date: "en attente",
              last_step_date: "en attente",
              declarant: "en attente",
            },
          ]
        : this.tickets(this.current_workflow)[this.nav.period.value];
    },
    async expandSelector(item) {
      let list,
        colors,
        i = 0;
      switch (item.level) {
        case 0:
          list = await getWorkflowListAsync();
          colors = gradiant(list.length);
          for (const item of list) {
            col = HSVtoRGB(colors[i++] / 100, 1, 1);
            item.color = RGBtoHexa(col.r, col.g, col.b);
          }
          return list;
        case 1:
          list = await getProcessListAsync(item.dynamicId);
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
    const workflow = await getTicketWorkflowAsync();
    this.nav.element.title = workflow.name;
    this.current_workflow = workflow.dynamicId;
    await this.initWorkflows();
  },
  watch: {
    nav(v) {
      if (this.current_workflow === this.path[1]) return;
      this.current_workflow = this.path[1];
      this.loadWorkflow(this.current_workflow);
    },
  },
};
</script>

<style scoped>
html {
  overflow-y: auto !important;
}

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

.pie-card {
  width: 49%;
}
</style>
