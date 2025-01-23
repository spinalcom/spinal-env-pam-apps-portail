
<template>
  <div class="edit-details-container">
    <div class="edit-status">
      <div class="edit-row">
        <span class="label">Statut</span>
        <div class="action">
          <Chip
            :text="'Ouvert'"
            :status="'open'" />
        </div>
      </div>
      <div class="edit-row">
        <span class="label">Date de début estimée</span>
        <div class="action">
        </div>
      </div>
      <div class="edit-row">
        <span class="label">Date de fin estimée</span>
        <div class="action">
        </div>
      </div>
      <div class="edit-row">
        <span class="label">Date de début réelle</span>
        <div class="action">
        </div>
      </div>
      <div class="edit-row">
        <span class="label">Date de fin réelle</span>
        <div class="action">
        </div>
      </div>
    </div>
    <div class="danger-zone">
      <div class="edit-row">
        <span class="label">
          <v-icon class="icon">mdi-archive</v-icon>
          <span>Archiver</span>
        </span>
        <div class="action">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chip from './Chip.vue';
export default {
  name: 'EditDetails',
  components: {
    Chip,
  },
  props: [
    'task',
  ],
  data: () => ({
  }),
};
</script>

<style scoped>
.edit-details-container {
  display: flex;
  flex-direction: column;
  width: 350px !important;
  min-width: 350px;
}
.edit-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #E0E0E0;
}
.edit-row {
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 10px;
  width: 100%;
  padding-left: 10px;
}
.label {
  font-size: 12px;
  width: 150px !important;
  max-width: 200px;
}
.action {
  display: flex;
  cursor: pointer;
  flex-grow: 1;
  border-radius: 5px;
}
.action:hover {
  background: #F5F5F5;
}
.danger-zone {
  cursor: pointer;
  padding: 10px 0;
  color: #FF0000 !important;
  font-weight: 700;
  border-radius: 5px;
  transition: background 0.3s;
}
.danger-zone:hover {
  background: #F5F5F5;
}
.icon {
  color: #FF0000 !important;
  font-size: 16px !important;
}
</style>

