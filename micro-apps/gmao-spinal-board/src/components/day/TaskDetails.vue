
<template>
  <div 
    :style="[
      { 'z-index': taskDetails ? '9008' : '0' },
    ]"
    class="task-details-container">
    <div
      v-if="taskDetails"
      @click="resetTaskDetails()"
      class="task-details-close"></div>

    <div
      :style="[
        { 'width': taskDetails ? '500px' : '0px' },
      ]"
      class="task-details">
      <div
        v-if="taskDetails">
        <h2>{{ taskDetails.name }}</h2>
        <p>{{  taskDetails.workflowName }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskDetails',
  props: ['task'],
  data: () => ({
    taskDetails: null,
  }),
  mounted() {
    this.taskDetails = this.task;
  },
  methods: {
    resetTaskDetails() {
      this.$emit('resetTaskDetails');
    },
  },
  watch: {
    task: {
      handler: function (newVal, oldVal) {
        this.taskDetails = newVal;
      },
      deep: true,
    },
  },
}
</script>

<style>
.task-details-container {
  position: fixed;
  right: 10px;
  top: 80px;
  background: transparent;
  width: calc(100% - 20px);
  max-width: calc(100% - 20px);
  height: calc(100% - 96px);
  transition: background 0.3s;
}
.task-details {
  position: fixed;
  right: 10px;
  top: 80px;
  background: white;
  max-width: calc(100% - 20px);
  box-shadow: -5px 1px 7px 0px #c3c3c3;
  height: calc(100% - 96px);
  z-index: 9009;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  transition: width 0.3s;
}
.task-details-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>
