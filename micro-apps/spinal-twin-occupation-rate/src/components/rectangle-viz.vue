<!--
Copyright 2022 SpinalCom - www.spinalcom.com
This file is part of SpinalCore.
Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.
This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.
If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <div>
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      "
    >
      <div>
        <h6 v-if="element_type == 'BATIMENT'" class="next_persentage">
          <span class="persentage">{{ occupancy_persentage }} %</span> DU
          BATIMENT est occupé
        </h6>
        <h6 v-if="element_type === 'BUREAUX'" class="next_persentage">
          <span class="persentage">{{ occupancy_persentage }} %</span> des
          BUREAUX SONT OCCUPÉS
        </h6>
        <h6 v-if="element_type === 'SALLES DE REUNION'" class="next_persentage">
          <span class="persentage">{{ occupancy_persentage }} %</span> DES
          SALLES DE REUNION SONT OCCUPÉES
        </h6>
        <h6 v-if="element_type === 'BULLES'" class="next_persentage">
          <span class="persentage">{{ occupancy_persentage }} %</span> DES
          BULLES SONT OCCUPÉES
        </h6>
      </div>
      <div
        style="
          top: 513px;
          left: 1098px;
          width: 168px;
          height: 13px;
          /* UI Properties */
          text-align: left;
          font: normal normal normal 11px/13px Charlevoix Pro;
          letter-spacing: 1.1px;
          color: #949da6;
          opacity: 1;
        "
      >
        <span class="surface">{{ area }}m² de surface totale</span>
      </div>
    </div>
    <table style="width: 100%; overflow-x: auto; margin: auto">
      <tr v-if="display_levels_row" style="width: 100%; margin: auto">
        <td
          v-for="item in floorOccupancyValues"
          :key="item.name"
          style="
            text-align: center;
            width: calc(100% / 11);
            color: #214353;
            letter-spacing: 0.7px;
            height: 10px !important;
            font-size: 9px !important;
          "
        >
          {{ item.name }}
        </td>
      </tr>
      <tr style="height: 55px; width: 100%; margin: auto">
        <td
          v-for="item in floorOccupancyValues"
          :key="item.name"
          style="height: 5px; vertical-align: bottom; width: calc(100% / 11)"
        >
          <div
            v-if="color"
            class="rectangle"
            :style="{ 'background-color': color , height: item.value + '%' }"
            style="width: 100%"
          ></div>
          <div
            v-else
            class="rectangle black"
            :style="{ height: item.value + '%' }"
            style="width: 100%"
          ></div>
        </td>
      </tr>
      <tr style="height: auto; width: 100%; margin: auto">
        <td
          v-for="item in floorOccupancyValues"
          :key="item.name"
          style="
            text-align: center;
            width: calc(100% / 11);
            color: #214353 ;
            letter-spacing: 0.7px;
            height: 10px !important;
            font-size: 9px !important;
          "
        >
          {{ item.value + "%" }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>

export default {
    props: {
      color: {
        type: String
      },
      display_levels_row: {
        type: Boolean
      },
      occupancy_persentage: {
        type: String
      },
      area: {},
      floorOccupancyValues: {
        type: Array
      },
      //element type :  Bâtiment, Bureaux, Salles de réunion, Bulles ...Ect
      element_type: {}
  },
    
    data() {
      return {};
    }
};
  
</script>
<style scoped>
.rectangle {
  width: 50px;
  border-radius: 5px;
  margin-top: 30%;
  font-family: "charlevoixpro" !important;
}
.black {
  background-color: #14202c !important;
  font-family: "charlevoixpro" !important;
}
td,
h6 {
  font-family: "charlevoixpro" !important;
}
.persentage {
  top: 503px;
  left: 56px;
  width: 49px;
  height: 24px;
  /* UI Properties */
  text-align: left;
  font: normal normal normal 20px/24px Charlevoix Pro;
  letter-spacing: 1px;
  color: #14202c;
  opacity: 1;
}
.surface {
  top: 0px;
  left: 58px;
  width: 109px;
  height: 13px;
  /* UI Properties */
  text-align: left;
  font: normal normal normal 11px/13px Charlevoix Pro;
  letter-spacing: 1.1px;
  color: #949da6;
}
.next_persentage {
  top: 513px;
  left: 111px;
  width: 369px;
  height: 13px;
  /* UI Properties */
  text-align: left;
  font: normal normal normal 11px/13px Charlevoix Pro;
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
}
</style>
