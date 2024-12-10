
<template>
  <div class="icon">
    <v-icon v-if="status==='Clôturée' || status==='Solved'"
      class="done icon"
      >mdi-check-circle-outline</v-icon>
    <v-icon v-else-if="status==='Réalisation partielle' || status === 'Raised'"
      class="pending icon"
      >mdi-vanish</v-icon>
    <v-icon v-else-if="status==='Attente de lect.avant Execution'" 
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
  align-items: center;
  justify-content: center;
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

