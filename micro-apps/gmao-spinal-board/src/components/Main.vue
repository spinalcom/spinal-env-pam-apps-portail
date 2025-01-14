
<template>
  <div class="main" v-if="loaded">
    <MonthView v-if="temporality.name === 'Mois'" :ticketList="ticketList" />
    <WeekView v-else-if="temporality.name === 'Semaine'" :ticketList="ticketList" />
    <DayView
    v-else-if="temporality.name === 'Jour'"
    :ticketList="ticketList"
    :nestedList="nestedList"
    @resizeWholePeriod="resizeWholePeriod"
    @resizeStart="resizeStart"
    @resizeEnd="resizeEnd"
    @createTicket="createTicket"
    @startTicket="startTicket"
    />
    <YearView v-else-if="temporality.name === 'Année'" :ticketList="ticketList" />
  </div>
</template>

<script>
import tickets from '../services/tickets';
import dates from '../services/tickets/dates.js';
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
  computed: {},
  data: () => ({
    loaded: false,
    ticketList: null,
    nestedList: [],
  }),
  created() {},
  async mounted () {
    const response = await tickets();
    this.ticketList = response.flat;
    this.nestedList = response.nested;
    this.loaded = true;
  },
  methods: {
    async startTicket(task, estimatedStartDate) {
      try {
        await dates.setEstimatedStart(task.ticketId, estimatedStartDate);
        this.resizeStart(task, estimatedStartDate);
      } catch (error) {
        console.error(`Error starting ticket ${task.ticketId}`, error);
      }
    },
    createTicket(task, estimatedStartDate, estimatedEndDate) {
      this.resizeWholePeriod(task, estimatedStartDate, estimatedEndDate);
    },
    async resizeWholePeriod(task, estimatedStartDate, estimatedEndDate) {
      try {
        this.ticketList = this.ticketList.map((ticket) => {
          if (ticket.ticketId === task.ticketId) {
            ticket.estimatedStartDate = estimatedStartDate;
            ticket.estimatedEndDate = estimatedEndDate;
          }
          return ticket;
        });
        await dates.setEstimatedStart(task.ticketId, estimatedStartDate);
        await dates.setEstimatedEnd(task.ticketId, estimatedEndDate);
      } catch (error) {
        console.error(`Error resizing whole period for ticket ${task.ticketId}`, error);
      }
    },
    resizeStart(task, estimatedStartDate) {
      this.ticketList = this.ticketList.map((ticket) => {
        if (ticket.ticketId === task.ticketId) {
          ticket.estimatedStartDate = estimatedStartDate;
        }
        return ticket;
      });
    },
    async resizeEnd(task, estimatedEndDate) {
      try {
        this.ticketList = this.ticketList.map((ticket) => {
          if (ticket.ticketId === task.ticketId) {
            ticket.estimatedEndDate = estimatedEndDate;
          }
          return ticket;
        });
        await dates.setEstimatedEnd(task.ticketId, estimatedEndDate);
      } catch (error) {
        console.error(`Error resizing end for ticket ${task.ticketId}`, error);
      }
    },
  },
  watch: {},
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

