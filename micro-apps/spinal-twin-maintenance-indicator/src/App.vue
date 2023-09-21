<template>
  <v-app id="application">
    <div class="d-flex justify-end">
      <sc-download-button
        class="mr-1"
        :file-name="`Analyse des tickets: ${navText}`"
        :data="tableData"
      ></sc-download-button>
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
        :title="cardTitle"
        :labels="barChartData.labels"
        :datasets="barChartData.datasets"
        :line-datasets="barLineChartData"
        :units="{ line: 'h' }"
        stacked
        nav-enabled
        @nav="nav"
        :nav-text="navText"
        line-point
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
        <div
          v-if="loaded"
          style="width: 100%"
          class="d-flex flex-row align-content-space-between justify-space-between flex-wrap"
        >
          <sc-stat-card
            style="width: calc(100% / 3 - 8px); height: calc(50% - 8px)"
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
          style="width: 100%"
          class="d-flex flex-row align-content-space-between justify-space-between flex-wrap"
        >
          <sc-loading-card
            v-for="i in 6"
            :key="i"
            style="width: calc(100% / 3 - 8px); height: calc(50% - 8px)"
          ></sc-loading-card>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import config from "../config.js";
import { mapActions, mapGetters, mapState } from "vuex";
import { SpaceSelector } from "./components/SpaceSelector";
import { getBuildingAsync } from "./api-requests";
import moment from "moment";
import { sameDecade } from "./date-comparison";

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
      navIndex: 0,
      cardTitle: config.dashboardTitle,
    };
  },

  computed: {
    ...mapState({
      loaded: (state) => state.loaded,
      displayed: (state) => state.displayable,
    }),
    ...mapGetters({
      getBarChartData: "getBarData",
      getLineChartData: "getLineData",
      getIndicators: "getIndicators",
      getPeriode: "getPeriode",
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
    barChartData() {
      return this.getBarChartData({
        displayedIds: this.to_display.map((d) => d.dynamicId),
        period: this.period.value,
        index: this.navIndex,
      });
    },
    barLine() {
      return this.getLineChartData({
        displayedIds: this.to_display.map((d) => d.dynamicId),
        period: this.period.value,
      });
    },

    barLineChartData() {
      const line = JSON.parse(JSON.stringify(this.barLine));
      line.forEach((set) => {
        set.data = set.data.map((d) =>
          d.length
            ? Math.round(
                d.reduce((e1, e2) => e1 + e2.value, 0) / (d.length * 3600000)
              )
            : null
        );
      });
      return line;
    },

    indicators() {
      if (
        !this.to_display.reduce((e1, e2) => e2.endpoints.length || e1, false)
      ) {
        return [
          {
            value: -1,
            unit: "Tickets",
            title: "créés",
          },
          {
            value: -1,
            unit: "Tickets",
            title: "résolus",
          },
          {
            value: -1,
            unit: "%",
            title: "résolution des tickets",
          },
          {
            value: NaN,
            unit: "Heures",
            title: "Temps minimal de résolution",
          },
          {
            value: NaN,
            unit: "Heures",
            title: "Temps maximal de résolution",
          },
          {
            value: NaN,
            unit: "Heures",
            title: "Temps moyen de résolution",
          },
        ];
      }
      const indics = this.barChartData.datasets
        .filter((b) => !b.label.includes("en cours"))
        .map((b) => ({
          value: b.data.reduce((e1, e2) => e1 + e2, 0),
          unit: "Tickets",
          title: b.label.split(" ").slice(3).join(" "),
        }));
      const lineIndics = this.barLine[0];
      const timeTable = lineIndics.data
        .map((d) =>
          d.filter((ds) => ds.value || ds.value === 0).map((ds) => ds.value)
        )
        .reduce((e1, e2) => e1.concat(e2), []);
      const min = {
        value: Math.round(Math.min(...timeTable) / 3600000),
        unit: "Heures",
        title: lineIndics.label.split(" ").fill("minimal", 1, 2).join(" "),
        subtitle: "ticket résolu le plus lentement",
      };
      const max = {
        value: Math.round(Math.max(...timeTable) / 3600000),
        unit: "Heures",
        title: lineIndics.label.split(" ").fill("maximal", 1, 2).join(" "),
        subtitle: "ticket résolu le plus rapidement",
      };
      let quot = 0;
      const moy = {
        value: Math.round(
          timeTable.reduce((e1, e2) => {
            e2 = e2 || 0;
            quot++;
            return e1 + e2;
          }, 0) /
            ((quot || 1) * 3600000)
        ),
        unit: "Heures",
        title: lineIndics.label.split(" ").fill("moyen", 1, 2).join(" "),
      };
      const solvedInPeriod = lineIndics.data
        .map((d) => {
          if (this.period.value !== "decade")
            return d.filter((ds) =>
              moment()
                .add(this.navIndex, this.period.value)
                .isSame(moment(ds.date - ds.value), this.period.value)
            );
          const currentDecade = moment().add(this.navIndex * 10, "years");
          return d.filter((ds) =>
            sameDecade(moment(ds.date - ds.value), moment(currentDecade))
          );
        })
        .reduce((e1, e2) => e1.concat(e2), []);
      const created = indics.find((b) => b.title.includes("créés")).value;
      const rate = {
        value: created
          ? Math.round((solvedInPeriod.length / created) * 100)
          : 0,
        unit: "%",
        title: "résolution des tickets",
        subtitle: "tickets créés et résolus sur la période",
      };
      return indics.concat(rate, min, max, moy);
    },
    currentWorkflow() {
      return !this.workflow.length
        ? this.displayed.filter((d) => !d.workflowId)
        : this.displayed.filter((d) => this.workflow.includes(d.name));
    },
    navText() {
      return this.getPeriode({
        period: this.period.value,
        index: this.navIndex,
      });
    },
    tableData() {
      const chartData = [
        ...this.barChartData.datasets,
        ...this.barLineChartData,
      ];
      const dates = this.barChartData.labels;
      const data = this.to_display.map((d) => ({ Node: d.name, "": "" }));
      dates.forEach((date, i) => {
        data[i] = { ...data[i], Date: date };
        for (const set of chartData) {
          const unit = set.label.includes("Temps") ? " (H)" : "";
          data[i][set.label + unit] = set.data[i];
        }
      });
      return data;
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
      if (item) {
        this.navIndex = 0;
        return [];
      }
      return [
        { name: "Semaine" },
        { name: "Mois" },
        { name: "Année" },
        { name: "Décennie" },
      ];
    },

    nav(i) {
      this.navIndex += i;
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
        index: this.navIndex,
      });
    },

    async navIndex(i) {
      await this.updateProcesses({
        displayedIds: this.to_display.map((d) => d.dynamicId),
        period: this.period.value,
        index: i,
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
      if (!this.navIndex)
        await this.updateProcesses({
          displayedIds: this.to_display.map((d) => d.dynamicId),
          period: p.value,
          index: this.navIndex,
        });
      else this.navIndex = 0;
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
