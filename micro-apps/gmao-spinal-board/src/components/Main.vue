
<template>
    <div class="main">
      <MonthView v-if="temporality === 'month'" />
    </div>
</template>

<script>
import tickets from '../services/tickets';
import MonthView from './Month';
export default {
  name: 'MainComponent',
  components: {
    MonthView,
  },
  computed: { },
  data: () => ({
    temporality: null,
  }),
  created() {
    this.temporality = 'month';
  },
  async mounted () {
    const res = await tickets();
  }
}
</script>

<style>
.RC {
  font-family: Charlevoix;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 80px 10px 10px;
  gap: 10px;
  height: 100vh;
  width: 100%;
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%);
}

.main {
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%) !important;
  margin-top: 80px !important;
  margin-bottom: 10px;
  margin-right: auto;
  margin-left: auto;
  width: calc(100% - 20px);
  height: 0;
  flex-grow: 1;
  background: white;
  border-radius: 10px;
}
</style>

