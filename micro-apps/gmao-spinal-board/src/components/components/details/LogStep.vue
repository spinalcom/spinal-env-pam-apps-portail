
<template>
  <div>
    <div class="step-link"></div>
    <div class="step">
      <div class="step-name">
        <v-icon class="icon">{{ step.icon }}</v-icon>
        <span>{{ step.name }}</span>
      </div>
      <span class="step-date">
        {{ step.date }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogStep',
  props: [
    'step',
  ],
  data: () => ({
  }),
};
</script>

<style scoped>
.step-link {
  height: 30px;
  width: 1px;
  border: 1px solid #B1B1B1;
  margin-left: 20px;
}
.step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  width: 100%;
  background: #FAFAFA;
  border-radius: 5px;
  padding: 0 20px 0 0;
}
.step-name {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-size: 14px;
}
.step-date {
  font-size: 12px;
}
</style>

