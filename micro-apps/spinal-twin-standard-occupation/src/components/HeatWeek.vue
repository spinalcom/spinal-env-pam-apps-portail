<template>
<v-card class="bar-card-w  d-flex flex-shrink-1 flex-column" >
    <v-card-title class="card-title flex-shrink-1 justify-space-between">
      <p class="mb-0" style="padding: 10px;">
        {{ title }}
      </p>
    </v-card-title>

    <div class="CALHEAT">
      <table class="CALTABLE-week">
        <tr>
          <td width="70"></td>
          <td class="CALHEAD">0h</td>
          <td class="CALHEAD"> </td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD">6h</td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD">12h</td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD">18h</td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
          <td class="CALHEAD"></td>
        </tr>
        <tr>
          <td class="WEEKDAYS" width="70">
            <p class="CALDAY mb-0">Lundi</p>
            <p class="CALDAY mb-0">Dimanche</p>
          </td>
          <td v-for="j in 24" :key="j">
            <div class="CALMONTH">
              <span v-for="i in 7" :key="'d'+i">
                <v-tooltip bottom :open-delay="0">
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                    >
                    <div class="RECT unset" :class="'B'"></div>
                  </span>
                  </template>
                  <!-- <span v-if="(results.d[j-1][i-1]!=-1)">{{`${i}/${j}/${results.y} :`}} <b>{{results.d[j-1][i-1].toFixed(1)}}</b> {{ unit.name }}</span>
                  <span v-else>{{`${i}/${j}/${results.y} :`}} <b>-</b> {{ unit.name }}</span> -->
                  <span>220 <b>-</b> V</span>
                </v-tooltip>
              </span>
            </div>
          </td>
        </tr>
        <tr><td style="color: transparent;">a</td></tr>
        <tr>
          <td colspan="25">
            <b>9h</b> - <b>10h</b> est le créneau d'heures pleines 
            <br>
            <b>12h</b> - <b>13h</b> et <b>18h</b> - <b>7h</b> sont les créneaux d'heures creuses
          </td>
        </tr>
      </table>
    </div>
</v-card>
</template>

<script>
export default {
    name: 'HeatWeek',
    props: {
        // data: {required: true},
        // source: {required: true}
    },
    mounted() {
    },
    data() {
        return {
            title: 'Titre',
        }
    }
}
</script>

<style>
.bar-card-w {
  width: 100%;
  background-color: #f9f9f9;
  font-family: "Charlevoix Pro";
  font-size: 14px;
  min-height: 220px !important;
  background: #f9f9f9;
  border-radius: 10px !important;
  box-shadow: 0px 3px 10px #49545C29 !important;
  padding-bottom: 20px;
}

.card-title {
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
  font-size: 20px !important;
  height: fit-content !important;
  padding: 0 !important;
}

.CALHEAT {
  font-family: "Charlevoix Pro";
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  width: 100%;
}

.CALTABLE-week {
  font-family: "Charlevoix Pro";
  max-width: 410px !important;
  width: 100%;
  margin-right: auto;
  margin-left: auto;
}

.CALHEAD {
  font-family: "Charlevoix Pro";
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 13px;
  color: #214353;
  font-size: 9px;
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
  font-family: "Charlevoix Pro";
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 13px;
  color: #214353;
}

.CALMAX {
  font-family: "Charlevoix Pro";
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