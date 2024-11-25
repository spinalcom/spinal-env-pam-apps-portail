
<template>
  <div class="task" :style="[{ 'top': (1 + level) * 30 + 'px'}]">
    <Period class="period" :task="task" :start="start"/>
  </div>
</template>

<script>
import Period from './TaskPeriod';

export default {
  name: 'TaskItem',
  props: ['task', 'level', 'start'],
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
  height: 30px;
  width: calc(100% - 10px);
}

.period {
  position: absolute;
}
</style>

