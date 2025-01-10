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
        :datasets="displayScatter ? [] : barChartData.datasets"
        :second-datasets="displayScatter ? scatterData : barLineChartData"
        :units="{ right: lineUnit }"
        stacked
        nav-enabled
        @nav="nav"
        :nav-text="navText"
        switch-enabled
        :switch-value.sync="displayScatter"
        switch-false-icon="mdi-chart-bar"
        switch-true-icon="mdi-chart-scatter-plot"
        line-point
        :tooltip-callbacks="{
          title: titleCallback,
          afterTitle: subtitleCallback,
          label: label,
          afterLabel: afterLabel,
        }"
        :right-ticks="rightTicks"
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
      timeoutId: 0,
      workflow: [],
      process: [],
      period: { name: "SEMAINE", value: "week" },
      openSpaceSelector: false,
      openTimeSelector: false,
      el: { name: "Bâtiment" },
      navIndex: 0,
      displayScatter: false,
      lineUnit: "h",
      cardTitle: config.dashboardTitle,
      titleCallback: () => {
        return;
      },
      subtitleCallback: () => {
        return;
      },
      label: (tooltipItem) => {
        if (tooltipItem.dataset.type === "line") {
          const d = moment.duration(tooltipItem.raw.y || tooltipItem.raw);
          return `${tooltipItem.dataset.label}: ${Math.floor(
            d.asDays()
          )}j ${d.hours()}h ${d.minutes()}min`;
        }
      },
      afterLabel: (tooltipItem) => {
        return tooltipItem.raw.c || "";
      },
      rightTicks: {
        callback: (val, i, tab) => {
          if ([tab.length - 1, Math.round((tab.length - 1) / 2)].includes(i)) {
            const dur = moment.duration(val);
            const [d, h, m] = [
              Math.floor(dur.asDays()),
              dur.hours(),
              dur.minutes(),
            ];
            if (d) return `${d}j ${h ? h + "h" : ""}`;
            if (h) return `${h}h ${h == 1 ? m + "min" : ""}`;
            return `${m}min`;
          }
          return "";
        },
      },
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
        set.label = "Temps moyen de résolution";
        set.pointBackgroundColor = set.backgroundColor;
        set.data = set.data.map((d) =>
          d.length
            ? Math.round(d.reduce((e1, e2) => e1 + e2.value, 0) / d.length)
            : null
        );
      });
      return line;
    },

    scatterData() {
      const scatter = JSON.parse(JSON.stringify(this.barLine));
      scatter.forEach((set) => {
        set.borderWidth = 0;
        set.pointBackgroundColor = set.backgroundColor;
        set.data = set.data
          .map((data, i) =>
            data.map((d) => ({
              x: this.barChartData.labels[i],
              y: d.value,
              c: moment(d.date - d.value).format(
                "[Créé le: ]DD/MM/YYYY[ à ]HH[h]mm"
              ),
            }))
          )
          .reduce((e1, e2) => [...e1, ...e2], []);
      });
      return scatter;
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
      const lineIndics = { ...this.barLine[0] };
      const timeTable = lineIndics.data
        .map((d) =>
          d.filter((ds) => ds.value || ds.value === 0).map((ds) => ds.value)
        )
        .reduce((e1, e2) => e1.concat(e2), []);
      let val = moment.duration(Math.min(...timeTable));
      let j = Math.round(val.asDays());
      const min = {
        value: j || Math.round(val.asHours()),
        unit: j ? "Jours" : "Heures",
        title: lineIndics.label.split(" ").fill("minimal", 1, 2).join(" "),
        subtitle: "ticket résolu le plus rapidement",
      };
      val = moment.duration(Math.max(...timeTable));
      j = Math.round(val.asDays());
      const max = {
        value: j || Math.round(val.asHours()),
        unit: j ? "Jours" : "Heures",
        title: lineIndics.label.split(" ").fill("maximal", 1, 2).join(" "),
        subtitle: "ticket résolu le plus lentement",
      };
      let quot = 0;
      val = moment.duration(
        Math.round(
          timeTable.reduce((e1, e2) => {
            e2 = e2 || 0;
            quot++;
            return e1 + e2;
          }, 0) / (quot || 1)
        )
      );
      j = Math.round(val.asDays());
      const moy = {
        value: j || Math.round(val.asHours()),
        unit: j ? "Jours" : "Heures",
        title: lineIndics.label.split(" ").fill("moyen", 1, 2).join(" "),
      };
      const solvedInPeriod = lineIndics.data
        .reduce((e1, e2) => [...e1, ...e2], [])
        .filter((d, i) => {
          if (this.period.value !== "decade")
            return moment()
              .add(this.navIndex, this.period.value)
              .isSame(moment(d.date - d.value), this.period.value);
          const currentDecade = moment().add(this.navIndex * 10, "years");
          return sameDecade(moment(d.date - d.value), moment(currentDecade));
        });
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
          const unit = set.label.includes("Temps")
            ? ` (${this.lineUnit.toUpperCase()})`
            : "";
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

    setTitleCallback() {
      if (this.period.value === "month") {
        const part2 = moment(this.navText, "MMMM YYYY").format("MM/YY");
        this.titleCallback = (context) => {
          return context[0].label + "/" + part2;
        };
      } else if (this.period.value === "year") {
        const part2 = this.navText;
        this.titleCallback = (context) => {
          return context[0].label + " " + part2;
        };
      } else {
        this.titleCallback = () => {
          return;
        };
      }
    },

    setSubtitleCallback() {
      if (this.period.value === "week") {
        const date = moment(this.navText.split(" - ")[0], "DD MMMM");
        this.subtitleCallback = (context) => {
          const day = moment.weekdays().indexOf(context[0].label);
          return moment(date).add(day, "days").format("DD/MM");
        };
      } else
        this.subtitleCallback = () => {
          return;
        };
    },
  },

  async mounted() {
    const { name } = await getBuildingAsync();
    this.el.name = name;
    await this.initWorkflows();
    this.setSubtitleCallback();
  },

  watch: {
    async to_display(v) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(
        async () =>
          await this.updateProcesses({
            displayedIds: v.map((d) => d.dynamicId),
            period: this.period.value,
            index: this.navIndex,
          }),
        1000
      );
    },

    async navIndex(i) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(async () => {
        await this.updateProcesses({
          displayedIds: this.to_display.map((d) => d.dynamicId),
          period: this.period.value,
          index: i,
        });
        this.setTitleCallback();
        this.setSubtitleCallback();
      }, 1000);
    },

    async period(p) {
      clearTimeout(this.timeoutId);
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
      if (!this.navIndex) {
        this.timeoutId = setTimeout(async () => {
          await this.updateProcesses({
            displayedIds: this.to_display.map((d) => d.dynamicId),
            period: p.value,
            index: this.navIndex,
          });
          this.setTitleCallback();
          this.setSubtitleCallback();
        }, 1000);
      } else this.navIndex = 0;
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
