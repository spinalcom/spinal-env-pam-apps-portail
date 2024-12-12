
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
      class="period" />
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
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  position: absolute;
  display: flex;
  align-items: center;
  width: calc(100% - 10px);
}

.period {
  position: absolute;
}
</style>

