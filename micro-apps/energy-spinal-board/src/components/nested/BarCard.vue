<template>
  <v-card style="min-height: 220px !important" class="bar-card pa-1 rounded-lg d-flex flex-column" outlined>
    <v-card-title style="font-size: 20px; height: 56px" class="card-title pa-3 text-uppercase justify-space-between">
      <p>{{ title }}</p>
      <div class="d-flex align-center mln6"
        style="position: absolute; right: calc(50% - 55px);transform: translate(0,20px);">
        <v-icon icon class="pr-3" size="default">mdi-chart-bar</v-icon>
        <v-switch @click="$emit('stack', switchValue)" style="margin-top: 1px; padding: 0px;height: 24px;"
          v-model="switchValue" inset color="blue-grey" dense />
        <v-icon icon size="default">mdi-chart-scatter-plot</v-icon>
      </div>
      <div v-if="navEnabled" style="height: 40px">
        <v-btn @click="$emit('nav', -1)" style="
            font-size: 14px !important;
            border-radius: 10px;
            min-width: 36px !important;
            box-shadow: none;
          ">
          <v-icon icon>mdi-chevron-left</v-icon>
        </v-btn>
        {{ navText }}
        <v-btn @click="$emit('nav', +1)" style="
            font-size: 14px !important;
            border-radius: 10px;
            min-width: 36px !important;
            box-shadow: none;
          ">
          <v-icon icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    <div style="height: calc(100% - 56px)" class="d-flex flex-column">
      <slot name="extras" class="flex-shrink-1"></slot>
      <div id="bar-legend-container" class="d-flex flex-row justify-space-between"
        style="height: 81px ; transform: translate(0, 60%);"></div>
      <div style="height: calc(100% - 21px)">
        <Bar :data="barChartData" :chart-id="'1'" :options="barChartOptions" />
      </div>
    </div>
  </v-card>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  customBackgroundPlugin,
  customLegendPlugin,
} from "../../plugins/canvasPlugins";
import {
  Legend,
  BarElement,
  LinearScale,
  CategoryScale,
  LogarithmicScale,
  Chart as ChartJS,
} from "chart.js";
import {
  defaultColor,
  gradiant,
  RGBtoHexa,
  HSVtoRGB,
  hexaToRGB,
} from "../colors";

ChartJS.register(
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  customBackgroundPlugin,
  customLegendPlugin
);

export default {
  name: "bar-card",
  data() {
    return {
      switchValue: false,
    };
  },
  props: {
    title: {
      type: String,
      default: "Bar Card",
    },

    navEnabled: {
      type: Boolean,
      default: false,
    },

    navText: {
      type: String,
      default: "",
    },

    step: {
      type: Number,
      default: 1,
    },

    labels: {
      type: Array,
      required: true,
    },

    datasets: {
      type: Array,
      required: true,
    },

    lineDatasets: {
      type: Array,
      default: () => [],
    },

    scaleType: {
      type: String,
      default: "linear",
    },

    stacked: {
      type: Boolean,
      default: false,
    },

    units: {
      type: Object,
      required: false,
    },

    linePoint: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    Bar,
  },

  computed: {
    barChartData() {
      return {
        labels: this.labels,
        datasets: this.datasets.concat(this.lineDatasets),
      };
    },

    barChartOptions() {
      return {
        id: "bar-chart-id",
        labelStep: this.step,
        spanGaps: true,
        maintainAspectRatio: false,
        barThickness: 20,
        transitions: {
          show: {
            animations: {
              y: {
                from: 1000,
              },
            },
          },
          hide: {
            animations: {
              y: {
                to: 1000,
              },
            },
          },
        },
        scales: {
          y: {
            border: {
              display: false,
            },
            type: this.scaleType,
            stacked: this.stacked,
            ticks: {
              callback: (val, i, tab) => {
                return [
                  tab.length - 1,
                  Math.round((tab.length - 1) / 2),
                ].includes(i)
                  ? `${val}${this.units?.bar || ""}`
                  : "";
              },
              font: {
                family: "Charlevoix Pro",
                size: 11,
              },
              color: "#214353",
            },
            grid: {
              color: "#f9f9f9",
              lineWidth: 2,
            },
          },
          y2: {
            position: "right",
            border: {
              display: false,
            },
            type: this.scaleType,
            stacked: this.stacked,
            ticks: {
              display: this.lineDatasets.length,
              callback: (val, i, tab) => {
                return [
                  tab.length - 1,
                  Math.round((tab.length - 1) / 2),
                ].includes(i)
                  ? `${val}${this.units?.line || ""}`
                  : "";
              },
              font: {
                family: "Charlevoix Pro",
                size: 11,
              },
              color: "#214353",
            },
            grid: {
              display: false,
            },
          },
          x: {
            stacked: this.stacked,
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              callback: (v, i) => {
                if (!(v % this.step)) return this.labels[i];
              },
              font: {
                family: "Charlevoix Pro",
                size: 11,
              },
              color: "#214353",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            align: "start",
            labels: {
              color: "#214353",
              font: {
                family: "Charlevoix Pro",
                size: 14,
                letterSpacing: 0.7,
              },
              useBorderRadius: true,
              borderRadius: 5,
              boxWidth: 9,
              boxHeight: 21,
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "xy",
          intersect: false,
          callbacks: {
            label: (tooltipItem) => {
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw}${this.units?.[tooltipItem.dataset.type] || ""
                }`;
            },
            labelColor: (context) => {
              if (context.dataset.type === "line")
                return {
                  borderColor: "rgba(0,0,0,0)",
                  backgroundColor: context.dataset.borderColor,
                };
            },
          },
        },
      };
    },
  },

  created() {
    const radius = 4;
    const borderRadius = {
      topLeft: radius,
      topRight: radius,
      bottomLeft: radius,
      bottomRight: radius,
    };
    const colors =
      this.datasets.length + this.lineDatasets.length <= 3
        ? defaultColor(3)
        : gradiant(this.datasets.length + this.lineDatasets.length).map(
          (color) => {
            const col = HSVtoRGB(color / 100, 1, 1);
            return RGBtoHexa(col.r, col.g, col.b);
          }
        );
    this.datasets.forEach((set) => {
      if (!set.backgroundColor) set.backgroundColor = colors.shift();
      set.type = "bar";
      set.order = 2;
      set.borderSkipped = false;
      set.borderRadius = borderRadius;
      set.borderWidth = 1;
      set.borderColor = "rgba(0,0,0,0)";
    });
    this.lineDatasets.forEach((set) => {
      set.type = "line";
      set.pointStyle = this.linePoint;
      set.tension = 0.3;
      set.order = 1;
      set.yAxisID = "y2";
      set.borderColor = set.borderColor || colors.shift();
      set.pointBackgroundColor = set.borderColor;
      const { r, g, b } = hexaToRGB(set.borderColor);
      set.backgroundColor = set.backgroundColor || `rgba(${r},${g},${b},0.3)`;
    });
  },

  watch: {
    datasets() {
      const radius = 4;
      const borderRadius = {
        topLeft: radius,
        topRight: radius,
        bottomLeft: radius,
        bottomRight: radius,
      };
      const colors =
        this.datasets.length + this.lineDatasets.length <= 3
          ? defaultColor(3)
          : gradiant(this.datasets.length + this.lineDatasets.length).map(
            (color) => {
              const col = HSVtoRGB(color / 100, 1, 1);
              return RGBtoHexa(col.r, col.g, col.b);
            }
          );
      this.datasets.forEach((set) => {
        if (!set.backgroundColor) set.backgroundColor = colors.shift();
        set.type = "bar";
        set.order = 2;
        set.borderSkipped = false;
        set.borderRadius = borderRadius;
        set.borderWidth = 1;
        set.borderColor = "rgba(0,0,0,0)";
      });
      this.lineDatasets.forEach((set) => {
        set.type = "line";
        set.pointStyle = this.linePoint;
        set.tension = 0.3;
        set.order = 1;
        set.yAxisID = "y2";
        set.borderColor = set.borderColor || colors.shift();
        set.pointBackgroundColor = set.borderColor;
        const { r, g, b } = hexaToRGB(set.borderColor);
        set.backgroundColor = set.backgroundColor || `rgba(${r},${g},${b},0.3)`;
      });
    },
  },
};
</script>
<style>
html {
  overflow-y: auto !important;
}

.v-application {
  font-family: "Charlevoix Pro";
}
</style>
<style scoped>
.bar-card {
  background-color: #f9f9f9;
  font-family: "Charlevoix Pro";
  font-size: 14px;
}

.card-title {
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
  font-size: 11px/13px;
}
</style>