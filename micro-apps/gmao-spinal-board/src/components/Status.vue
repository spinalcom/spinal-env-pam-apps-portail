
<template>
  <div class="icon">
    <v-icon v-if="status==='done'"
      class="done icon"
      >mdi-check-circle-outline</v-icon>
    <v-icon v-else-if="status==='inProgress'" 
      class="pending icon"
      >mdi-vanish</v-icon>
    <v-icon v-else-if="status==='pending'" 
      class="in-progress icon"
      >mdi-circle-small</v-icon>
  </div>
</template>

<script>
export default {
  name: 'TaskStatus',
  props: ['status'],
}
</script>

<style scoped>
.icon {
  display: flex;
}
.icon {
  font-size: 16px !important;
}
.done {
  color: #8F62E2 !important;
}
.in-progress {
  color: #33A948 !important;
}
.pending {
  color: #B5B5B5 !important;
}
</style>

