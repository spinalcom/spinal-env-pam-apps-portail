<template>
  <div class="MAINCOMPONENT">
    <div class="MCTITLE">
      <p class="MCTEXT">DIAGNOSTIC PAR JOUR</p>
    </div>

    <div class="CALHEAT">
      <table class="CALTABLE">
        <tr>
          <td width="70"></td>
          <td class="CALHEAD">Jan</td>
          <td class="CALHEAD">Fev</td>
          <td class="CALHEAD">Mar</td>
          <td class="CALHEAD">Avr</td>
          <td class="CALHEAD">Mai</td>
          <td class="CALHEAD">Jui</td>
          <td class="CALHEAD">Jui</td>
          <td class="CALHEAD">Aou</td>
          <td class="CALHEAD">Sep</td>
          <td class="CALHEAD">Oct</td>
          <td class="CALHEAD">Nov</td>
          <td class="CALHEAD">Dec</td>
        </tr>
        <tr>
          <td class="WEEKDAYS" width="70">
            <p class="CALDAY mb-0">Lundi</p>
            <p class="CALDAY mb-0">Dimanche</p>
          </td>
          <td v-for="j in 12" :key="j">
            <div class="CALMONTH">
              <span v-for="i in monthOffset(j)" :key="'o'+i"><div class="RECT"></div></span>
              <span v-for="i in monthDays(j)" :key="'d'+i">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                    >
                    <div class="RECT unset" :class="colorCalc(results.d[j-1][i-1])"></div>
                  </span>
                  </template>
                  <span v-if="(results.d[j-1][i-1]!=-1)">{{`${i}/${j}/${results.y} :`}} <b>{{results.d[j-1][i-1]}}</b> Kg/Co2/m²</span>
                  <span v-else>{{`${i}/${j}/${results.y} :`}} <b>-</b> Kg/Co2/m²</span>
                </v-tooltip>
              </span>
            </div>
          </td>
        </tr>
      </table>
      <p class="CALMAX">Le jour le plus où le batiment a le plus consommé est le <b>dimanche 2 janvier.</b></p>
    </div>
    <MonthlyStripe :values="monthlyValues"/>
  </div>
</template>

<script>
import MonthlyStripe from './MonthlyStripe.vue';
export default {
  components: {
    MonthlyStripe
  },
  props: ['results'],
  data: () => ({
    d: 0,
  }),
  computed:{
    monthlyValues() {
      let m = [];
      let missing;
      let sum;
      let res = 0;
      let maxPos = [];
      for (let i=0; i<12; i++) {
        missing = 0;
        sum = 0;
        sum += this.results.d[i].reduce((a,b) => {
          if (b!=-1) {
            return a+b;
          }
          else {
            missing++;
            return a;
          }
        })
        maxPos.push(sum);
        res = sum/(this.results.d[0].length-missing);
        m.push(res);
      }
        return [m, maxPos.indexOf(Math.max(...maxPos))];
  }
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
    monthOffset(month) {
      return ( 6 + new Date (this.results.y, month-1, 1).getDay()) % 7;
    },
    monthDays(month) {
      return new Date (this.results.y, month, 0).getDate();
    }
  },
}
</script>

<style>
.MAINCOMPONENT {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;

  width: 100%;
  flex-grow: 1;
  background: #F9F9F9;
  border: 1px solid #F7F7F7;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.25);
  border-radius: 10px;
}

.MCTITLE {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  width: 100%;
  height: 50px; 
  border-bottom: 1px solid #F9F9F9;
}

.MCTEXT {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 17px;
  letter-spacing: 1.1px;
  color: #14202C;
  margin-bottom: 0 !important;
}

.CALHEAT {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  width: 100%;
}

.CALTABLE {
  width: 100%;
}

.CALHEAD {
  width: 7.7% !important;
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 13px;

  color: #214353;
}

.WEEKDAYS {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 172px;
  padding-left: 10px;
}

.CALMONTH {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 3px;
  height: 172px !important;
  width: 7.7% !important;
}

.RECT {
  width: 17px;
  height: 22px;
  background: transparent;
  border-radius: 5px;
}
.unset {
  background: #D9D9D9;
}

.CALDAY {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 13px;
  color: #214353;
}

.CALMAX {
  font-family: 'charlevoix';
  padding-left: 7.6%;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 17px;
  letter-spacing: 1.1px;
  color: #14202C;
  width: 100%;
}
</style>