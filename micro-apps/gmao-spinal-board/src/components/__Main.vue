
<template>
  <div class="RC" style="min-height: 480px">
  </div>
</template>

<script>
import Vue from 'vue';
export default {
  name: 'PatrimonyWaterDashboard',
  props: ['temporality', 'space'],
  components: {
  },
  data: () => ({
  }),
  async mounted() {
    moment.locale("fr");
    this.loaded = true;
  },
  computed: {
  },
  
  methods: {

  },
  watch: {
    space: {
      handler() {
        // this.onRequest();
      }
    },
    currentTimestamp(value) {
      // this.onRequest();
    },
    temporality(value) {
    }
  }
}
</script>

<style scoped>

</style>

