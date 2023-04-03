<template>
  <div style="width: 100%">
    <div class="MCTITLE">
      <p class="MCTEXT">Bilan par mois</p>
    </div>
    <div class="MONTHSTRIPE">
      <div v-for="i in 12" :key="i" class="MONTHRECT" :class="colorCalc(values[0][i-1])"><span class="MONTHLEGEND">{{legendCalc(values[0][i-1])}}</span></div>
    </div>
    <p class="CALMAX LP">{{ legend }} <b>{{months[values[1]]}}.</b></p>
  </div>
</template>

<script>
import env from '../../config';
export default {
  props: ['values'],
  data: () => ({
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    max: 0,
    min: 0,
    interval: 0,
    legend: env.monthStripeLegend
  }),
  mounted() {
    console.log(this.values);
    const flattenedArr = this.values[0].filter(val => val >= 0)
    this.max = Math.max(...flattenedArr);
    this.min = Math.min(...flattenedArr);
    this.min = this.min < 0 ? 0 : this.min;
    this.interval = (this.max - this.min) / 7;
    console.log('Min:',this.min, ', Max:', this.max, ', Interval:', this.interval);
  },
  computed: {
  },
  methods: {
    colorCalc (val) {
      if(val < 0) return 'E';
      else if (val < this.min + this.interval || val == 0) return 'G3';
      else if (val < this.min + this.interval * 2) return 'G2';
      else if (val < this.min + this.interval * 3) return 'G1';
      else if (val < this.min + this.interval * 4) return 'Y';
      else if (val < this.min + this.interval * 5) return 'O2';
      else if (val < this.min + this.interval * 6) return 'O1';
      else return 'R';
    },
    legendCalc(val) {
      console.log(`Min val: ${this.min}, the interval is ${this.interval}, and the current val is ${val}`);
      if(val < 0) return '';
      else if (val < this.min + this.interval) return 'A';
      else if (val < this.min + this.interval * 2) return 'B';
      else if (val < this.min + this.interval * 3) return 'C';
      else if (val < this.min + this.interval * 4) return 'D';
      else if (val < this.min + this.interval * 5) return 'E';
      else if (val < this.min + this.interval * 6) return 'F';
      else return 'G';
    }
  },
  watch: {
    values(v) {
      console.log(v);
    }
  }
}
</script>
<style>


.MONTHSTRIPE {
  font-family: "Charlevoix Pro";
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 0 10px 7.6%;
  gap: 10px;
  width: 100%;
  height: 50px;
}

.MONTHRECT {
  font-family: "Charlevoix Pro";
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
  font-family: "Charlevoix Pro";
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  /* or 20px */

  letter-spacing: 1.1px;
  color: #FFFFFF;
}



</style>