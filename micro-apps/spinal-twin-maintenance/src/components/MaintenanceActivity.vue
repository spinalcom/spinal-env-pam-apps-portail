<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
        <BarChart :title="'Activité des tickets en cours'" :labels="['one', 'two', 'three']" :datasets="[808, 909, 707]" stacked class="BR">
            <template v-slot:extras>
            <v-select :items="['One', 'Two', 'Three']" outlined color="#000000DE" item-color="#000000DE" dense style="min-width: 200px; width: 15%; flex-grow: 0; font-size: 14px !important;" class="ml-8" label="Domaine">
              <template #label="{ attrs }">
                <label :for="attrs.id" style="font-size: 14px;">Select an item</label>
              </template>
            </v-select>
            </template>
        </BarChart>
        <div class="d-flex cards">
        <StatCard :value="808" :type="'comparison'" :unit="'Tickets'" :title="`créés en 2023`" :compared="'44%'" :subtitle="'par rapport à l\'année dernière'" class="flex-grow-1 pa-4"/>
        <StatCard :value="808" :type="'comparison'" :unit="'Tickets'" :title="'en cours'" :compared="'44%'" :subtitle="'par rapport à l\'année dernière'"  class="flex-grow-1 pa-4"/>
        <StatCard :value="808" :unit="'Tickets'"  :title="'créés'" :subtitle="'Aujourd\'hui'"  class="flex-grow-1 pa-4"/>
      </div>
      <div
        style="height: 330px; gap: 10px; width: 100%"
        class="d-flex flex-row"
      >
        <PieCard
          class="flex-grow-1"
          :title="'Tickets par domaine'"
          :pie-chart-data="pie"/>
        <PieCard
          class="flex-grow-1"
          :title="'Tickets par déclarant'"
          :pie-chart-data="pie"/>
      </div>
    </div>
  </div>
</template>

<script>
import BarCard from "spinal-components/src/components/BarCard.vue";
import StatsCard from "spinal-components/src/components/StatsCard.vue";
import PieCard from "spinal-components/src/components/PieCard.vue";
export default {
    components: {
    "BarChart": BarCard,
    "StatCard": StatsCard,
    "PieCard": PieCard
  },
  data: () => ({
    pie: [
      { label: "plus tard", value: 64 },
      { label: "je m'en moque", value: 58 },
      { label: "serieux ?", value: 60 },
      { label: "Qui as dit ça ?", value: 69 },
      { label: "je m'en moque", value: 58 },
      { label: "serieux ?", value: 60 },
      { label: "Qui as dit ça ?", value: 69 },
    ]
  })
}
</script>

<style scoped>

.RC {
  font-family: Charlevoix;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 80px 10px 10px;
  gap: 10px;
  height: 100vh;
  width: 100%;
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%);
}
/* main container */
.MC {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  /* background: #F9F9F9; */
  /* border: 1px solid #F7F7F7; */
  /* box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16); */
  border-radius: 10px;
  width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  overflow-y: hidden;
}

.BR {
  /* height: 100%; */
  flex-grow: 1;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.cards {
  gap: 10px;
  width: 100%;
}

.v-application .ma-2 {
  margin: 0 !important;
}

.v-application .elevation-5 {
  box-shadow: 0px 3px 10px #49545C29 !important;
}

::v-deep .v-label {
  font-size: 14px !important;
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
}

::v-deep .v-list-item__title {
  font-size: 14px !important;
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
}
</style>