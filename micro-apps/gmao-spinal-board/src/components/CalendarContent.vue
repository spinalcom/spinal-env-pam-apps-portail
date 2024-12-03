
<template>
  <div class="content-plan"
    :style="{ 'height': ticketList.length * 30  + 'px' }">
    <TodayMarker :height="markerHeight" :offset="markerOffset"/>
    <SideBar class="side-bar" :ticketList="ticketList" @resizedSideBar="resizedSideBar"/>
    <Task
      v-for="(task, index) in  ticketList" :key="task.name + index" class="task"
        :style="[{ 'top': index * 30 + 'px'}, ]"
      :level="index" :task="task" :start="start"/>
    <div v-for="(offset, index) in weekLines" :key="index" :style="[{ 'left': offset + 'px' }, { 'height': markerHeight - 5 + 'px' }]" class="week-separator-long "></div>
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
  props: ['ticketList', 'separator', 'start', 'end'],
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
        mondayLines.push(i * 30);
      }
      return mondayLines;
    },
    markerHeight() {
      return this.ticketList.length * 30 + 5;
    },
    markerOffset() {
     return moment().diff(this.start, 'days') * 30 + 3;
    },
  },
  mounted() {
    this.$emit('planHeight', (this.ticketList.length) * 30);
    console.log(this.ticketList);
  },
  methods: {
    resizedSideBar(event) {
      this.$emit('resizedSideBar', event);
    }
  },
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
}

.side-bar {
  position: sticky;
  top: 0;
  left: 0;
  background: white;
  height: 100%;
  width: 300px;
  z-index: 101;
  border-right: 1px solid #E2E2E2;
}

.task {
  position: absolute;
  z-index: 80;
}

.week-separator-long {
  position: absolute;
  top: 0;
  min-height: 100%;
  width: 1px;
  border-left: 1px solid #E2E2E2;
  z-index: 79;
}
</style>

