<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
      <BarChart
        v-if="chart.label && chart.data"
        :title="title" 
        :labels="chart.label" 
        :datasets="chart.data" 
        :prev_next="true"
        @nav="nav"
        :stacked="true"
        style="max-height: 450px;"
        class="BR"
        />
        <div class="d-flex cards">
          <!-- <StatCard v-for="(card, index) in controlEndpoints" :key="index" 
            :value="index" 
            :unit="unit" 
            :title="'selectedTempoTicketsText'" 
            class="flex-grow-1 pa-4" 
            style="width: 100% !important"
            /> -->
            <StackCard
            v-if="totalCard.length !== 0 && cards.includes('total')"
            :data="totalCard"
            class="flex-grow-1 pa-4" 
            style="width: 100% !important; height: fit-content;"
            />
            <LoadingCard class="flex-grow-1 pa-4" style="width: 100% !important; min-height: 105px;" v-else-if="cards.includes('total')"/>
            <StackCard
            v-if="averageCard.length !== 0 && cards.includes('average')"
            :data="averageCard"
            class="flex-grow-1 pa-4" 
            style="width: 100% !important; height: fit-content;"
            />
            <LoadingCard class="flex-grow-1 pa-4" style="width: 100% !important; min-height: 105px;" v-else-if="cards.includes('average')"/>
            <StackCard
            v-if="todaysCard.length !== 0 && cards.includes('today')"
            :data="todaysCard"
            class="flex-grow-1 pa-4" 
            style="width: 100% !important; height: fit-content;"
            />
            <LoadingCard class="flex-grow-1 pa-4" style="width: 100% !important; min-height: 105px !important;" v-else-if="cards.includes('today')"/>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import env from '../../config';
import BarChart from './BarCard.vue';
import StatCard from './StatsCard.vue';
import StackCard from './StackCard.vue';
import LoadingCard from './LoadingCard.vue';
import { ISpaceSelectorItem } from './SpaceSelector/index';
import { TemporalityModel } from '../models/Temporality.model';
import { getData, getTodaysData } from '../services/index.js';
import moment from 'moment';
import { computed } from 'vue';

@Component({
  components: {
    BarChart,
    StatCard,
    StackCard,
    LoadingCard
  },
})
class App extends Vue {

  title = env.title;
  unit = env.unit;
  controlEndpoints = env.controlEndpoints;
  cards = env.cards;
  chart = {
    label: [],
    data: []
  }
  currentTimestamp = {valueTime: 0};
  todaysCard = [];
  averageCard = [];
  totalCard = [];

  @Prop({type: Object as () => ISpaceSelectorItem, required: true})
  space: ISpaceSelectorItem;

  @Prop({type: Object as () => TemporalityModel, required: true})
  temporality: TemporalityModel;



  interval() {
    this.currentTimestamp = {valueTime: this.currentTimestamp.valueTime = moment().valueOf()};
    this.spreadData();
  }

  async spreadData() {
    this.averageCard = [];
    this.totalCard = [];
    let res = await getData(this.space, this.temporality.name, this.currentTimestamp.valueTime, this.controlEndpoints);
    this.chart.label = res[0];
    this.chart.data = res[1];
    // let cardRes = await getAverageAndTotalData(this.space, this.controlEndpoints, this.temporality.name, this.currentTimestamp.valueTime);
    this.averageCard = res[2];
    this.totalCard = res[3];
    // let nextBatchCard = await getAverageAndTotalData(res[2], res[3]);
    // this.averageCard = nextBatchCard[0];
    // this.totalCard = nextBatchCard[1];
  }

  async mounted() {
    this.interval();
    this.todaysCard = await getTodaysData(this.space, this.controlEndpoints);
  }

  
  get stack() {
    let u = this.controlEndpoints[0].stackGroup;
    let stack = false;
    for (let i = 1; i < this.controlEndpoints.length; i++) {
      if (u !== this.controlEndpoints[i].stackGroup) {
        stack = true;
      }
    }
    return stack;
  }

  @Watch('space')
  async spaceChange() {
    this.todaysCard = [];
    this.spreadData();
    this.todaysCard = await getTodaysData(this.space, this.controlEndpoints);
  }

  @Watch('temporality')
  async temporalityChange() {
    this.interval();
  }

  async nav(payload: number): Promise<void> {
    if (this.temporality.name == 'Semaine') {
      this.currentTimestamp = {valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'weeks').valueOf()};
    }
    if (this.temporality.name == 'Mois') {
      this.currentTimestamp = {valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'months').valueOf()};
    }
    if (this.temporality.name == 'Année') {
      this.currentTimestamp = {valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'years').valueOf()};
    }
    this.spreadData();
  }
}
export default App;
</script>

<style scoped>
.RC {
  font-family: Charlevoix;
  display: flex;
  flex-direction: row;
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
  overflow-y: auto;
}

.BR {
  /* height: 100%; */
  flex-grow: 1;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 300px;
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

::v-deep .v-label {
  font-size: 14px !important;
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
}

::v-deep .v-list-item__title {
  font-size: 14px !important;
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
}

::v-deep  .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
  color: #E3E7E8 !important;
}

::v-deep .theme--light.v-icon {
  color: #E3E7E8 !important;
}

::v-deep .v-menu__content {
  top: 188px !important;
}

::v-deep .v-list-item--link:before {
  background: #fff !important;
}
</style>