<template>
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <div  style="width: 100%; height: calc(100% / 2); display: flex; gap: 16px; padding: 10px; margin-left: 20px; align-items: center;">
      <div style="display: flex; flex-direction: row; align-items: center; gap: 5px;">
        <v-icon v-if="cancelFilter" @click="SetCancelFilter(false)" style="cursor: pointer; font-size: 20px; color: #14202C;">mdi-cancel</v-icon>
      </div>
      <div @click="filterReverse(item.name)" v-for="(item, idx) in configLegend" :key="idx" :style="{width: `max-content`, height: '100%', zIndex: idx, padding: '0 5px', cursor: 'pointer'}" >
        <SmallLegend  :color="item.color" :text="`${item.name}: ${item.value}`" :size="16"  />
      </div>
    </div>
    <div class="main-stripe">
      <div v-for="(item, idx) in configLegend" :key="item.name" :style="{width: item.percent + '%', height: '100%', zIndex: idx}">    
        <v-tooltip top :color="item.color" >
          <template v-slot:activator="{ on, attrs}">
            <div v-bind="attrs"
              @click.stop="filter(item.name)"
            v-on="on" style="width:100%; height: 100%; border-radius: 5px;" :style="{backgroundColor: item.color}"></div>
          </template>
          <span>{{ item.name }} : {{ item.value }} ({{ item.percent }}%)</span>
        </v-tooltip>
      </div>
    
    </div>

  </div>
</template>

<script lang="ts">
import data from "micro-apps/spinal-env-pam-apps-manager/src/store/data";
import { config } from "../../config";
import { ActionTypes } from "../interfaces/vuexStoreTypes";
import { parseRegex } from "../services";
import { MutationTypes } from "../services/store/appDataStore/mutations";
import SmallLegend from "./SmallLegend.vue";
import {memoize} from "lodash"




    



export default {
  name: "Stripe",
  components: {
    SmallLegend
  },
  data() {
    return {
      stripeList: [] as any[],
      configLegend: [] as { name: string; color: string; value: number, percent?: number }[],
      seen: new Map(),
      duplicate: [] as any[],
      warning: [] as any[],
      missing: [] as any[],
      filterData: [] as any[],
    };
  },
  computed: {
    data() {
      return this.$store.state.appDataStore.StripeDataList;
    },
    spaceSelected() {
      return this.$store.state.appDataStore.zoneSelected;
    },

    cancelFilter(){
      return this.$store.state.appDataStore.cancelFilter;
    }
  },


watch: {
 data: {
  handler(newData) {
    this.stripeList = newData;
    this.getStripeData();
  }
 },

  spaceSelected: {
    handler(newData) {
      this.stripeList = newData;
      this.getStripeData();
    }
  },

  cancelFilter: {
    handler(newData) {
      
      if (newData == false) {
        
        this.$store.dispatch(ActionTypes.RUN_WITH_LOADER, {
          message: "Récupération des données",
          task : async () => {
  try {
    const dataStore = this.$store.state.appDataStore.data;
    const stripLegend = config.bilan.timeline;

    const source = config.sources.find(
      (src) => src.id === stripLegend.sourceId
    );
    

    if (!source?.name) {
      console.warn("Source introuvable pour l'ID :", stripLegend.sourceId);
      return;
    }

    const sourceName = source.name.toLowerCase();

    // Affiche le loader avant le traitement
    this.$store.commit(MutationTypes.SET_LOADER, true);
    await this.$nextTick();

    this.$store.commit(MutationTypes.SET_LOADING, {
      completed: 0,
      total: dataStore.length,
      message: "Réinitialisation des filtres",
      percent: 0,
    });



    // Filtrage async avec batching + memoize
    const result: any = await this.filterBysource(dataStore, sourceName);

    // Met à jour les données filtrées
    this.stripeList = result;
    this.$store.commit(MutationTypes.SET_STRIPE_DATA, result);
    this.getStripeData(); // Si c’est une méthode du composant
    setTimeout(() => {
      this.$store.commit(MutationTypes.SET_LOADER, false);
      
    }, 200);
  } catch (err) {
    console.error("Erreur lors du filtrage des données :", err);
  }
}

        })
       }
    }
  }
},



methods: {
    async retriveStripeData() {
      const stripe = this.$store.state.appDataStore.StripeDataList;
      if (stripe) {
        return stripe;
      }
    },
     filterBysource (dataStore: any[], sourceName: string) {
  return new Promise((resolve) => {
    const result: any = [];
    let i = 0;
    const batchSize = 500;

    const processBatch = () => {
      const end = Math.min(i + batchSize, dataStore.length);
      for(; i < end; i++) {
        const el = dataStore[i];
        if(!Array.isArray(el.sources)) continue;

        const stripe = el.sources.find((st) => st.name?.toLowerCase() === sourceName);
        if(stripe) result.push(stripe);
      }
      // Mettre à jour la progression
      this.$store.commit(MutationTypes.SET_LOADING, {
        completed: i,
        total: dataStore.length,
        message: "Réinitialisation des filtres",
        percent: (i / dataStore.length) * 100,
      });

      if(i < dataStore.length) {
        setTimeout(processBatch, 0); // executer le prochain batch
      } else {
 
        // Mettre à jour la progression finale
        this.$store.commit(MutationTypes.SET_LOADING, {
          completed: dataStore.length,
          total: dataStore.length,
          message: "Réinitialisation des filtres terminée",
          percent: 100,
        });
       resolve(result); // renvoyer le résultat final

      }
    };
    processBatch();
  });
},
    
   createFilterSet: memoize(
      (values: any[]) => new Set(values),
      (values: any[]) => JSON.stringify([...values].sort())
   ),

   async filterReverse(value: string) {
    this.$store.commit(MutationTypes.SET_LOADER, true);
    await this.$nextTick();
    const filterData = this.$store.state.appDataStore.filterData;
    const onFiltered = filterData.find((item: any) => item.text === value);
    let filteredData: any = [];

    if (onFiltered?.value) {
    
    const valueSet = this.createFilterSet(onFiltered.value);
    this.$store.commit(MutationTypes.SET_LOADING, {
      completed: 0,
      total: 0,
      message: "Exécution du filtre",
      percent: 0,
    });
      let complete = 0;
      filteredData = this.stripeList.filter((item: any) => {
        complete++;
        this.$store.commit(MutationTypes.SET_LOADING, {
        
          });
          return !valueSet.has(item.value);
      });
}
      this.filterData = filteredData;
      setTimeout(() => {
        this.$store.commit(MutationTypes.SET_STRIPE_DATA, this.filterData);
        this.$store.commit(MutationTypes.SET_LOADER, false);
        this.$store.commit(MutationTypes.SET_CANCEL_FILTER, true);
      }, 50);
    

   },

    async filter(value: string) {
        this.$store.commit(MutationTypes.SET_LOADER, true);
        await this.$nextTick();

        const filterData = this.$store.state.appDataStore.filterData;
        
        const onFiltered = filterData.find((item: any) => item.text === value);
  

        let filteredData: any = [];

        if (onFiltered?.value) {
    
          const valueSet = this.createFilterSet(onFiltered.value);
          this.$store.commit(MutationTypes.SET_LOADING, {
            completed: 0,
            total: 0,
            message: "Exécution du filtre",
            percent: 0,
          });
        let complete = 0;
        filteredData = this.stripeList.filter((item: any) => {
          complete++;
          this.$store.commit(MutationTypes.SET_LOADING, {
           
          });
          return valueSet.has(item.value);
    });
  }

  this.filterData = filteredData;
  this.$store.commit(MutationTypes.SET_CANCEL_FILTER, true);

  setTimeout(() => {
    this.$store.commit(MutationTypes.SET_STRIPE_DATA, this.filterData);
    this.$store.commit(MutationTypes.SET_LOADER, false);
  }, 30);
},

    async getStripeData() {
    const stripLegend = config.bilan.timeline;
    const source = config.sources.find((src) => src.id === stripLegend.sourceId);
    const configL = stripLegend.setup.legend;
    const type = stripLegend.setup.type;
    this.seen = new Map();
    this.duplicate = [];
    this.warning = [];
    this.missing = [];
    this.configLegend = [];
    if (this.stripeList) {
      for (const stripe of this.stripeList) {
        const value = stripe?.value;

        if (type === "regex") {
          const regex = parseRegex(stripLegend.setup.value);
          // Vérifie si la regex existe et fonctionne correctement

          if (value === "undefined" || value === ""  || value === null) {
            this.missing.push(value);
          } else {
            if (regex.test(value)) {
              if (this.seen.has(value)) {
                const count = this.seen.get(value);
                this.seen.set(value, count + 1);
               
              } else {
                this.seen.set(value, 1);
              }
            } else {
              this.warning.push(value);
            }
          }
        }
      }
    }

    // Retirer les éléments du Set seen qui sont présents dans le tableau duplicate
    
   this.seen.forEach((value, key) => {
      if(value > 1) {
        this.seen.delete(key);
        this.duplicate.push(value);
      }
   })
   const duplicatesum = this.duplicate.reduce((a: any, b: any) => a + b, 0);

    if (this.seen.size > 0) {
      const success_naming = stripLegend.setup.legend?.find((config) => config.type === "success");
      const item = {
        name: success_naming?.name || "Success",
        color: success_naming?.color || "#00ff00",
        value: this.seen.size
      };
      this.configLegend.push({ name: item.name, color: item.color, value: item.value });
    }

    if (this.warning.length > 0) {
      const warning_naming = stripLegend.setup.legend?.find((config) => config.type === "warning");
      if (warning_naming) {
        const item = {
          name: warning_naming?.name || "Warning",
          color: warning_naming?.color || "#ffcc00",
          value: this.warning.length
        };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    }
    if (this.missing.length > 0) {
      const missing_naming = stripLegend.setup.legend?.find((config) => config.type === "missing");
      if (missing_naming) {
        const item = {
          name: missing_naming?.name || "Missing",
          color: missing_naming?.color || "#ff0000",
          value: this.missing.length
        };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    }

    if (this.duplicate.length > 0) {
      const duplicate_naming = stripLegend.setup.legend?.find((config) => config.type === "dual");
      if (duplicate_naming) {
        const item = {
          name: duplicate_naming?.name || "Duplicate",
          color: duplicate_naming?.color || "#ff0000",
          value: duplicatesum
        };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    }

    if(this.configLegend.length > 0) {
      const total = this.configLegend.reduce((sum, item) => sum + item.value, 0);
      this.configLegend = this.configLegend.map((item) => {
        return {
          ...item,
          percent: ((item.value / total) * 100).toFixed(2)
        };
      });

  }
 },
 SetCancelFilter(value: boolean) {
  this.$store.commit(MutationTypes.SET_CANCEL_FILTER, value);
  this.$store.commit(MutationTypes.SET_LOADER, false);
 }
  
}
};
</script>


<style scoped>
.main-stripe {
  width: 100%;
  height: calc(100% / 2);
  padding: 10px;
  color: #14202C;
  display: flex;
  flex-direction: row;
  justify-content:flex-start;
  padding: 5px;
  align-items: flex-start ;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16);
  font-family: Charlevoix;
  font-size: 14px;
  overflow: auto;
  gap: 1px;
}

.main-stripe div {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
}


.main-stripe span {
  color: #14202C;
  font-size: 14px;
  font-weight: 500;
  height: 16px;
  opacity: 1;
  width: 100%;
  font: normal normal normal normal 11px/13px Charlevoix Pro;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

</style>