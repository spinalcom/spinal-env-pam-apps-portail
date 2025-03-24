<template>
  <div style="width: 100%; height: 100%;">
    <v-data-table
    style="height: 100% !important; overflow: hidden; overflow-y: auto;"
    mobile-breakpoint="0"
    :headers="headers"
    :items="item"
    :items-per-page="10"
    fixed-header
    :footer-props="{
    'items-per-page-text':'Lignes par page',
    'page-text': '',
    'items-per-page-all-text': 'Toutes'
  }"
  >
  <!-- <template v-slot:[`item.floorName`]="{ item }">
    <div class="font-table">{{item.floor}}</div>
  </template>
  <template v-slot:[`item.name`]="{ item }">
    <div class="font-table">{{item.name}}</div>
  </template> -->
   <template  v-for="header in headers"  v-slot:[`item.${header.value}`]="{value}" >
        <template v-if="header.isEndpoint">
            <SmallLegend class="ml-3" :size="11" :color="getColor(value)" :text="`${value}`"/>
        </template>
        <template v-else-if="header.isConvention">
            <div
            style="text-align: center; border-radius: 5px;"
              class="font-table">{{ value }}</div>
        </template>
        <template v-else>
            <div class="font-table
            ">{{value}}</div>
        </template> 

   </template>
  </v-data-table>
  </div>
</template>

<script lang="ts">
import SmallLegend from './SmallLegend.vue';
import {config} from '../../config'
export default {
    name: 'SpinalTable',
    components: {
        SmallLegend,
    },
    props: {
        item: {
            type: [] as any[],
            required: true
        },
        headers: {
            type: [] as any[],
            required: true
        }
    },
    data() {
        return {
        };
        },
        
    methods: { 
        getColor(currentValue: number): string {
            if (currentValue < 50) {
            return '#FF000B'; // Rouge pour les valeurs inférieures à 50
            } else if (currentValue >= 50 && currentValue < 80) {
            return '#EF8BC5'; // Rose pour les valeurs entre 50 et 80
            } else {
            return '#14202C'; // Bleu foncé pour les valeurs supérieures ou égales à 80
            }
        },
        // checkConvention(value: string) {
        //     if(config.bilan.timeline.setup.config){
        //         return {
        //             backgroundColor: 'transparent',
        //             color: '#14202C'
        //         };
        //     }
        //     else {
        //         return {
        //           backgroundColor: '#9830F2',
        //           color: '#ffffff'
        //         };
        //     }
        // }

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


::v-deep tr:first-child th{
  border: none !important;
  outline: none !important;
  color: #214353 !important;
  font-size: 10px !important;
  height: 16px !important;
  border-bottom: 1px solid white !important;
  border-right: 1px solid white !important;
  border-top: 1px solid white !important;

}
::v-deep .v-data-table th {
  height: 16px !important;
  font-size: 10px !important;
  color: #214353 !important;
  border: none !important;
}
::v-deep thead th .text-start .sortable {
  border: none !important;
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
::v-deep tbody {
  padding: 10px !important;
}
::v-deep tbody tr  td:first-child {
    border-radius: 7px 0px 0px 7px !important;
}
::v-deep tbody tr  td:last-child {
    border-radius: 0px 7px 7px 0px !important;
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