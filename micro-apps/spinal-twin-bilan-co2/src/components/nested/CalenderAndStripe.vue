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
              <span v-for="i in monthDays(j)" :key="'d'+i"><div class="RECT unset"></div></span>
            </div>
          </td>
        </tr>
      </table>
      <p class="CALMAX">Le jour le plus où le batiment a le plus consommé est le <b>mardi vendredi 10 février.</b></p>
    </div>
    <MonthlyStripe/>
  </div>
</template>

<script>
import MonthlyStripe from './MonthlyStripe.vue';
export default {
  components: {
    MonthlyStripe
  },
  data: () => ({
    year: 2022
  }),
  methods: {
    monthOffset(month) {
      return ( 6 + new Date (this.year, month-1, 1).getDay()) % 7;
    },
    monthDays(month) {
      return new Date (this.year, month, 0).getDate();
    }
  }
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
  background-color: #D9D9D9 !important;
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