
<template>
  <div class="content-plan"
    :style="{ 'height': ticketList.length * taskHeight  + 'px' }">
    <!-- TodayMarker component -->
    <TodayMarker
      :dayWidth="dayWidth"
      :height="markerHeight"
      :offset="markerOffset"/>
    <!-- Sidebar component -->
    <SideBar class="side-bar"
      :ticketList="ticketList"
      :start="start"
      :end="end"
      :viewPortEdges="viewPortEdges"
      :dayWidth="dayWidth"
      :taskHeight="taskHeight"
      :fontSize="fontSize"
      @bringDay="bringDay"
      @resizedSideBar="resizedSideBar"
      @goto="goto"/>
    <!-- Task component -->
    <Task
      v-for="(task, index) in  ticketList"
      :key="task.name + index"
      :style="[{ 'top': index * taskHeight + 'px'}]"
      :level="index"
      :task="task"
      :start="start"
      :dayWidth="dayWidth"
      :taskHeight="taskHeight"
      :fontSize="fontSize"
      />
    <div v-for="(offset, index) in weekLines"
      :key="index"
      :style="[
        { 'left': (offset - dayWidth * 2) + 'px' },
        { 'height': markerHeight - 5 + 'px' },
        { 'width': dayWidth * 2 + 'px'},
      ]"
      class="week-separator-long "
      ></div>
  </div>
</template>

<script>
import SideBar from './SideBar';
import TodayMarker from './TodayMarker';
import Task from './Task';
import moment from 'moment';
moment.locale('fr');
export default {
  name: 'CalendarContent',
  props: [
    'ticketList',
    'separator',
    'start',
    'end',
    'viewPortEdges',
    'dayWidth',
    'taskHeight',
    'fontSize',
  ],
  components: {
    Task,
    SideBar,
    TodayMarker,
  },
  data: () => ({
  }),
  computed: {
    weekLines() {
      const mondayLines = [];
      const diff = this.end.diff(this.start, 'days');
      for (let i = 8 - this.start.day(); i <= diff; i += 7) {
        mondayLines.push(i * this.dayWidth);
      }
      return mondayLines;
    },
    markerHeight() {
      return this.ticketList.length * this.taskHeight + 5;
    },
    markerOffset() {
     return moment().diff(this.start, 'days') * this.dayWidth;
    },
  },
  mounted() {
    this.$emit('planHeight', (this.ticketList.length) * this.taskHeight);
  },
  methods: {
    resizedSideBar(event) {
      this.$emit('resizedSideBar', event);
    },
    goto(event) {
      this.$emit('goto', event);
    },
    bringDay(ticket) {
      this.$emit('bringDay', ticket);
    },
  },
  watch: {
    taskHeight(v1) {
      this.$emit('planHeight', (this.ticketList.length) * this.taskHeight);
    },
  }

}
</script>

<style scoped>
.content-plan {
  position: sticky;
  color: #888888;
  top: 0px;
  left: 0;
  min-height: 100%;
  width: calc(100%);
  z-index: 101;
  transition: width 0.3s ease-in-out, left 0.3s ease-in-out, height 0.3s ease-in-out, font-size 0.3s ease-in-out;
}

.side-bar {
  position: sticky;
  top: 0;
  left: 0;
  background: white;
  height: 100%;
  z-index: 101;
  transition: left 0.3s ease-in-out, height 0.3s ease-in-out, font-size 0.3s ease-in-out;
}

.week-separator-long {
  background: #edeff0;
  border-left: 1px solid #E2E2E2;
  border-right: 1px solid #E2E2E2;
  min-height: 100%;
  position: absolute;
  top: 0;
  transition: width 0.3s ease-in-out, left 0.3s ease-in-out, height 0.3s ease-in-out, font-size 0.3s ease-in-out;
  z-index: 79;
}
</style>

