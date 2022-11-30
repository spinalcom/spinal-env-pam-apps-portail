<template>
  <div class="MDS">
    <div class="TSDS">
      <p class="TTDS">DIAGNOSTIC DE PERFORMANCE ÉNERGÉTIQUE</p>
      <p class="LTDS">Kg/Co2/m²/an</p>
    </div>
    <div class="THINSTRIPECOMPO">
      <div class="THINSTRIPE">
        <div class="THINBAR" v-for="i in 7" :key="i" :class="stripeColors[i-1]">
          <p class="stripeLegend">{{intervalLegends[i-1]}}</p>
        </div>
        <DiagnosisPin :objectif="objectif" :text="'Cette année'"/>
        <DiagnosisPin :objectif="current" :text="'L\'année dernière'"/>
      </div>
    </div>
  </div>
</template>
<script>
import DiagnosisPin from './DiagnosisPin.vue';
export default {
  name: 'DiagnosisComponent',
  components: {
    DiagnosisPin
  },
  props: ['objectif', 'current'],
  data: () => ({
    intervalLegends: ['', '<240', '<200', '<160', '<120', '<80', '<40'],
    stripeColors: ['R', 'O1', 'O2', 'Y', 'G1', 'G2', 'G3']
  }),
  methods: {},
  mounted() {}
}
</script>

<style scoped>
.MDS {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;

  width: 100%;
  height: 140px;

  background: #F9F9F9;
  border: 1px solid #F7F7F7;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.25);
  border-radius: 10px;
}

.TSDS {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  width: 100%;
}

.TTDS {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 17px;
  letter-spacing: 1.1px;
  color: #14202C;
  margin-bottom: 0 !important;
}

.LTDS {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 1.1px;
  margin-bottom: 0 !important;
  color: rgba(33, 67, 83, 0.55);
}

.THINSTRIPECOMPO {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;

  width: 100%;
  height: 46px;
}

.THINSTRIPE {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  position: relative;
  width: 100%;
  height: 10px;
}


.THINBAR {
  position: relative;
  flex-grow: 1;
  height: 10px;
  background: #D9D9D9;
  border-radius: 3px;
}

.stripeLegend {
  font-family: 'charlevoix';
  position: absolute;
  top: 10px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 1.1px;
  color: #214353;
}

.dot {
  top: 2px;
  right: 0px;
  position: absolute;
  height: 6px;
  width: 6px;
  border-radius: 10px;
  background: #14202C;
}
</style>