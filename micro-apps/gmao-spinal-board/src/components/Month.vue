
<template>
  <div class="calendar-plan" ref="calendar" @scroll="onScroll">
    <div :style="[{ 'width': planWidth + 30 + 'px' }, { 'height': planHeight + 60 + 'px' }]" class="plan">
    <!--
    <div :style="{ 'width': '100%' }" class="plan">
    -->

      <div class="month-strip top-bar">
        <div
          v-for="(month, index) in monthList"
          :key="month.name + '/' + month.year"
          class="month-placement"
          :style="[{ 'width': month.days * 30 + 'px' }, { 'z-index': index }]">
          {{ month.name.charAt(0).toUpperCase() + month.name.slice(1) }}
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
        <CalendarContent :separator="separator" :start="start" :end="end" @resizedSideBar="resizedSideBar" @planHeight="planH" />
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
  components: {
    CalendarContent,
  },
  data: () => ({
    planHeight: 0,
    PERIODINTERVAL: 3, // 3 months
    current: null,
    start: null,
    end: null,
    diff: 0, // Days between the start and the end of the displayed calendar
    monthList: [],
    planDimensions: {}, 
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
  mounted() {
    console.log('mounted');
    this.planDimensions = {
      height: this.$refs.calendar.offsetHeight,
      width: this.$refs.calendar.offsetWidth
    };
    this.$refs.calendar.scrollLeft = this.current.diff(this.start, 'days') * 30 - 300 - ( (this.$refs.calendar.offsetWidth - 300) / 2 );
    // this.$refs.calendar.scrollLeft = 3360 - 300;
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
    prependPeriod() {
      for(let i = 0; i < this.PERIODINTERVAL; i++) {
        this.start = this.setToStartOfMonth(this.subtractMonths(this.start, 1));
        this.monthList.unshift({
          name: this.getMonthName(this.start),
          year: this.start.format('YYYY'),
          days: this.countDaysInMonth(this.start),
        })
        this.diff = this.end.diff(this.start, 'days');
      }
    },
    onScroll: throttle(function (event) {
      console.log('scroll');
      const parent = event.target;
      const child = parent.querySelector('.plan-background');
      
      const scrollLeft = parent.scrollLeft;
      const parentWidth = parent.clientWidth;
      const childWidth = child.offsetWidth;

      const margin = 400;

      if (scrollLeft <= margin) {
        this.triggerNearLeftEdge();
      } else if (scrollLeft + parentWidth >= childWidth - margin) {
        this.triggerNearRightEdge();
      }
    }, 1000),
    triggerNearLeftEdge() {
      const tempStart = this.start;
      this.prependPeriod();
      this.$refs.calendar.scrollLeft = tempStart.diff(this.start, 'days') * 30;
    },
    triggerNearRightEdge() {
      this.appendPeriod();
    },
    resizedSideBar() {
    },
    planH(event) {
      this.planHeight =  event;
    }
  }
}
</script>

<style>
.month-placement {
  position: sticky;
  left: 0;
  display: flex;
  align-items: center;
  padding-left: 10px;
  background: linear-gradient(to left, white 98.5%, transparent);
}
.full-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar-plan {
  display: flex;
  flex-direction: column;
  height: calc(100%);
  border-radius: 10px;
  overflow-x: auto;
  overflow-y: auto;
  background: #f6f8fa;
  max-width: 100%;
}
.plan {
  min-height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
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
  top: 27px;
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background: #FF3A3A;
  z-index: 400;
}
          
/*
.calendar-plan::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.calendar-plan::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}

.calendar-plan::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.calendar-plan::-webkit-scrollbar-track {
  background-color: #e0e0e0;
  border-radius: 10px;
}
*/
</style>

