
<template>
  <div 
    ref="taskElement"
    @click=""
    :style="[
      { 'font-size': fontSize.small + 'px' },
      { 'left': isResizingWhole ? (dayWidth * locate - diffLeft) + 'px' : dayWidth * locate + 'px' },
      { 'height': (taskHeight - 8) + 'px' },
      { 'width': isResizingRight ? (taskWidth + diffRight) + 'px !important' : taskWidth + 'px !important' },
      { 'min-width': dayWidth + 'px !important' },
    ]"
    class="period"
    @mousedown="startResizeWholePeriod">
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
    <span class="resize-task-right"
      @mousedown="(e) => { e.stopPropagation(); startResizeRight(e); }"
    ></span>
    <!-- 
      <span class="resize-task-left"
      @mousedown="startResizeLeft"></span>
    -->
  </div>
</template>

<script>
import { throttle } from 'lodash';
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
    startResizeWx: 0,
    startResizeRx: 0,
    startResizeLx: 0,
    isResizingWhole: false,
    isResizingRight: false,
    isResizingLeft: false,
    diffWhole: 0,
    diffRight: 0,
    diffLeft: 0,
    moveFlag: false,
  }),
  computed: {
    left() {
      if (this.isResizingLeft) {
        return this.dayWidth * this.locate - this.diffLeft + 'px';
      }
      else if (this.isResizingRight) {
        return this.dayWidth * this.locate + this.diffRight + 'px';
      }
      else if (this.isResizingWhole) {
        return this.dayWidth * this.locate + this.diffWhole + 'px';
      }
      return this.dayWidth * this.locate + 'px';
    },
    width() {
      if (this.isResizingRight) {
        return this.taskWidth + this.diffRight + 'px !important';
      }
      else if (this.isResizingWhole) {
        return this.taskWidth + this.diffWhole + 'px !important';
      }
      return this.taskWidth + 'px !important';
    },
    locate() {
      const taskStart = moment(this.task.estimatedStartDate);
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
    startResizeWholePeriod: throttle(function(event) {
      this.startResizeWx = event.clientX;
      this.isResizingWhole = true;
      document.addEventListener('mousemove', this.resizeWholePeriod);
      document.addEventListener('mouseup', this.stopResizeWholePeriod);
    }, 10),
    resizeWholePeriod(event) {
      if (this.isResizingWhole) {
        this.moveFlag = true;
        this.diffWhole = event.clientX - this.startResizeWx;
        this.diffLeft = -this.diffWhole;
        this.diffRight = -this.diffWhole;
      }
    },
    stopResizeWholePeriod() {
      if (!this.moveFlag) {
        this.isResizingWhole = false;
        this.diffWhole = 0;
        this.diffLeft = 0;
        this.diffRight = 0;
        this.startResizeWx = 0;
        document.removeEventListener('mousemove', this.resizeWholePeriod);
        document.removeEventListener('mouseup', this.stopResizeWholePeriod);
        this.showTicketDetails();
        return;
      }
      this.moveFlag = false;
      let days;
      let newStartDate;
      let newEndDate;
      // No need to check if diffWhole is greater than or less than 0 or 0, just move the task
      days = Math.round(this.diffWhole / this.dayWidth);
      if (this.task.startDate) {
        newStartDate = moment(this.task.startDate).add(days, 'days');
      } else {
        newStartDate = moment(this.setToStartOfDay(this.task.startDate)).add(days, 'days');
      }
      if (this.task.endDate) {
        newEndDate = moment(this.task.endDate).add(days, 'days');
      } else {
        newEndDate = moment(this.setToStartOfDay(this.task.startDate)).add(days, 'days');
      }
      this.$emit('resizeWholePeriod', this.task, newStartDate, newEndDate);
      this.isResizingWhole = false;
      this.diffWhole = 0;
      this.diffLeft = 0;
      this.diffRight = 0;
      this.startResizeWx = 0;
      document.removeEventListener('mousemove', this.resizeWholePeriod);
      document.removeEventListener('mouseup', this.stopResizeWholePeriod);
    },
    startResizeRight: throttle(function(event) {
      this.startResizeRx = event.clientX;
      this.isResizingRight = true;
      document.addEventListener('mousemove', this.resizeRight);
      document.addEventListener('mouseup', this.stopResizeRight);
    }, 10),
    resizeRight(event) {
      if (this.isResizingRight) {
        this.diffRight = event.clientX - this.startResizeRx;
      }
    },
    stopResizeRight() {
      let days;
      let newEndDate;
      if (this.diffRight > 0) {
        days = Math.round(this.diffRight / this.dayWidth);
        if (this.task.endDate) {
          newEndDate = moment(this.task.endDate).add(days, 'days');
        } else {
          newEndDate = moment(this.setToStartOfDay(this.task.startDate)).add(days, 'days');
        }
        this.$emit('resizeEnd', this.task, newEndDate);
      } else if (this.diffRight < 0) {
        days = Math.round(this.diffRight / this.dayWidth);
        if (this.task.endDate) {
          const currentDuration = (this.setToStartOfDay(this.task.endDate).diff(this.setToStartOfDay(this.task.startDate), 'days') + 1);
          newEndDate = moment(this.task.endDate).subtract(Math.abs(days), 'days');
          const diff = (this.setToStartOfDay(newEndDate).diff(this.setToStartOfDay(this.task.startDate), 'days') + 1);
          if (diff > 0) {
            this.$emit('resizeEnd', this.task, newEndDate);
          } else {
            this.$emit('resizeEnd', this.task, moment(this.task.endDate).subtract(currentDuration - 1, 'days'));
          }
        }
      }
      this.isResizingRight = false;
      this.diffRight = 0;
      this.startResizeRx = 0;
      document.removeEventListener('mousemove', this.resizeRight);
      document.removeEventListener('mouseup', this.stopResizeRight);
    },
    startResizeLeft: throttle(function(event) {
      this.startResizeLx = event.clientX;
      this.isResizingLeft = true;
      document.addEventListener('mousemove', this.resizeLeft);
      document.addEventListener('mouseup', this.stopResizeLeft);
    }, 10),
    resizeLeft(event) {
      if (this.isResizingLeft) {
        this.diffLeft = this.startResizeLx - event.clientX;
      }
    },
    stopResizeLeft() {
      let days;
      let newStartDate;
      if (this.diffLeft > 0) {
        days = Math.round(this.diffLeft / this.dayWidth);
        if (this.task.startDate) {
          newStartDate = moment(this.task.startDate).subtract(days, 'days');
        } else {
          newStartDate = moment(this.setToStartOfDay(this.task.startDate)).subtract(days, 'days');
        }
        this.$emit('resizeStart', this.task, newStartDate);
      } else if (this.diffLeft < 0) {
        days = Math.round(this.diffLeft / this.dayWidth);
        if (this.task.startDate) {
          const currentDuration = (this.setToStartOfDay(this.task.endDate).diff(this.setToStartOfDay(this.task.startDate), 'days') + 1);
          newStartDate = moment(this.task.startDate).add(Math.abs(days), 'days');
          const diff = (this.setToStartOfDay(this.task.endDate).diff(this.setToStartOfDay(newStartDate), 'days') + 1);
          if (diff > 0) {
            this.$emit('resizeStart', this.task, newStartDate);
          } else {
            this.$emit('resizeStart', this.task, moment(this.task.startDate).add(currentDuration - 1, 'days'));
          }
        }
      }
      this.isResizingLeft = false;
      this.diffLeft = 0;
      this.startResizeLx = 0;
      document.removeEventListener('mousemove', this.resizeLeft);
      document.removeEventListener('mouseup', this.stopResizeLeft);
    },
    setToStartOfDay(time) {
      return moment(time).startOf('day');
    },
    setToEndOfDay(time) {
      return moment(time).endOf('day');
    },
    showTicketDetails() {
      this.$emit('showTicketDetails', this.task);
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
  transition: all 0.3s, width 0s, left 0s;
}
.text-position {
  position: absolute;
}
.resize-task-right {
  position: absolute;
  cursor: ew-resize;
  right: 0px;
  height: 100%;
  width: 9px;
  background: transparent;
  border-radius: 0 5px 5px 0;
  transition: background 0.3s;
}
.resize-task-right:hover {
  background: #000;
}
.resize-task-left {
  position: absolute;
  cursor: ew-resize;
  left: 0px;
  height: 100%;
  width: 9px;
  background: transparent;
  border-radius: 5px 0 0 5px;
  transition: background 0.3s;
}
.resize-task-left:hover {
  background: #000;
}
</style>

