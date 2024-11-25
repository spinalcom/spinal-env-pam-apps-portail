<template>
  <v-card style="min-height: 220px !important" class="bar-card pa-1 rounded-lg d-flex flex-column" outlined>
    <v-card-title style="font-size: 20px; height: 56px ;" class="card-title pa-3 text-uppercase justify-space-between">
      <p>{{ title }}</p>

      <div v-if="isScatter" class="d-flex align-center mln6"
        style="position: absolute; right: calc(50% - 55px);transform: translate(0,20px);">
        <v-icon icon class="pr-3" size="default">mdi-chart-bar</v-icon>
        <v-switch @click="$emit('stack', switchValuedata)" style="margin-top: 1px; padding: 0px;height: 24px;"
          v-model="switchValuedata" inset color="blue-grey" dense />
        <v-icon icon size="default">mdi-chart-scatter-plot</v-icon>
      </div>


      <div v-if="this.temporality == 'Semaine'" class="d-flex align-center mln6"
        style=" right: calc(50% - 55px);transform: translate(0,20px);">
        <v-icon icon class="pr-3" size="default">mdi-chart-bar</v-icon>
        <v-switch style="margin-top: 1px; padding: 0px;height: 24px;" v-model="switchBarLine" inset color="blue-grey"
          dense />
        <v-icon icon size="default">mdi-chart-line</v-icon>
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
    <!-- <div style="width: 20%;margin-left: 11px; position: absolute;margin-top: 40px;">
      <div
        style="color: rgb(43, 43, 43); position: absolute;left: 10px; transform: translate(0,30%);z-index: 99;background-color: rgba(255, 255, 255, 0.473);border-radius: 10px;height: 16px;">
        Selection des heures
      </div>
      <v-select ref="selectedItem" v-model="selectedTimes" :items="timeIntervals" multiple>

        <template v-slot:selection="{ item, index, disabled }">
          <v-chip v-if="index < displayedSelection().length" :key="index">
            {{ displayedSelection()[index] }}
          </v-chip>
        </template>
      </v-select>
    </div> -->

    <div style="height: calc(100% - 56px) " class="d-flex flex-column">
      <slot name="extras" class="flex-shrink-1"></slot>
      <div id="bar-legend-container" class="d-flex flex-row justify-space-between"
        style="height: 81px ; transform: translate(0, 60%);"></div>
      <div style="height: calc(100% - 21px)">
        <Bar :data="barChartData" :id="switchBarLine" :chart-id="'1'" :options="barChartOptions" />
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
  customLegendPlugin,
);

export default {
  name: "bar-card",
  data() {
    return {
      switchValuedata: this.switchValue,
      timeIntervals: ['00h00-01h00', '01h00-02h00', '02h00-03h00', '03h00-04h00', '04h00-05h00', '05h00-06h00', '06h00-07h00', '07h00-08h00', '08h00-09h00', '09h00-10h00', '10h00-11h00', '11h00-12h00', '12h00-13h00', '13h00-14h00', '14h00-15h00', '15h00-16h00', '16h00-17h00', , '17h00-18h00', '18h00-19h00', '19h00-20h00', , '20h00-21h00', '21h00-22h00', '22h00-23h00', '23h00-00h00'],
      selectedTimes: [],
      chartType1: "bar",
      chartType2: "line",
      isScatter: false,
      switchBarLine: false
    };
  },
  props: {
    title: {
      type: String,
      default: "Bar Card",
    },
    switchValue: {
      type: Boolean,
      default: false
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
    temporality: {
      type: String,
      default: "Semaine",
    },
    linePoint: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    Bar,
  },

  methods: {
    editChartType() {
      if (this.temporality == 'Jour') {
        this.isScatter = false;
        this.chartType1 = "line"
      } else if (this.temporality == 'Semaine') {
        this.isScatter = false;
        this.chartType1 = "bar"
      } else if (this.temporality == 'Mois') {
        this.isScatter = true;
        this.chartType1 = "bar"
      } else if (this.temporality == '3 mois') {
        console.log("3 mois");
        this.isScatter = true;
        this.chartType1 = "line"
        console.log(this.chartType1);
      } else if (this.switchBarLine = true) {
        this.chartType1 = "bar"
        this.chartType2 = "bar"
      }
      else if (this.switchBarLine = false) {
        this.chartType1 = "line"
        this.chartType2 = "line"
      }
      else {
        this.isScatter = true;
        this.chartType1 = "bar"
      }

    },

    displayedSelection() {
      if (this.selectedTimes.length === 0) {
        return [];
      }

      let sortedTimes = [...this.selectedTimes].sort();
      let newDisplay = [];

      for (let i = 0; i < sortedTimes.length; i++) {
        let current = sortedTimes[i];
        let start = current.split('-')[0];
        let end = current.split('-')[1];

        // Tant que nous pouvons trouver un intervalle contigu, nous continuons à chercher.
        while (i + 1 < sortedTimes.length && end === sortedTimes[i + 1].split('-')[0]) {
          end = sortedTimes[i + 1].split('-')[1]; // mise à jour de la fin de l'intervalle
          i++; // passez à l'entrée suivante
        }

        newDisplay.push(`${start}-${end}`);
      }

      return newDisplay;
    }

  },
  mounted() {
    this.editChartType();
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
    // this.editChartType();

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
      console.log('ici les props2');

      console.log(this.chartType1);
      if (!set.backgroundColor) set.backgroundColor = colors.shift();
      if (this.temporality == '3 mois') {
        this.isScatter = true;
        this.chartType1 = "line"
      }
      set.type = this.chartType1;
      set.order = 2;
      set.borderSkipped = false;
      set.borderRadius = borderRadius;
      set.borderWidth = 1;
      set.borderColor = set.borderColor || colors.shift();
    });
    this.lineDatasets.forEach((set) => {
      set.type = this.chartType2;
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
    temporality(newValue, oldValue) {
      this.editChartType();
    },
    selectedTimes: {
      deep: true,
      handler(newValue) {
        this.$emit('update:selectedTimes', newValue);
      }
    },
    switchBarLine(newValue, oldValue){
      console.log(newValue);
      this.editChartType();
    }
    ,
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
        console.log('ici les props');
        if (!set.backgroundColor) set.backgroundColor = colors.shift();
        set.type = this.chartType1;
        set.order = 2;
        set.borderSkipped = false;
        set.borderRadius = borderRadius;
        set.borderWidth = 1;
        set.borderColor = set.borderColor || colors.shift();
      });
      this.lineDatasets.forEach((set) => {
        set.type = this.chartType2;
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


::v-deep .v-select__slot {
  height: 40px;
  min-width: 300px;
  background-color: rgb(231, 231, 231);
  border-radius: 3px;
  border: 1px solid rgb(216, 216, 216);
  color: green !important;
}

::v-deep .theme--light.v-text-field>.v-input__control>.v-input__slot:before {
  display: none;
}

::v-deep .v-application--is-ltr .v-text-field .v-label {
  color: green !important;
}
</style>