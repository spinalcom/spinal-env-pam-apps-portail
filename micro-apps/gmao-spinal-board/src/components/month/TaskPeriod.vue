
<template>
  <div 
    ref="taskElement"
    @click="showTicketDetails()"
    :style="[
      { 'font-size': fontSize.small + 'px' },
      { 'left': dayWidth * locate + 'px' },
      { 'height': (taskHeight - 8) + 'px' },
      { 'width': taskWidth + 'px !important' },
      { 'min-width': dayWidth + 'px !important' },
    ]"
    class="period">
    <Status
      :dayWidth="dayWidth"
      :fontSize="fontSize"
      :status="task.status"
      />
    <span
      :style="[
        { 'left': textFit ? dayWidth + 'px' : 'calc(100% + 10px)' },
      ]"
      ref="textElement"
      class="text-position"
      >
      {{ task.name }}
    </span>
  </div>
</template>

<script>
import Status from './Status';
import moment from 'moment';
moment.locale('fr');
export default {
  name: 'TaskPeriod',
  props: [
    'task',
    'start',
    'dayWidth',
    'taskHeight',
    'fontSize',
  ],
  components: {
    Status,
  },
  data: () => ({
    resizeObserver: null,
    rectDim: { height: 0, width: 0 },
    textDim: { height: 0, width: 0 },
  }),
  computed: {
    locate() {
      const taskStart = moment(this.task.startDate);
      return taskStart.diff(this.start, 'days');
    },
    taskWidth() {
      if (this.task.endDate) {
        const duration = (this.setToStartOfDay(this.task.endDate).diff(this.setToStartOfDay(this.task.startDate), 'days') + 1) * this.dayWidth;
        return duration;
      }
      return this.dayWidth;
    },
    textFit() {
      return (this.textDim.width + this.dayWidth) < this.rectDim.width;
    }
  },
  mounted() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const contentRect = entry.contentRect.width;
        this.rectDim.width = contentRect;
        if (this.$refs.textElement && this.$refs.textElement.clientWidth) {
          this.textDim.width = this.$refs.textElement.clientWidth;
        }
      }
    });

    this.resizeObserver.observe(this.$refs.taskElement);
  },
  methods: {
    setToStartOfDay(time) {
      return moment(time).startOf('day');
    },
    setToEndOfDay(time) {
      return moment(time).endOf('day');
    },
    showTicketDetails() {
      console.log('Start:', this.setToStartOfDay(this.task.startDate).format('DD-MM-YYYY'));
      console.log('Start:', this.task.startDate);
      console.log('End:', this.setToStartOfDay(this.task.endDate).format('DD-MM-YYYY'));
      console.log('Start:', this.task.endDate);
    }
  },
}
</script>

<style>
.period {
  position: absolute;
  display: flex;
  align-items: center;
  color: #474747;
  background: white;
  left: 400px;
  border-radius: 5px;
  border: 1px solid #E2E2E2;
  box-shadow: 4px 3px 5px 0px #A0A0A024;
  white-space: nowrap;
  transition: all 0.3s;
}
.text-position {
  position: absolute;
}
</style>

