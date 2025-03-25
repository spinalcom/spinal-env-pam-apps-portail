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
 
   <template  v-for="header in headers"  v-slot:[`item.${header.value}`]="{value}" >
        <template v-if="header.isEndpoint">
            <div :style="{width: 20 + 'px', height: 20 + 'px', borderRadius: 7 + 'px', backgroundColor: item.color,}" style="background-color: blue;"></div>
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
import { config } from '../../config';
import { get } from 'http';
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
        attributeList: {
          type: [] as any[],
          required: false
        },
        headers: {
            type: [] as any[],
            required: true
        }
    },
    data() {
        return {
          attrbutes: this.attributeList,
          duplicate: [] as any[],
          warning: [] as any[],
          missing: [] as any[],
          seen: new Set()

        };
        },


   watch: {
    attributeList: {
      handler(newData) {
        if (Array.isArray(newData) && newData.length > 0) {
          this.attrbutes = newData;
          this.getStripeData();

        }
      },
      deep: true,
      immediate: true
    }
   },
        
    methods: {
      
      async getStripeData() {
    const stripLegend = config.bilan.timeline;
    const source = config.sources.find((src) => src.id === stripLegend.sourceId);
    const configL = stripLegend.setup.legend;
    const type = stripLegend.setup.type;
     this.seen = new Set();
     this.duplicate = [];
     this.warning = [];
     this.missing = [];
    if(this.attrbutes) {
      for (const stripe of this.attrbutes) {
         const value = stripe?.value;    
      
        if (type === "regex") {
          const regex : RegExp= stripLegend.setup.value as RegExp;
          // Vérifie si la regex existe et fonctionne correctement
          
          
          if (!value) {
            this.missing.push(value);
            
          } else {
                if (regex.test(value)) {
                    
                    if(this.seen.has(value)) {
                      this.duplicate.push(value);
                    } else {
                      this.seen.add(value);
                    }
                  } else {
                    this.warning.push(value);
                  }
            }
          }          
    }
  }
},
 
getColor(currentValue: any) {
    // Vérifier si currentValue est un nombre
    const numericValue = parseFloat(currentValue);
  

    if (!isNaN(numericValue)) {
      // currentValue est un nombre
      if (numericValue < 50) {
        return '#FF000B'; // Rouge pour les valeurs inférieures à 50
      } else if (numericValue >= 50 && numericValue < 80) {
        return '#EF8BC5'; // Rose pour les valeurs entre 50 et 80
      } else {
        return '#14202C'; // Bleu foncé pour les valeurs supérieures ou égales à 80
      }
    } else if (typeof currentValue === 'string') {
      // currentValue est une chaîne de caractères
      if (this.duplicate.includes(currentValue)) {
        const src = config.bilan.timeline.setup.legend?.find((config) => config.type === "dual");
        return src?.color; // Rouge pour les valeurs en double
      } else if (this.warning.includes(currentValue)) {
        const src = config.bilan.timeline.setup.legend?.find((config) => config.type === "warning");
        return src?.color;
      } else if (currentValue === 'undefined' || currentValue === 'null') {
        const src = config.bilan.timeline.setup.legend?.find((config) => config.type === "missing");
        return src?.color;
      } else {
        return '#14202C'; // Bleu foncé pour les autres valeurs
      }
    } else {
      // currentValue n'est ni un nombre ni une chaîne de caractères
      return '#000000'; // Noir par défaut
    }
  }
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