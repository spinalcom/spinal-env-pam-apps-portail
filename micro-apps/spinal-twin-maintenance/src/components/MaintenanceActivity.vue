<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
        <BarChart v-if="load" :noNav="periodTickets === -1" :title="'Activité des tickets en cours'" :labels="barData.labels" :datasets="barData.data" :prev_next="true" @nav="nav" stacked class="BR">
            <template v-slot:extras>
            <v-select v-model="domain" append-icon="mdi-chevron-down" :items="domainList" outlined menu-props="{ bottom: true }" color="#E3E7E8" item-color="#E3E7E8" dense style="min-width: 200px; width: 340px; flex-grow: 0; font-size: 14px !important;" class="ml-8" label="Domaine">
              <template #label="{ attrs }">
                <label :for="attrs.id" style="font-size: 14px;">Select an item</label>
              </template>
            </v-select>
            </template>
        </BarChart>
        <LoadingCard v-else class="flex-grow-1 pa-4 br" style="width: 100%;"/>
        <div class="d-flex cards">
          <StatCard  v-if="periodTickets !== -1" :value="periodTickets" :unit="'Tickets'" :title="cardsData.selectedTempoTicketsText" class="flex-grow-1 pa-4" style="width: 100% !important"/>
          <LoadingCard v-else class="flex-grow-1 pa-4"  style="height: 106px; width: 100% !important"/>
          <StatCard v-if="load" :value="cardsData.onGoingTickets" :unit="'Tickets'" :title="'en cours'" class="flex-grow-1 pa-4" style="width: 100% !important"/>
          <LoadingCard v-else class="flex-grow-1 pa-4"  style="height: 106px; width: 100% !important"/>
          <StatCard v-if="todaysTickets !== -1" :value="todaysTickets" :unit="'Tickets'"  :title="'crées'" :subtitle="'Aujourd\'hui'"  class="flex-grow-1 pa-4" style="width: 100% !important"/>
          <LoadingCard v-else class="flex-grow-1 pa-4"  style="height: 106px; width: 100% !important"/>

        </div>
        <div v-if="load"
          style="height: 280px; gap: 10px; width: 100%"
          class="d-flex flex-row"
        >
          <PieCard
            style="width: 100%;"
            class="flex-grow-1"
            :title="'Tickets par domaine'"
            :pie-chart-data="domainPie"
            :color="['#14202C','#1F3348','#2F4F70','#47719B','#6593C0','#80A9D2','#ACCAE8']"
            />
          <PieCard
            style="width: 100%;"
            class="flex-grow-1"
            :title="'Tickets par déclarant'"
            :pie-chart-data="declarerPie"
            :color="['#300530','#5B145B','#8F3A8F','#BA6DBA','#CA8CCA','#DBA8DB','#E2C8E7']"/>
        </div>
        <div v-else style="height: 280px; width: 100%; gap: 10px" class="d-flex">
          <LoadingCard class="flex-grow-1 pa-4" style="height: 100%;"/>
          <LoadingCard class="flex-grow-1 pa-4" style="height: 100%;"/>
        </div>
    </div>
    <!-- <div class="MC" v-else>
      <LoadingCard class="flex-grow-1 pa-4 br" style="width: 100%;"/>
      <div class="d-flex cards">
          <LoadingCard class="flex-grow-1 pa-4"  style="height: 106px"/><LoadingCard class="flex-grow-1 pa-4"  style="height: 106px"/><LoadingCard class="flex-grow-1 pa-4"  style="height: 106px"/>
      </div>
      <div style="height: 280px; width: 100%; gap: 10px" class="d-flex">
        <LoadingCard class="flex-grow-1 pa-4" style="height: 100%;"/>
        <LoadingCard class="flex-grow-1 pa-4" style="height: 100%;"/>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import BarChart from "./BarCard.vue";
import StatCard from "./StatsCard.vue";
import PieCard from "./PieCard.vue";
import LoadingCard from "./LoadingCard.vue";
import { getData, curveData, ticketsCreatedtoday, ticketsCreated } from "../services/index.js";
import moment from 'moment';
import { TemporalityModel } from '../models/Temporality.model';
import { StatsModel } from '../models/Stats.model';

@Component({
  components: {
    BarChart,
    StatCard,
    PieCard,
    LoadingCard
  },
})
class App extends Vue {
  @Prop({ type: Object as () => TemporalityModel, required: true, })
  temporality: TemporalityModel;
  
  load= false;
  ticketList: {domains: [], ticketList: []};
  domainList:string[] = ['Tous les domaines'];
  currentTimestamp = {valueTime: 0};

  barData = {labels: [], data: []}
  domain: string = 'Tous les domaines';
  pieData!: {};
  cardsData: StatsModel;
  domainPie = [
    // { label: "APPAREIL ", value: 64 },
    // { label: "APPAREIL ", value: 58 },
    // { label: "APPAREIL ELEVATEUR DEPLACEMENT", value: 60 },
    // { label: "APPAREIL ELEVATEUR DEPLACEMENT", value: 69 },
    // { label: "DEPLACEMENT", value: 58 },
    // { label: "ELEVATEUR", value: 60 },
    // { label: "APPAREIL ", value: 8 },
  ];
  todaysTickets = -1;
  periodTickets = -1;
  declarerPie = [];
  async mounted() {
    this.ticketList = await getData();
    let dom;
    for(let i = 0; i < this.ticketList.domains.length; i++) {
      dom = this.ticketList.domains[i] as any;
      this.domainList.push(dom.name);
    }
    this.interval();
    this.load = true;
    this.todaysTickets = await ticketsCreatedtoday();
    // this.periodTickets = await ticketsCreated(this.currentTimestamp.valueTime, this.temporality);
  }

  interval() {
    this.currentTimestamp = {valueTime: this.currentTimestamp.valueTime = moment().valueOf()};
    this.spreadData();
  }

  @Watch('temporality')
  async temporalityChange() {
    this.interval();
  }

  @Watch('domain')
  async domainChange() {
    let res = curveData(this.temporality.name, this.currentTimestamp.valueTime, this.domain, this.ticketList.ticketList);
    this.barData = res[0];
    this.cardsData = res[1];
    this.domainPie = res[2];
    this.declarerPie = res[3];
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

  async spreadData() {
  // cancel the previous execution of ticketsCreated
  let ticketsCreatedPromise = ticketsCreated(this.currentTimestamp.valueTime, this.temporality.name);
  this.periodTickets = -1;
  let res = curveData(this.temporality.name, this.currentTimestamp.valueTime, this.domain, this.ticketList.ticketList);
  this.barData = res[0];
  this.cardsData = res[1];
  this.domainPie = res[2];
  this.declarerPie = res[3];

  try {
    // wait for ticketsCreated to complete
    this.periodTickets = await ticketsCreatedPromise;
  } catch (e) {
    // handle cancellation
    if (e instanceof Error && e.message === 'Cancellation') {
      // console.log('ticketsCreated cancelled');
      this.periodTickets = -1;
    } else {
      throw e;
    }
  }
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
</style>