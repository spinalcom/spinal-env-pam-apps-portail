
<template>
  <div class="task"
    ref="wideTask"
    :style="[
      { 'top': level * taskHeight + 'px' },
      { 'height': taskHeight + 'px' },
    ]"
    @mouseenter="startListening"
    @mouseleave="stopListening"
  >
    <div
      v-if="!task.estimatedStartDate && task.state === 'ticket' && mouseMoveHandler"
      :style="[
        { 'left': Math.floor(mouseX / dayWidth) * dayWidth + 'px' },
        { 'height': (taskHeight - 8) + 'px' },
        { 'width': dayWidth + 'px' },
        { 'min-width': dayWidth + 'px' },
      ]"
      @click="startTicket"
      class="hovered-task">
      <v-icon
        :style="[{ 'font-size': fontSize.medium + 'px' }]"
        class="goto-icon icon">
        mdi-plus
      </v-icon>
    </div>
    <Period
      v-if="task.state === 'ticket'"
      :dayWidth="dayWidth"
      :taskHeight="taskHeight"
      :task="task"
      :start="start"
      :fontSize="fontSize"
      @resizeWholePeriod="resizeWholePeriod"
      @resizeStart="resizeStart"
      @resizeEnd="resizeEnd"
      @showTicketDetails="showTicketDetails"
      @resetTaskDetails="$emit('resetTaskDetails')"
    />
  </div>
</template>

<script>
import Period from './TaskPeriod';

export default {
  name: 'TaskItem',
  props: [
    'task',
    'level',
    'start',
    'dayWidth',
    'taskHeight',
    'fontSize',
  ],
  components: {
    Period,
  },
  mounted() {
    // client width of the task container
    const taskContainer = this.$refs.wideTask.clientWidth;
  },
  data: () => ({
    mouseX: null,
    mouseMoveHandler: null,
  }),
  methods: {
    startTicket() {
      const startClick = Math.floor(this.mouseX / this.dayWidth);
      const startDate = this.start.clone().add(startClick, 'days').startOf('day');
      // const endDate = startDate.clone().endOf('day');
      this.$emit('startTicket', this.task, startDate);
    },
    startListening() {
      if (this.task.estimatedStartDate || this.task.state !== 'ticket') {
        return;
      }

      // Define the mousemove event handler
      this.mouseMoveHandler = (event) => {
        const taskElement = this.$refs.wideTask;

        // Calculate the X position relative to the task component
        const rect = taskElement.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
      };

      // Add the event listener
      window.addEventListener('mousemove', this.mouseMoveHandler);
    },
    stopListening() {
      // Remove the mousemove event listener
      if (this.mouseMoveHandler) {
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        this.mouseMoveHandler = null; // Clear the handler
      }
    },
    showTicketDetails(task) {
      this.$emit('showTicketDetails', task);
    },
    resizeWholePeriod(task, startDate, endDate) {
      this.$emit('resizeWholePeriod', task, startDate, endDate);
    },
    resizeStart(task, startDate) {
      this.$emit('resizeStart', task, startDate);
    },
    resizeEnd(task, endDate) {
      this.$emit('resizeEnd', task, endDate);
    },
  },
}
</script>

<style scoped>
.task {
  position: absolute;
  z-index: 80;

  display: flex;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  width: calc(100% - 10px);

  align-items: center;

  background: transparent;

  transition: width 0.3s ease-in-out, height 0.3s ease-in-out, font-size 0.3s ease-in-out, background .1s ease-in-out;
}
.task:hover {
  background: #d5d7d62b;
}
.hovered-task {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #474747;
  background: white;
  border-radius: 5px;
  border: 1px solid #E2E2E2;
  box-shadow: 4px 3px 5px 0px #A0A0A024;
  transition: all 0.3s, width 0s, left 0s ease-in-out;
  cursor: pointer;
}
</style>

