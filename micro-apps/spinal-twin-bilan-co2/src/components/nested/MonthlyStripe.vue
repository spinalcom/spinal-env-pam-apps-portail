<template>
  <div style="width: 100%">
    <div class="MCTITLE">
      <p class="MCTEXT">BILAN PAR MOIS</p>
    </div>
    <div class="MONTHSTRIPE">
      <div v-for="i in 12" :key="i" class="MONTHRECT" :class="colorCalc(values[0][i-1])"><span class="MONTHLEGEND">{{legendCalc(values[0][i-1])}}</span></div>
    </div>
    <p class="CALMAX LP">Le mois où le bâtiment a le plus consommé est <b>{{months[values[1]]}}.</b></p>
  </div>
</template>

<script>
export default {
  props: ['values'],
  data: () => ({
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  }),
  computed: {
  },
  methods: {
    colorCalc (val) {
      if(val == -1) return 'E';
      else if (val < 40) return 'G3';
      else if (val < 80) return 'G2';
      else if (val < 120) return 'G1';
      else if (val < 160) return 'Y';
      else if (val < 200) return 'O2';
      else if (val < 240) return 'O1';
      else return 'R';
    },
    legendCalc(val) {
      if(val == -1) return '';
      else if (val < 40) return 'A';
      else if (val < 80) return 'B';
      else if (val < 120) return 'C';
      else if (val < 160) return 'D';
      else if (val < 200) return 'E';
      else if (val < 240) return 'F';
      else return 'G';
    }
  },
  mounted() {
  }
}
</script>
<style>


.MONTHSTRIPE {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 0 10px 7.6%;
  gap: 10px;
  width: 100%;
  height: 50px;
}

.MONTHRECT {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  gap: 10px;

  width: 7.6%;
  height: 30px;

  background: #D9D9D9;
  border-radius: 5px;
}

.MONTHLEGEND {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  /* or 20px */

  letter-spacing: 1.1px;
  color: #FFFFFF;
}



</style>