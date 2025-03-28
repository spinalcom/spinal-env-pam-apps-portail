<template>
  <v-card
    style="min-height: 500px !important; background: #f9f9f9; border-radius: 1px;"
    class="bar-card  d-flex flex-shrink-1 flex-column"
    elevation="5"
    outlined
  >
    <v-card-title class="card-title flex-shrink-1 justify-space-between" style="height: fit-content !important; padding: 0 !important">
      <p class="mb-0" style="padding: 10px;">
        {{ title }}
        <br>
        <span class="desc">{{subtitle}}</span>
      </p>
      <div v-if="prev_next" style="height: 40px; align-self: flex-start; padding-top: 10px; padding-right: 10px;">
        <v-btn :disabled="false" @click="$emit('nav', -1)" style="font-size: 14px !important; border-radius: 10px;  min-width: 36px !important; box-shadow: none; border: 1px solid #EAEEF0 !important;"><v-icon style="color: #14202c !important" icon>mdi-chevron-left</v-icon>{{ prev }}</v-btn>
        <v-btn :disabled="false" @click="$emit('nav', +1)" style="font-size: 14px !important; border-radius: 10px;  min-width: 36px !important; box-shadow: none; border: 1px solid #EAEEF0 !important;">{{ next }}<v-icon style="color: #14202c !important" icon>mdi-chevron-right</v-icon></v-btn>
      </div>
    </v-card-title>
    <!--  Intégration du TimeFilter -->
       <div class="time-filter-container">
      <TimeFilter @time-change="handleTimeChange" />
    </div> 
    <div class="d-flex flex-column flex-grow-1">
      <slot name="extras" v-if="switchValue && isYear"></slot>
      <div class="flex-grow-1" style="height: 0;" v-if="switchValue && isYear">
      </div>
      <div class="flex-grow-1" style="height: 0;" v-else>
       <Bar v-if="load" :data="barChartData" :chart-id="'1'" :options="barChartOptions" ref="barChart"/>
      </div>
       <div class="occupancy-bar" v-if="occupancyRate > 0">
        <p>Taux d'occupation: {{ occupancyRate }}%</p>
        <div class="occupancy-bar-inner" :style="{ width: occupancyRate + '%' }"></div>
      </div>
    </div>
  </v-card>
</template>

<script>
import { Bar } from "vue-chartjs";
import TimeFilter from './TimeFilter.vue';
import {
  customBackgroundPlugin,
  customLegendPlugin,
} from "../plugins/canvasPlugins";
import {
  Legend,
  Tooltip,
  BarElement,
  LinearScale,
  CategoryScale,
  LogarithmicScale,
  Chart as ChartJS,
} from "chart.js";

ChartJS.register(
  Legend,
  Tooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  customBackgroundPlugin,
  customLegendPlugin
);

export default {
  name: "bar-card",
  props: {
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    prev_next: {type: Boolean, required: false},
    next: {type: String, required: false},
    prev: {type: String, required: false},
    labels: {
      type: Array,
      required: true,
    },

    datasets: {
      type: Array,
      required: true,
    },

    scaleType: {
      type: String,
      default: "linear",
    },
    stacked: {
      type: Boolean,
      default: false,
    },
    noNav: {
      type: Boolean,
      required: false,
    },
    isYear: {
      type: Boolean,
      required: false,
    },
    optional: {
      type: Object,
      default: () => {return {unit: '', footer: 'Total'}},
      required: false
    },
    occupancyRate: {
      type: Number,
      required: false,
      default: 0,
    },
  },

   data: () => ({
    load: true,
    isD: false,
    switchValue: false,
  }), 
  /* data() {
  return {
    switchValue: this.stacked,
     startTime: '00:00',
    endTime: '23:59', 
  }
}, */
  components: {
    Bar,
    TimeFilter,
  },

  computed: {
    barChartData() {
      return {
        labels: this.labels,
        datasets: this.datasets.map(dataset => ({
          ...dataset,
          barThickness: 15, 
        })),
      };
    },

    barChartOptions() {
  return {
    maintainAspectRatio: false,
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
        stacked: false,
        ticks: {
          font: {
            family: "Charlevoix Pro",
            size: 11,
            letterSpacing: 1.1,
          },
        },
        grid: {
          color: "#f9f9f9",
          lineWidth: 2,
        },
        min: 0,
        max: 100,
      },
      x: {
        stacked: false,
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Charlevoix Pro",
            size: 11,
            letterSpacing: 1.1,
          },
          color: "#000000DE",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        align: "start",
        labels: {
          color: "#000000DE",
          font: {
            family: "Charlevoix Pro",
            size: 14,
            letterSpacing: 1.1,
          },
          useBorderRadius: true,
          borderRadius: 5,
          boxWidth: 10,
          boxHeight: 25,
        },
      },
      datalabels: { display: false },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
      callbacks: {
        title: (tooltipItems) => {
          const item = tooltipItems[0];
          if (item && item.dataset && item.dataset.tooltipDate) {
            return item.dataset.tooltipDate[item.parsed.x] || 'Data not available';
          }
          return 'Data not available';
        },
      },
    },
  };
}
  },

  created() {
  if (this.datasets && Array.isArray(this.datasets)) {
    const borderRadius = { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 };
    this.datasets.forEach((set) => {
      set.borderSkipped = false;
      set.borderRadius = borderRadius;
      set.borderWidth = 1;
      set.borderColor = "rgba(0,0,0,0)";
    });
  } else {
    console.warn("datasets is not defined or is not an array");
  }
  },

  
  methods: {
    handleTimeChange({ startTime, endTime }) {
      this.$emit('time-change', { startTime, endTime });
    },
  },
  
  mounted() {

  },

  watch: {
     datasets(v) {
      const radius = 25;
      const borderRadius = {
        topLeft: radius,
        topRight: radius,
        bottomLeft: radius,
        bottomRight: radius,
      };
      this.datasets.forEach((set) => {
        set.borderSkipped = false;
        set.borderRadius = borderRadius;
        set.borderWidth = 1;
        set.borderColor = "rgba(0,0,0,0)";
      });
    },
  },
};
</script>
<style>

.desc {
  margin-left: 23px;
  font-family: "Charlevoix Pro";
  font-size: 16px !important;
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
  letter-spacing: 1.1px !important;
  color: #051604de !important;
  font-size: 20px !important;
}
.occupancy-bar {
  margin: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.occupancy-bar-inner {
  height: 20px;
  background-color: #A7001E;
  transition: width 0.3s ease-in-out;
}

.plus-button {
  background: #be1010 !important;
  position: absolute;
  top: 90px;
  left: 50px;
  font-size: 14px !important;
  border-radius: 10px;
  min-width: 36px !important;
  box-shadow: none;
  border: 1px solid #EAEEF0 !important;
  width: 48px !important;
  height: 36px !important;
}

::v-deep .theme--light.v-input--switch .v-input--switch__thumb, .theme--light.v-input--switch .v-input--switch__track {
color: #607d8b !important;
}

@font-face{font-family:'Charlevoix Pro';src:url('../assets/font/CharlevoixPro-Regular.woff2') format('woff2'),url('../assets/font/CharlevoixPro-Regular.woff') format('woff'),url('../assets/font/CharlevoixPro-Regular.ttf') format('truetype');font-weight:normal;font-style:normal}
/* Ajustements pour le TimeFilter intégré */
/* ::v-deep .time-filter-card {
  box-shadow: none;
  margin-bottom: 0;
  background: transparent;
}

::v-deep .time-chip {
  font-size: 12px;
}

::v-deep .custom-time-pickers {
  margin-top: 8px;
}

::v-deep .time-picker {
  max-width: 200px;
} */
</style>