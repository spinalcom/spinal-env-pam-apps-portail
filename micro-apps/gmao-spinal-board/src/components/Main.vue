
<template>
    <div class="main" v-if="loaded">
        <MonthView v-if="temporality.name === 'Mois'" :ticketList="ticketList" />
        <WeekView v-else-if="temporality.name === 'Semaine'" :ticketList="ticketList" />
        <DayView v-else-if="temporality.name === 'Jour'" :ticketList="ticketList" />
        <YearView v-else-if="temporality.name === 'Année'" :ticketList="ticketList" />
    </div>
</template>

<script>
import tickets from '../services/tickets';
import MonthView from './month/Main';
import WeekView from './week/Main';
import DayView from './day/Main';
import YearView from './year/Main';

export default {
  name: 'MainComponent',
  components: {
    MonthView,
    WeekView,
    DayView,
    YearView,
  },
  props: ['temporality'],
  computed: { },
  data: () => ({
    loaded: false,
    ticketList: null,
  }),
  created() {
  },
  async mounted () {
    this.ticketList = await tickets();
    this.loaded = true;
  },
  watch: {
    temporality(v1) {
      console.log('temporality', v1.name);
    },
  },
}
</script>

<style>
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

.main {
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%) !important;
  margin-top: 80px !important;
  margin-bottom: 10px;
  margin-right: auto;
  margin-left: auto;
  width: calc(100% - 20px);
  height: 0;
  flex-grow: 1;
  background: white;
  border-radius: 10px;
}
</style>

