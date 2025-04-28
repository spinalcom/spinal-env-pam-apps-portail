<template>
  <v-card
    style="min-height: 500px !important; background: #f9f9f9; border-radius: 10px;"
    class="bar-card  d-flex flex-shrink-1 flex-column"
    elevation="5"
    outlined
  >
    <v-card-title class="card-title d-flex align-items-center" style="height: fit-content !important; padding: 0 !important; justify-content: space-between;">
    <!-- Section gauche : Titre et bouton du filtre -->
    <div class="d-flex align-items-center" style="gap: 10px;">
      <p class="mb-0" style="padding: 10px;">
        {{ title }}
        <br>
        <span class="desc">{{ subtitle }}</span>
      </p>
      <TemporalFilter @time-change="handleTimeChange" />
    </div>
  
    <!-- Section droite : Boutons de navigation -->
    <div v-if="next && prev" style="height: 40px; align-self: flex-start; padding-top: 10px; padding-right: 10px;">
      <v-btn @click="$emit('nav', -1)" style="font-size: 14px !important; border-radius: 10px; min-width: 36px !important; box-shadow: none;">
        <v-icon style="color: #14202c !important" icon>mdi-chevron-left</v-icon> {{ prev }}
      </v-btn>
            <v-menu v-model="menu" :close-on-content-click="false" offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-chip
            v-bind="attrs"
            v-on="on"
            color="blue darken-3"
            outlined
            style="cursor: pointer;"
          >
            {{ selectedDate }}
          </v-chip>
        </template>
        <v-date-picker
          v-model="selectedDate"
          :type="datePickerType" 
          @input="onDateChange"
          color="blue darken-3"
          :error-messages="selectedDate ? '' : 'Date invalide'"
        ></v-date-picker>
      </v-menu>
      <v-btn @click="$emit('nav', +1)" style="font-size: 14px !important; border-radius: 10px; min-width: 36px !important; box-shadow: none;">
        {{ next }}<v-icon style="color: #14202c !important" icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </v-card-title>
    <!--  Intégration du TemporalFilter -->
       
      <div class="d-flex flex-column flex-grow-1 flex-shrink-1" style="height:0">
          <LineChart
            :data="lineChartData"
            :chart-id="'99'"
            :options="lineChartOptions"
            class="bar-height"
            />
      </div>
  </v-card>
</template>

<script>
import { Line as LineChart } from "vue-chartjs";
import TemporalFilter from './TemporalFilter.vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement, Filler } from 'chart.js';
ChartJS.register( Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement, Filler );
export default {
  name: "line-card",
  props: {
    title: {
      type: String,
      default: "Line Card",
    },
    subtitle: {
      type: String,
    },
    currentDate: {  
      type: String,
      required: false,
    },
    temporality: {
      type: String,
      required: true,
    },
    switchval: {
      type: Boolean,
      default: false
    },
    titleDetails: {type: String, required: false},
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
    optional: {
      type: Object,
      default: () => {return {unit: '', footer: 'Total'}},
      required: false
    },
  },
  components: {
    LineChart,
    TemporalFilter 
  },
  computed: {
    lineChartData() {
      let tempDatasets = this.datasets;
      for (let i = 0; i < this.datasets.length; i++) {
        tempDatasets[i]['fill'] = false;
        tempDatasets[i]['borderColor'] = this.datasets[i].backgroundColor;
        tempDatasets[i]['tooltipDate'] = this.datasets[i].tooltipDate || []; 
      }
      return {
        labels: this.labels,
        datasets: tempDatasets,
      };
    },
    datePickerType() {
    // Détermine le type de sélection en fonction de la temporalité
    if (this.temporality === 'Journée') return 'date';
    if (this.temporality === 'Mois' || this.temporality === 'Trimestre') return 'month'; // Permet de choisir les mois
    if (this.temporality === 'Année'|| this.temporality === 'Décennie') return 'year';
    return 'date'; // Par défaut
  },
    lineChartOptions() {
      return {
        maintainAspectRatio: false,
        borderWidth: 2,
        tension: 0.2,
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
        elements: {
          point: {
            pointStyle: 'false',
            radius: 1,
            hoverRadius: 3,
          },
        },
        scales: {
          y: {
            stacked: this.switchValue,
            border: {
              display: false,
            },
            type: this.scaleType,
            min: 0,
            max: 100,
            grid: {
              color: "#f0f0f0",
            },
          },
          x: {
            stacked: this.stacked,
            border: {
              display: false,
            },
            grid: {
              color: "#f0f0f0",
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
                size: 14,
              },
              useBorderRadius: true,
              borderRadius: 5,
              boxWidth: 10,
              boxHeight: 25
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
          callbacks: {
            title: (data) => {
              return data[0].dataset.tooltipDate[data[0].parsed.x];
            },
            label: (tooltipItem, data) => {
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw} ${this.optional.unit}`;
            },
          }
        },
      };
    }
  },
  created() {
    const radius = 9;
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
    });
  },
  data() {
  return {
     menu: false,
    selectedDate: this.currentDate, 
    selectedWeek: null, 
/*     switchValue: this.stacked,
 */    /* startTime: '00:00',
    endTime: '23:59', */
  }
},
  methods: {
    handleTimeChange({ startTime, endTime }) {
      this.$emit('time-change', { startTime, endTime });
    },
    onDateChange(newDate) {
      // Comportement par défaut pour les autres temporalités
      this.menu = false;
      this.selectedDate = newDate;
      this.$emit('date-change', newDate);
    
  },
  },
};
</script>

<style scoped>
.fixed-height-card {
  min-height: 500px !important;
  max-height: 500px !important;
}
/* .desc {
  margin-left: 23px;
  font-family: "Charlevoix Pro";
  font-size: 16px !important;
} */
.v-application {
  font-family: "Charlevoix Pro";
}

.bar-card {
  background-color: #f9f9f9;
  font-family: "Charlevoix Pro";
  font-size: 14px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  letter-spacing: 1.1px !important;
  color: #081102de !important;
  font-size: 20px !important;
}
.line-card {
  font-family: "Charlevoix Pro";
  background-color: #f9f9f9;
}

.card-title {
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
  font-size: 20px !important;
}
.bar-height {
height: 100%;
}
::v-deep .theme--light.v-input--switch .v-input--switch__thumb, .theme--light.v-input--switch .v-input--switch__track {
color: #607d8b !important;
}
/* Ajustements pour le TemporalFilter intégré */
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