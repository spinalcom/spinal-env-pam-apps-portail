<template>
  <v-app id="application">
    <div class="d-flex justify-end">
      <sc-download-button class="mr-1"></sc-download-button>
      <div class="selectors">
        <div class="Hx1">
          <space-selector
            :open.sync="openSpaceSelector"
            :maxDepth="-1"
            :GetChildrenFct="() => []"
            v-model="el"
            label="ESPACE"
          />
        </div>
        <div class="Hx2">
          <space-selector
            :edge="false"
            :open.sync="openTimeSelector"
            :maxDepth="0"
            :GetChildrenFct="onTimeSelectOpen"
            v-model="period"
            label="TEMPORALITÉ"
          />
        </div>
      </div>
    </div>

    <div class="main-app d-flex flex-column justify-space-between">
      <sc-bar-card
        v-if="loaded"
        style="height: calc(65% - 16px)"
        :title="'Historique des tickets'"
        :labels="barChartData.labels"
        :datasets="barChartData.datasets"
        stacked
      >
        <template v-slot:extras>
          <div class="d-flex flex-row ml-8">
            <div style="width: 20%">
              <v-select
                v-model="workflow"
                label="Worflow"
                :items="expandSelector({ level: 0 })"
                append-icon="mdi-chevron-down"
                clearable
                clear-icon="mdi-close-circle-outline"
                multiple
                outlined
                menu-props="offset-y"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    @click:close="workflow = workflow.filter((w) => w !== item)"
                    close
                    :close-icon="'mdi-close-circle'"
                    style="
                      font-size: 12px;
                      height: 24px;
                      max-width: calc(90% - 25px);
                    "
                    v-if="index < 1"
                  >
                    <span style="max-width: 90%; overflow: hidden">{{
                      item
                    }}</span>
                  </v-chip>

                  <span
                    v-if="index === 1"
                    class="text-grey text-caption align-self-center"
                  >
                    (+{{ workflow.length - 1 }})
                  </span>
                </template>
              </v-select>
            </div>
            <div style="width: 20%" class="ml-5">
              <v-select
                v-model="process"
                label="Domaine"
                :items="expandSelector({ level: 1 })"
                append-icon="mdi-chevron-down"
                clearable
                clear-icon="mdi-close-circle-outline"
                multiple
                outlined
                menu-props="offset-y"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    @click:close="process = process.filter((p) => p !== item)"
                    close
                    :close-icon="'mdi-close-circle'"
                    style="
                      font-size: 12px;
                      height: 24px;
                      max-width: calc(90% - 25px);
                    "
                    v-if="index < 1"
                  >
                    <span style="max-width: 90%; overflow: hidden">{{
                      item
                    }}</span>
                  </v-chip>

                  <span
                    v-if="index === 1"
                    class="text-grey text-caption align-self-center"
                  >
                    (+{{ process.length - 1 }})
                  </span>
                </template>
              </v-select>
            </div>
          </div>
        </template>
      </sc-bar-card>
      <sc-loading-card
        v-else
        style="height: calc(65% - 16px)"
      ></sc-loading-card>
      <div style="height: 35%" class="d-flex flex-row justify-space-between">
        <sc-pie-card
          v-if="loaded"
          class="d-flex"
          style="width: 36%"
          title="Tickets par déclarants"
          :pie-chart-data="pieChartData"
        ></sc-pie-card>
        <sc-loading-card v-else style="width: 36%"></sc-loading-card>
        <div
          v-if="loaded"
          style="width: calc(64% - 16px)"
          class="d-flex flex-row align-content-space-between justify-space-between flex-wrap"
        >
          <sc-stat-card
            style="width: calc(50% - 8px); height: calc(50% - 8px)"
            v-for="(indicator, i) in indicators"
            :key="i"
            :value="indicator.value"
            :unit="indicator.unit"
            :title="indicator.title"
            :subtitle="indicator.subtitle"
            :type="indicator.type"
            :compared="indicator.compared"
          >
          </sc-stat-card>
        </div>
        <div
          v-else
          style="width: calc(64% - 16px)"
          class="d-flex flex-row align-content-space-between justify-space-between flex-wrap"
        >
          <sc-loading-card
            v-for="i in 4"
            :key="i"
            style="width: calc(50% - 8px); height: calc(50% - 8px)"
          ></sc-loading-card>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import config from "../../../config.json";
import { mapActions, mapGetters, mapState } from "vuex";
import { SpaceSelector } from "./components/SpaceSelector";
import { getBuildingAsync } from "./api-requests";

export default {
  name: "App",

  components: { SpaceSelector },

  data() {
    return {
      workflow: [],
      process: [],
      period: { name: "SEMAINE", value: "week" },
      openSpaceSelector: false,
      openTimeSelector: false,
      el: { name: "Bâtiment" },
    };
  },

  computed: {
    ...mapState({
      loaded: (state) => state.loaded,
      displayed: (state) => state.displayable,
    }),
    ...mapGetters({
      getBarChartData: "getBarData",
      getPieChartData: "getPieData",
      getIndicators: "getIndicators",
    }),
    to_display() {
      return !this.process.length
        ? this.currentWorkflow
        : this.displayed.filter(
            (p) =>
              this.currentWorkflow
                .map((w) => w.dynamicId)
                .includes(p.workflowId) && this.process.includes(p.name)
          );
    },
    pieChartData() {
      return this.getPieChartData({
        displayedIds: this.to_display.map((d) => d.dynamicId),
      });
    },
    barChartData() {
      return this.getBarChartData({
        displayedIds: this.to_display.map((d) => d.dynamicId),
        period: this.period.value,
      });
    },
    indicators() {
      return this.getIndicators({
        displayedIds: this.to_display.map((d) => d.dynamicId),
      });
    },
    currentWorkflow() {
      return !this.workflow.length
        ? this.displayed.filter((d) => !d.workflowId)
        : this.displayed.filter((d) => this.workflow.includes(d.name));
    },
  },

  methods: {
    ...mapActions({
      initWorkflows: "initWorkflows",
      updateProcesses: "updateProcesses",
    }),
    expandSelector(item) {
      switch (item.level) {
        case 0:
          return config.workflowList;
        case 1:
          return [
            ...new Set(
              this.displayed
                .filter((p) =>
                  this.currentWorkflow
                    .map((w) => w.dynamicId)
                    .includes(p.workflowId)
                )
                .map((p) => p.name)
            ),
          ];
        default:
          break;
      }
    },

    onTimeSelectOpen(item) {
      if (item) return [];
      return [
        { name: "Semaine" },
        { name: "Mois" },
        { name: "Année" },
        { name: "Décennie" },
      ];
    },
  },

  async mounted() {
    const { name } = await getBuildingAsync();
    this.el.name = name;
    await this.initWorkflows();
  },

  watch: {
    async to_display(v) {
      await this.updateProcesses({
        displayedIds: v.map((d) => d.dynamicId),
        period: this.period.value,
      });
    },

    async period(p) {
      switch (p.name) {
        case "Semaine":
          p.value = "week";
          break;
        case "Mois":
          p.value = "month";
          break;
        case "Année":
          p.value = "year";
          break;
        case "Décennie":
          p.value = "decade";
          break;
      }
      await this.updateProcesses({
        displayedIds: this.to_display.map((d) => d.dynamicId),
        period: p.value,
      });
    },
  },
};
</script>

<style scoped>
#application {
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
  position: absolute;
  width: 100%;
  height: 100%;
}

.main-app {
  position: fixed;
  height: calc(100% - 70px);
  top: 70px;
  bottom: 0;
  left: 0;
  right: 0;
}

.Hx1 {
  position: absolute;
  width: 66%;
  right: 0px;
  top: -1px;
  height: 60px;
}
.Hx2 {
  position: absolute;
  width: 34%;
  right: calc(66%);
  top: -1px;
  height: 60px;
}
.selectors {
  position: relative;
  display: flex;
  height: 60px;
  width: 50%;
  background: #14202c;
  border: 1px solid #f5f5f5;
  border-radius: 12px;
}
</style>
