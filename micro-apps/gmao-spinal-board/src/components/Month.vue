
<template>
  <div class="calendar-plan" ref="calendar" @scroll="onScroll"
    :class="{ 'smooth-scroll': isScrolling }">

    <div class="action-bar">
      <div class="action-group">
        <v-icon class="action-icon icon" @click="verticalScroll('left')">mdi-chevron-left</v-icon>
        <v-icon class="action-icon icon" @click="verticalScroll('right')">mdi-chevron-right</v-icon>
      </div>
      <div class="action-button pointer-hover" @click="bringToday()">
        Aujourd'hui
      </div>
      <div class="action-group">
        <v-icon class="action-icon icon">mdi-sort</v-icon>
        Trier
      </div>
      <div class="action-group">
        <v-icon class="action-icon icon">mdi-filter</v-icon>
        Filter
      </div>
    </div>

    <div :style="[
      { 'width': planWidth + 30 + 'px' },
      { 'height': planHeight + 60 + 'px' },
      { 'min-height': planHeight + 'px' },
    ]" class="plan">

      <div class="month-strip top-bar">
        <div
          v-for="(month, index) in monthList"
          :key="month.name + '/' + month.year"
          class="month-placement"
          :style="[{ 'width': month.days * 30 + 'px' }, { 'z-index': index }]">
          {{ month.name.charAt(0).toUpperCase() + month.name.slice(1) }} {{ month.year }}
        </div>
      </div>

      <div class="month-strip secondary-bar bottom-divider">
        <div
          v-for="month in monthList"
          :key="month.name + '/' + month.year"
          class="day-strip"
          :style="{ 'width': month.days * 30 + 'px' }">
          <div
            v-for="day in month.days"
            :key="day + '/' + month.name + '/' + month.year"
            :class="{ today: currentMarker === day + '/' + month.name + '/' + month.year }"
            class="day full-center">
            {{ day }}
            <div
              v-if="isMonday(`${day}/${month.name}/${month.year}`)"
              :style="{ 'height': separator + 'px' }"
              class="week-separator"></div>
          </div>
        </div>
        <div class="dot" :style="{ 'left': markerOffset + 10 + 'px' }"></div>
      </div>

      <div class="plan-background" :style="{ 'height': planHeight  + 'px' }">
        <CalendarContent
          :ticketList="ticketList"
          :separator="separator"
          :start="start"
          :end="end"
          :viewPortEdges="viewPortEdges"
          @bringDay="bringDay"
          @goto="bringTheDay"
          @planHeight="planH"
          @resizedSideBar="resizedSideBar" />
      </div>
    </div>
  </div>
</template>

<script>
import CalendarContent from './CalendarContent.vue';
import { throttle } from 'lodash';
import moment from 'moment';
moment.locale('fr');
export default {
  name: 'MonthView',
  props: ['ticketList'],
  components: {
    CalendarContent,
  },
  computed: {
  },
  data: () => ({
    isScrolling: false,
    currentMarker: null,
    planHeight: 0,
    PERIODINTERVAL: 3, // 3 months
    current: null,
    start: null,
    end: null,
    diff: 0, // Days between the start and the end of the displayed calendar
    monthList: [],
    planDimensions: {},
    viewPortEdges: { start: null, end: null },
    sideBarWidthInDays: 0,
    viewPortWidthInDays: 0,
    margin: 300,
  }),
  created() {
    this.current = moment();
    this.start = this.current;
    this.end = this.current;
    this.monthList.push({
      name: this.getMonthName(this.current),
      year: this.current.format('YYYY'),
      days: this.countDaysInMonth(this.current),
    })
    this.appendPeriod();
    this.prependPeriod();
  },
  async mounted() {
    this.currentMarker = moment().format('DD/MMMM/YYYY');
    this.updatePlanDimensions()
    this.bringToday(false);

    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    markerOffset() {
     return moment().diff(this.start, 'days') * 30 + 3;
    },
    separator() {
      return this.planDimensions.height - 30 - this.planDimensions.height * .02;
      // return this.planDimensions.height - 5;
    },
    planWidth() {
      return this.diff * 30;
    },
    scrollWidth() {
      const sideBarWidth = 300;
      return Math.floor((this.planDimensions.width - sideBarWidth) / 30) * 30;
    }
  },
  methods: {
    getYear(time) {
      return moment(time).year();
    },
    getMonth(time) {
      return moment(time).month() + 1;
    },
    getDay(time) {
      return moment(time).date();
    },
    addMonths(time, value) {
      return moment(time).add(value, 'months');
    },
    subtractMonths(time, value) {
      return moment(time).subtract(value, 'months');
    },
    setToStartOfMonth(time) {
      return moment(time).startOf('month');
    },
    setToEndOfMonth(time) {
      return moment(time).endOf('month');
    },
    countDaysInMonth(time) {
      return this.getDay(this.setToEndOfMonth(time));
    },
    getMonthName(time) {
      return moment(time).format('MMMM');
    },
    isMonday(date) {
      return moment(date, 'DD/MMMM/YYYY').format('ddd') === 'lun.';
    },
    appendPeriod() {
      for(let i = 0; i < this.PERIODINTERVAL; i++) {
        this.end = this.setToEndOfMonth(this.addMonths(this.end, 1));
        this.monthList.push({
          name: this.getMonthName(this.end),
          year: this.end.format('YYYY'),
          days: this.countDaysInMonth(this.end),
        })
        this.diff = this.end.diff(this.start, 'days');
      }
    },
    async prependPeriod() {
      let daysPrepended = 0;
      for(let i = 0; i < this.PERIODINTERVAL; i++) {
        this.start = this.setToStartOfMonth(this.subtractMonths(this.start, 1));
        this.monthList.unshift({
          name: this.getMonthName(this.start),
          year: this.start.format('YYYY'),
          days: this.countDaysInMonth(this.start),
        })
        daysPrepended += this.monthList[0].days;
        this.diff = this.end.diff(this.start, 'days');
      }
      this.isScrolling = false;
      await this.$nextTick();
      this.$refs.calendar.scrollLeft += daysPrepended * 30;
      this.isScrolling = true;
      return daysPrepended;
    },
    onScroll: throttle(function (event) {

      const parent = event.target;
      const child = parent.querySelector('.plan-background');
      
      const scrollLeft = parent.scrollLeft;
      const parentWidth = parent.clientWidth;
      const childWidth = child.offsetWidth;
      // TODO: WRITE DOCUMENTATION
      this.sideBarWidthInDays = 10;
      this.viewPortWidthInDays = Math.floor((this.planDimensions.width - 10) / 30) - this.sideBarWidthInDays;

      this.viewPortEdges.start = moment(this.start).add(Math.ceil(scrollLeft / 30) + this.sideBarWidthInDays, 'days');
      this.viewPortEdges.end = moment(this.viewPortEdges.start).add(this.viewPortWidthInDays, 'days');

      if (scrollLeft <= this.margin) {
        this.triggerNearLeftEdge();
      } else if (scrollLeft + parentWidth >= childWidth - this.margin) {
        this.triggerNearRightEdge();
      }
    }, 100),
    triggerNearLeftEdge() {
      const tempStart = this.start;
      this.prependPeriod();
      // this.$refs.calendar.scrollLeft = tempStart.diff(this.start, 'days') * 30;
    },
    triggerNearRightEdge() {
      this.appendPeriod();
    },
    resizedSideBar() {
    },
    planH(event) {
      this.planHeight =  event;
    },
    async bringToday(animation = true) {
      // console.log('Bring the day');
      const date = this.current
      this.isScrolling = animation;
      await this.$nextTick();
      this.$refs.calendar.scrollLeft = date.diff(this.start, 'days') * 30 - 300 - ( (this.$refs.calendar.offsetWidth - 300) / 2 );
      await this.$nextTick();
      this.isScrolling = true;
    },
    bringTheDay(date) {
    },
    async bringDay(ticket) {
      const { position, startDate } = ticket;
      if (position === 'right') {
        const diff = moment(startDate).diff(this.end, 'months');
        if (diff > 0) {
          for (let i = 0; i < (diff + 1); i += 3) {
            await this.appendPeriod();
          }
        }
      }
      else if (position === 'left') {
        const diff = moment(startDate).diff(this.start, 'months');
        if (diff < 0) {
          for (let i = 0; i < -(diff - 1); i += 3) {
            await this.prependPeriod();
          }
        }
      }
      this.$refs.calendar.scrollLeft = moment(startDate).diff(this.start, 'days') * 30 - 300 - ( (this.$refs.calendar.offsetWidth - 300) / 2 );
    },
    async verticalScroll(direction) {
      if (direction === 'right') {
        if ((this.end.diff(this.viewPortEdges.end, 'days') - this.viewPortWidthInDays) < this.viewPortWidthInDays) {
          await this.appendPeriod();
        }
        await this.$nextTick();
        this.$refs.calendar.scrollLeft += this.viewPortEdges.end.diff(this.viewPortEdges.start, 'days') * 30;
      }
      else if (direction === 'left') {
        if ((this.viewPortEdges.start.diff(this.start, 'days') - this.viewPortWidthInDays) < this.viewPortWidthInDays) {
          await this.prependPeriod();
        }

        await this.$nextTick();
        this.$refs.calendar.scrollLeft -= this.viewPortEdges.end.diff(this.viewPortEdges.start, 'days') * 30;
      }
    },
    fallingIn(date) {
      if (moment(date).isAfter(this.end)) {
        return 'after';
      }
      else if (moment(date).isBefore(this.start)) {
        return 'before';
      }
      else if (moment(date).isBetween(this.start, this.end)) {
        return 'between';
      }
      else {
        return 'unknown';
      }
    },
    updatePlanDimensions() {
      this.planDimensions = {
        height: this.$refs.calendar.offsetHeight,
        width: this.$refs.calendar.offsetWidth
      };
    },
    handleResize() {
      this.updatePlanDimensions();
    },
  },
  watch: {
  },
}
</script>

<style>
.month-placement {
  position: sticky;
  left: 0;
  display: flex;
  align-items: center;
  font-size: 12px;
  padding-left: 10px;
  background: linear-gradient(to left, white 98.5%, transparent);
}
.full-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar-plan {
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100%);
  border-radius: 10px;
  overflow-x: auto;
  overflow-y: auto;
  background: #f6f8fa;
  max-width: 100%;
}
.smooth-scroll {
  scroll-behavior: smooth;
}
.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.month-strip {
  position: sticky;
  display: flex;
  flex-direction: row;
  gap: 0px;
  height: 30px;
  min-height: 30px !important;
  width: 100%;
  color: #888888;
  font-size: 12px;
  z-index: 110;
  background: white;
}
.day-strip {
  display: flex;
  height: 30px;
}
.bottom-divider {
  border-bottom: 2px solid #DDDDDD;
}
.day {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 30px;
  width: 30px;
  font-size: 10px;
  z-index: 100;
}
.top-bar {
  top: 0;
}
.secondary-bar {
  top: 30px;
}
.plan-background {
  height: 0;
  flex-grow: 1;
  width: 100%;
  z-index: 100;
  background: #F6F8FA;
}
.week-separator {
  position: absolute;
  top: 0;
  left: 0;
  height: 30px !important;
  width: 1px;
  border-left: 1px solid #E2E2E2;
}
.sunrise {
  position: absolute;
  top: 25px;
  height: 5px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  width: 6px;
  background: green;
  z-index: 185;
}
.dot {
  position: absolute;
  top: 25px;
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background: #FF3A3A;
  z-index: 400;
}
.today {
  font-weight: bold;
  color: #FF3A3A;
}
.calendar-plan::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.calendar-plan::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 1px;
}
.calendar-plan::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}
.calendar-plan::-webkit-scrollbar-track {
  background-color: #e0e0e0;
  border-radius: 1px;
}

.action-bar {
  display: flex;
  position: fixed;
  flex-direction: row-reverse;
  align-items: center; 
  gap: 20px;
  padding: 0 10px;
  right: 17px;
  height: 30px;
  background: green;
  z-index: 111;
  background: linear-gradient(to left, #fff 96%, transparent);
  font-size: 12px;
  letter-spacing: 1.1px;
}
.action-group {
  display: flex;
  align-items: center; 
  justify-content: center;
  gap: 5px;
}
.action-button {
  display: flex;
  align-items: center; 
  justify-content: center;
  height: 30px !important;
}
.action-icon {
  font-size: 14px !important;
}
.pointer-hover {
  cursor: pointer;
}
</style>

