
<template>
  <div :style="[
    { 'left': 30 * locate + 'px' },
    { 'width': taskWidth * 30 - 12+ 'px' }
    ]"  class="period">
    <Status :status="task.status" />
   {{ task.name }} 
  </div>
</template>

<script>
import Status from './Status';
import moment from 'moment';
moment.locale('fr');
export default {
  name: 'TaskPeriod',
  props: ['task', 'start'],
  components: {
    Status,
  },
  mounted() {
  },
  computed: {
    locate() {
      const taskStart = moment(this.task.startDate);
      return taskStart.diff(this.start, 'days');
    },
    taskWidth() {
      const taskStart = moment(this.task.startDate);
      const taskEnd = moment(this.task.endDate);
      return taskEnd.diff(taskStart, 'days');
    },
  },
  methods: {
  },
}
</script>

<style>
.period {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #474747;
  height: 22px;
  background: white;
  left: 400px;
  padding-left: 10px;
  font-size: 11px;
  border-radius: 5px;
  border: 1px solid #E2E2E2;
  box-shadow: 4px 3px 5px 0px #A0A0A024;
  white-space: nowrap;
}

.icon {
  font-size: 16px;
  color: #33A948;
}
</style>

