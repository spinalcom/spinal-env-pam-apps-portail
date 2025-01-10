<template>
  <div style="width: 100%; height: 100%;">
    <v-data-table
    style="height: 100%"
    mobile-breakpoint="0"
    :headers="headers"
    :items="context"
    :items-per-page="15"
    fixed-header
    :footer-props="{
    'items-per-page-text':'Lignes par page',
    'page-text': '',
    'items-per-page-all-text': 'Toutes'
  }"
  >
  <template v-slot:[`item.floor`]="{ item }">
    <div class="font-table">{{item.floor}}</div>
  </template>
  <template v-slot:[`item.name`]="{ item }">
    <div class="font-table">{{item.name}}</div>
  </template>
  <template v-slot:[`item.monitorability`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="thresholdColor(item.monitorabilityValue)" :text="checkMonitorability(item.monitorability)"/>
  </template>
  <template v-slot:[`item.actionable`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="positiveColor(item.actionable, 70)" :text="(typeof item.actionable!=='undefined')? parseInt(item.actionable.toFixed(0)) +'%': 'indéfini' " />
  </template>
  <template v-slot:[`item.default`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="negativeColor(item.default, 30)" :text="(typeof item.default!=='undefined')? parseInt(item.default.toFixed(0)) +'%': 'indéfini'"/>
  </template>
  <template v-slot:[`item.availability`]="{ item }">
    <SmallLegend class="ml-3" :size="11" :color="positiveColor(item.availability, 70)" :text="(typeof item.availability!=='undefined')? parseInt(item.availability.toFixed(0)) +'%': 'indéfini'"/>
  </template>
</v-data-table>
  </div>
</template>


<script>
import SmallLegend from './SmallLegend.vue';
export default {
  components: {
    SmallLegend,
  },
  props: ['context'],
  data: () => ({
    headers: [
      // {
      //   text: 'Etage',
      //   align: 'start',
      //   sortable: false,
      //   value: 'floor',
      // },
      { text: 'Etage', value: 'floor', align: 'center' },
      { text: 'Nom', value: 'name' },
      { text: 'Convention de nommage', value: 'monitorability' },
      { text: 'Taux de données reçues', value: 'actionable' },
      { text: 'Taux de données en défaut reçues', value: 'default' },
      { text: 'Taux de disponibilité', value: 'availability' },
    ],
  
  }),
  methods: {
    positiveColor(val, threshold) {
      if(typeof val =='undefined') return '#898F95'
      if(val<threshold) return '#FF4242';
      return '#14202C';
    },
    negativeColor(val, threshold) {
      if(typeof val =='undefined') return '#898F95'
      if(val<threshold) return '#14202C';
      return '#FF4242';
    },
    //14202C', '9830F2', 'EF8BC5', 'FF4242
    thresholdColor(val) {
      if(typeof val =='undefined') return '#898F95';
      if(val<5){
        return '#898F95';
      }
        else if(val<10){
          return '#EF8BC5';
        }
          else if(val<20){
            return '#9830F2';
          }
            else{
              return '#14202C';
            }
    },
    checkMonitorability(monitorabily) {
      if (['OK', 'NOK', 'CONVENTION DE NOMMAGE INCORRECTE', 'DONNÉES NON REMONTÉES'].includes(monitorabily))
      return monitorabily;
      return 'indéfinie';
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.font-table {
  font: normal normal normal 11px/13px Charlevoix !important;
  letter-spacing: 1.1px;
  color: #14202C;
  opacity: 1;
  box-shadow: none !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.v-data-table {
  display: flex;
  flex-direction: column;
}
::v-deep .v-data-table__wrapper {
  flex-grow: 1;
  height: 0;
  overflow-y: auto !important;
}

::v-deep th {
  height: 16px !important;
  font-size: 10px !important;
  color: #214353 !important;
}

::v-deep td {
  font-size: 14px !important;
  color: #14202C !important;
  background-color: #F4F4F4;
  border-bottom: 1px solid white !important;
  border-right: 1px solid white !important;
}

::v-deep tr:hover td {
  background-color: #f0f0f0 !important;
}

::v-deep .v-icon__svg {
  fill: #214353 !important;
}

::v-deep .v-list .v-list-item--active, .v-list .v-list-item--active .v-icon {
  background-color: #2f5321 !important;
}

::v-deep .v-text-field.v-input--is-focused > .v-input__control > .v-input__slot:after{
  color: #214353;
}

::v-deep .v-list-item--link:before {
  background-color: #1500ff !important;
}

::v-deep .v-application .primary--text {
  color: #14202C !important;
  caret-color: #14202C !important;
  background-color: #1500ff !important;
}
</style>