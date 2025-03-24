<template>
  <div class="main-stripe">
    <div v-for="(item, idx) in configLegend" :key="item.name" :style="{width: item.value + '%', height: '100%', zIndex: idx }">    
      <span>{{ item.name }}</span>
      <v-tooltip top :color="item.color" >
        <template v-slot:activator="{ on, attrs}">
          <div v-bind="attrs" v-on="on" style="width:100%; height: 100%; border-radius: 5px;" :style="{backgroundColor: item.color}"></div>
        </template>
        <span>{{ item.name }} : {{ item.value }}</span>
      </v-tooltip>
    </div>

  </div>
</template>

<script lang="ts">
import { config } from "../../config";
import { MutationTypes } from "../services/store/appDataStore/mutations";

export default {
  name: "Stripe",
  data() {
    return {
      stripeList: [] as any[],
      configLegend: [] as { name: string; color: string; value: number }[], // Utilisation d'un tableau
    };
  },
  computed: {
    StripeData() {
      return this.$store.state.appDataStore.StripeDataList;
    },
    data() {
      return this.$store.state.appDataStore.data;
    }
  },
  async mounted() {
    console.log("stripe data: ", this.stripeList);
},

watch: {
  StripeData: {
    handler(newData) {
      if (Array.isArray(newData) && newData.length > 0) {
        this.stripeList = newData; // Met à jour stripeList
        this.getStripeData(); // Traite les données après mise à jour
      }
    },
    deep: true,
    immediate: true // Exécuter au montage si les données existent déjà
  }
},


methods: {
    async retriveStripeData() {
      const stripe = this.$store.state.appDataStore.StripeDataList;
      if (stripe) {
        return stripe;
      }
    },
    async getStripeData() {
      const stripLegend = config.bilan.timeline;
    const source = config.sources.find((src) => src.id === stripLegend.sourceId);
    const configL = stripLegend.setup.config;
    const type = stripLegend.setup.type;
    let seen = new Set();
    let duplicate: any = [];
    let warning: any = [];
    let missing: any = [];
    if(this.stripeList) {      
      for (const stripe of this.stripeList) {
         const value = stripe?.value;    
      
        if (type === "regex") {
          const regex : RegExp= stripLegend.setup.config[0].value as RegExp;
          // Vérifie si la regex existe et fonctionne correctement
          
          
          if (!value) {
            missing.push(value);
            
          } else {
                if (regex.test(value)) {
                    
                    if(seen.has(value)) {
                      duplicate.push(value);
                    } else {
                      seen.add(value);
                    }
                  } else {
                    warning.push(value);
                  }
            }
          }          
    }
    if(seen.size > 0) { 
      const success_naming = stripLegend.setup.config.find((config) => config.type === "success");
      const item = {
        name: success_naming?.name || "Success",
        color: success_naming?.color || "#00ff00",
        value: seen.size
      };
      this.configLegend.push({ name: item.name, color: item.color, value: item.value });

    }
    
    if(warning.length > 0) {
      const warning_naming = stripLegend.setup.config.find((config) => config.type === "warning");
      if (warning_naming) {
        const item = {
          name: warning_naming?.name || "Warning",
          color: warning_naming?.color || "#ffcc00",
          value: warning.length
        };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    }
    if(missing.length > 0) {
      const missing_naming = stripLegend.setup.config.find((config) => config.type === "missing");
      if (missing_naming) {
        const item = {
          name: missing_naming?.name || "Missing",
          color: missing_naming?.color || "#ff0000",
          value: missing.length
        };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    }

    if (duplicate.length > 0) {
      const duplicate_naming = stripLegend.setup.config.find((config) => config.type === "dual");
      if(duplicate_naming) { 
        const item = {
        name: duplicate_naming?.name || "Duplicate",
        color: duplicate_naming?.color || "#ff0000",
        value: duplicate.length
      };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    };
   
    console.log('configLegend', this.configLegend);
  }
    }
  }
};
</script>


<style scoped>
.main-stripe {
  width: 100%;
  height: 100%;
  padding: 10px;
  color: #14202C;
  display: flex;
  flex-direction: row;
  justify-content:flex-start;
  padding: 10px;
  align-items: flex-start ;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16);
  font-family: Charlevoix;
  font-size: 14px;
  overflow: auto;
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