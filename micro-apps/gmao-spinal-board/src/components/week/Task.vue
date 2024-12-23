
<template>
  <div class="task"
    :style="[
      { 'top': (1 + level) * taskHeight + 'px'},
      { 'height': taskHeight + 'px'},
    ]">
    <Period
      :dayWidth="dayWidth"
      :taskHeight="taskHeight"
      :task="task"
      :start="start"
      :fontSize="fontSize"
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
  }
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
</style>

