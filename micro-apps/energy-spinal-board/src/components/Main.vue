<template>
  <div class="RC" style="min-height: 480px">
    <sc-download-button style="position: absolute; top: 14px;left: 46%;" :file-name="'Occupation'"
      :data="combineData()"></sc-download-button>
    <BarCard  @stack="updateValue" v-if="!showBarCard" style="width: 100%;height: 100%;" :title="config.config.titleDash1"
      :labels="barLabels" :line-datasets="barLineDatas" :step="null" :datasets="barChartData" nav-enabled @nav="nav"
      :nav-text="modifierString()" :units="units" stacked></BarCard>
    <BubbleCard :unitsy="config.config.cp2_batiment.units" :unitsx="config.config.cp1_batiment.units" @stack="updateValue" :bubbleColor="config.config.bubbleColor" :toggle="showBarCard"
      :nav-text="modifierString()" @nav="nav" v-if="showBarCard" nav-enabled style="width: 100%;height: 100%;"
      :data1="barLineDatas" :data2="barChartData" :title="config.config.titleDash2" />
  </div>
</template>

<script>
import Vue from 'vue';
import { getData } from "../services/index.js";
import { getDataBuilding } from "../services/index.js";
import LineCard from "./nested/LineCard.vue";
import BubbleCard from "./nested/BubbleCard.vue";
import BarCard from "./nested/BarCard.vue";
import LoadingCard from "spinal-components/src/components/LoadingCard.vue";
import moment from 'moment';
import config from "../config.js"
export default {
  name: 'PatrimonyWaterDashboard',
  props: ['temporality'],
  components: {
    BubbleCard,
    BarCard,
    LineCard,
    LoadingCard
  },
  data: () => ({
    config: config,
    showBarCard: false,
    lineChartData: [],
    barLabels: [],
    barChartData: [],
    barLineDatas: [],
    currentTimestamp: { stringTime: '', valueTime: 0 },
    units : {
      bar: config.config.cp1_batiment.units,
      line : config.config.cp1_batiment.units
    }
  }),

  async mounted() {
    moment.locale("fr");
    if (this.temporality.name == 'Mois') {
      this.currentTimestamp = { stringTime: 'EN ' + moment().format('MMMM YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
    }
    else if (this.temporality.name == 'Année') {
      this.currentTimestamp = { stringTime: 'EN ' + moment().format('YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
    }
    else if (this.temporality.name == 'Décennie') {
      this.currentTimestamp = { stringTime: 'EN ' + moment().format('YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
    }
    else if (this.temporality.name == '3 mois') {
      this.currentTimestamp = {
        stringTime: `EN 
          ${moment(this.currentTimestamp.valueTime).add(payload * 3, 'months').format('MMMM')}, 
          ${moment(this.currentTimestamp.valueTime).add(payload * 2, 'months').format('MMMM')}, 
          ${moment(this.currentTimestamp.valueTime).add(payload, 'months').format('MMMM')}`,
        valueTime: moment(this.currentTimestamp.valueTime).add(payload * 3, 'months').valueOf()
      };
    }
    else this.currentTimestamp = { stringTime: '', valueTime: 0 };
    const patrimoine = localStorage.getItem("patrimoine");
    let patrimoineObject = JSON.parse(patrimoine);
    this.buildingsInTheList = patrimoineObject.buildings;
    // await this.onRequest(this.currentTimestamp.valueTime, this.temporality.name, this.buildingsInTheList, 'Eau globale');
    this.loaded = true;
  },
  computed: {
    // currentPeriod() {
    //   moment.locale("fr");
    //   if (this.temporality.name == 'Mois') {
    //     this.currentTimestamp = { stringTime: 'EN ' + moment().format('MMMM YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
    //   }
    //   else if (this.temporality.name == 'Année') {
    //     this.currentTimestamp = { stringTime: 'EN ' + moment().format('YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
    //   }
    //   else if (this.temporality.name == 'Décennie') {
    //     this.currentTimestamp = { stringTime: 'EN ' + moment().format('YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
    //   }
    //   else if (this.temporality.name == '3 mois') {
    //     this.currentTimestamp = {
    //       stringTime: `EN 
    //       ${moment(this.currentTimestamp.valueTime).add(payload * 3, 'months').format('MMMM')}, 
    //       ${moment(this.currentTimestamp.valueTime).add(payload * 2, 'months').format('MMMM')}, 
    //       ${moment(this.currentTimestamp.valueTime).add(payload, 'months').format('MMMM')}`,
    //       valueTime: moment(this.currentTimestamp.valueTime).add(payload * 3, 'months').valueOf()
    //     };
    //   }
    //   else return { stringTime: '', valueTime: 0 };
    //   return this.currentTimestamp;
    // },
    tableCard() {
      let fiveCheck = (this.buildingsInTheList && this.buildingsInTheList.length >= 5) ? 5 : this.buildingsInTheList;
      return 104 + fiveCheck * 48;
    }
  },
  methods: {
    modifierString() {
      
      if (this.currentTimestamp.stringTime.startsWith('EN ')) {
        // Supprime 'En ' et retourne le reste
        return this.currentTimestamp.stringTime.substring(3);
      } else if (this.currentTimestamp.stringTime.startsWith('ENTRE ')) {
        // Supprime 'Entre ', remplace ' et ' par ' - ' et retourne
        return this.currentTimestamp.stringTime.substring(6).replace(' et ', ' - ');
      } else {
        // Si la string ne correspond à aucun des motifs, retourne la string initiale
        return this.currentTimestamp.stringTime;
      }
    },


    sortedData() {
      console.log('maybe', this.barLineDatas[0].data);
      console.log(this.barChartData);
      console.log(this.barLabels);

      return this.barLineDatas.data
    },


    combineData(labels, barLineDatas, barChartData) {
      const combinedData = [];

      for (let i = 0; i < this.barLabels.length; i++) {
        const combinedObj = {
          label: this.barLabels[i],
          Chauffage_data: this.barLineDatas[0].data[i],
          Eau_globale_data: this.barChartData[0].data[i]
        };

        combinedData.push(combinedObj);
      }

      return combinedData;
    },


    updateValue(valueFromChild) {
      // 'valueFromChild' contient la valeur du switch du composant enfant
      this.showBarCard = valueFromChild;
    },


    nav(payload) {
      if (this.temporality.name == 'Mois') {
        this.currentTimestamp = { stringTime: 'EN ' + moment(this.currentTimestamp.valueTime).add(payload, 'months').format('MMMM YYYY'), valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'months').valueOf() };
      }
      if (this.temporality.name == 'Année') {
        this.currentTimestamp = { stringTime: 'EN ' + moment(this.currentTimestamp.valueTime).add(payload, 'years').format('YYYY'), valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'years').valueOf() };
      }
      if (this.temporality.name == '3 mois') {
        if (payload < 0) {
          this.currentTimestamp = {
            stringTime: `EN 
            ${moment(this.currentTimestamp.valueTime).add(-5, 'months').format('MMMM')}, 
            ${moment(this.currentTimestamp.valueTime).add(-4, 'months').format('MMMM')}, 
            ${moment(this.currentTimestamp.valueTime).add(-3, 'months').format('MMMM')}`,
            valueTime: moment(this.currentTimestamp.valueTime).add(-3, 'months').valueOf()
          };
        }
        else {
          this.currentTimestamp = {
            stringTime: `EN 
            ${moment(this.currentTimestamp.valueTime).add(1, 'months').format('MMMM')}, 
            ${moment(this.currentTimestamp.valueTime).add(2, 'months').format('MMMM')}, 
            ${moment(this.currentTimestamp.valueTime).add(3, 'months').format('MMMM')}`,
            valueTime: moment(this.currentTimestamp.valueTime).add(3, 'months').valueOf()
          };
        }
      }
    },
    stack(payload) {
      this.stackState = payload;
    },
    async onRequest() {
      let res;
      this.loaded = false;
      res = await getData(this.currentTimestamp.valueTime, this.temporality.name);
      this.barLabels = res[0];
      this.stats = res[2];
      this.tooltipinfo = res[3];
      this.patrimonyTable = res[1];
      this.barChartData = [];
      this.barLineDatas = [];
      for (let i = 0; i < res[1].length; i++) {
        this.barChartData.push(
          {
            label: res[1][i].name,
            backgroundColor: res[1][i].color,
            data: res[1][i].timeSeries,
            borderColor: res[1][i].color,
            pointRadius: 0,
            // data: this.shuffleArray(res[1][i].timeSeries),
            // fill: true
          }
        )
      }
      for (let i = 0; i < res[4].length; i++) {
        this.barLineDatas.push(
          {
            label: res[4][i].name,
            backgroundColor: res[4][i].color,
            data: res[4][i].timeSeries,
            borderColor: res[4][i].color,
            // pointRadius: 0,
            // data: this.shuffleArray(res[1][i].timeSeries),
            // fill: true
          }
        )
      }
      this.loaded = true;
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  },
  watch: {
    currentTimestamp(value) {
      this.onRequest();
    },
    temporality(value) {
      if (this.temporality.name == 'Mois') {
        this.currentTimestamp = { stringTime: 'EN ' + moment().format('MMMM YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
      }
      else if (this.temporality.name == 'Année') {
        this.currentTimestamp = { stringTime: 'EN ' + moment().format('YYYY'), valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
      }
      else if (this.temporality.name == 'Décennie') {
        this.currentTimestamp = { stringTime: `ENTRE ${moment().add(-9, 'years').format('YYYY')} et ${moment().format('YYYY')}`, valueTime: this.currentTimestamp.valueTime = moment().valueOf() };
      }
      else if (this.temporality.name == '3 mois') {
        this.currentTimestamp = {
          stringTime: `EN 
          ${moment().add(-2, 'months').format('MMMM')}, 
          ${moment().add(-1, 'months').format('MMMM')}, 
          ${moment().add(0, 'months').format('MMMM')}`,
          valueTime: moment().valueOf()
        };
      }
      else this.currentTimestamp = { stringTime: '', valueTime: moment().valueOf() };
    }
  }
}
</script>

<style scoped>
/* root container */

.RC {
  font-family: Charlevoix;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 80px 10px 10px;
  gap: 10px;
  height: 100vh;
  width: 100%;
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%);
}

/* main container */
.MC {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  /* background: #F9F9F9; */
  /* border: 1px solid #F7F7F7; */
  /* box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16); */
  border-radius: 10px;
  width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  overflow-y: hidden;
}

.BR {
  /* height: 100%; */
  flex-grow: 1;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.cards {
  gap: 10px;
  width: 100%;
}

.v-application .ma-2 {
  margin: 0 !important;
}

.v-application .elevation-5 {
  box-shadow: 0px 3px 10px #49545C29 !important;
}

::v-deep .card-title {
  height: 0 !important;
}

::v-deep .v-sheet.v-card:not(.v-sheet--outlined) {
  background-color: #14202c;
}
</style>
