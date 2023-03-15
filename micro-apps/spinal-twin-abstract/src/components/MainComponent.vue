<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
      <BarChart
        v-if="label && data"
        :title="title" 
        :labels="label" 
        :datasets="data" 
        :prev_next="true"
        @nav="nav"
        style="max-height: 450px;"
        class="BR"
        />
        <div class="d-flex cards">
          <StatCard v-for="(card, index) in cards" :key="index" :value="index" :unit="unit" :title="'selectedTempoTicketsText'" class="flex-grow-1 pa-4" style="width: 100% !important"/>
          <!-- <StatCard :value="808" :unit="unit" :title="'selectedTempoTicketsText'" class="flex-grow-1 pa-4" style="width: 100% !important"/>
          <StatCard :value="808" :unit="unit" :title="'en cours'" class="flex-grow-1 pa-4" style="width: 100% !important"/>
          <StatCard :value="8" :unit="unit"  :title="'consommés'" :subtitle="'Aujourd\'hui'"  class="flex-grow-1 pa-4" style="width: 100% !important"/> -->
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
import { ISpaceSelectorItem } from './SpaceSelector/index';
import { TemporalityModel } from '../models/Temporality.model';
import { getData } from '../services/index.js';
import moment from 'moment';

@Component({
  components: {
    BarChart,
    StatCard
  },
})
class App extends Vue {

  title = env.title;
  unit = env.unit;
  controlEndpoints = env.controlEndpoints;
  cards = env.cards;

  label = [];
  data = [];
  currentTimestamp = {valueTime: 0};

  @Prop({type: Object as () => ISpaceSelectorItem, required: true})
  space: ISpaceSelectorItem;

  @Prop({type: Object as () => TemporalityModel, required: true})
  temporality: TemporalityModel;

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
    console.log(moment(this.currentTimestamp.valueTime).format('DD/MM/YYYY'));
    this.spreadData();
  }

  interval() {
    this.currentTimestamp = {valueTime: this.currentTimestamp.valueTime = moment().valueOf()};
    this.spreadData();
  }

  async spreadData() {
    console.log(moment(this.currentTimestamp.valueTime).format('DD/MM/YYYY'));
    let res = await getData(this.space, this.temporality.name, this.currentTimestamp.valueTime, this.controlEndpoints);
    this.label = res[0];
    this.data = res[1];
  }

  mounted() {
    this.interval();
  }

  @Watch('space')
  spaceChange() {
    this.spreadData();
  }

  @Watch('temporality')
  temporalityChange() {
    this.interval();
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