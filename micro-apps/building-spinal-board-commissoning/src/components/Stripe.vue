<template>
  <div class="main-stripe">
    <div v-for="(item, idx) in configLegend" :key="item.name" :style="{width: item.percent + '%', height: '100%', zIndex: idx}">    
      <span>{{ item.name }}</span>
      <v-tooltip top :color="item.color" >
        <template v-slot:activator="{ on, attrs}">
          <div v-bind="attrs" v-on="on" style="width:100%; height: 100%; border-radius: 5px;" :style="{backgroundColor: item.color}"></div>
        </template>
        <span>{{ item.name }} : {{ item.value }} ({{ item.percent }}%)</span>
      </v-tooltip>
    </div>

  </div>
</template>

<script lang="ts">
import { config } from "../../config";
import { parseRegex } from "../services";

export default {
  name: "Stripe",
  data() {
    return {
      stripeList: [] as any[],
      configLegend: [] as { name: string; color: string; value: number, percent?: number }[], // Utilisation d'un tableau
    };
  },
  computed: {
    data() {
      return this.$store.state.appDataStore.StripeDataList;
    }
  },


watch: {
 data: {
  handler(newData) {
    this.stripeList = newData;
    this.getStripeData();
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
    async getStripeData() {
    const stripLegend = config.bilan.timeline;
    const source = config.sources.find((src) => src.id === stripLegend.sourceId);
    const configL = stripLegend.setup.legend;
    const type = stripLegend.setup.type;
    let seen = new Map();
    let duplicate: any = [];
    let warning: any = [];
    let missing: any = [];
    this.configLegend = [];
    if (this.stripeList) {
      for (const stripe of this.stripeList) {
        const value = stripe?.value;

        if (type === "regex") {
          const regex = parseRegex(stripLegend.setup.value);
          // Vérifie si la regex existe et fonctionne correctement

          if (value === "undefined" || value === "") {
            missing.push(value);
          } else {
            if (regex.test(value)) {
              if (seen.has(value)) {
                const count = seen.get(value);
                seen.set(value, count + 1);
               
              } else {
                seen.set(value, 1);
              }
            } else {
              warning.push(value);
            }
          }
        }
      }
    }

    // Retirer les éléments du Set seen qui sont présents dans le tableau duplicate
    
   seen.forEach((value, key) => {
      if(value > 1) {
        seen.delete(key);
        duplicate.push(value);
      }
   })
   const duplicatesum = duplicate.reduce((a: any, b: any) => a + b, 0);

    if (seen.size > 0) {
      const success_naming = stripLegend.setup.legend?.find((config) => config.type === "success");
      const item = {
        name: success_naming?.name || "Success",
        color: success_naming?.color || "#00ff00",
        value: seen.size
      };
      this.configLegend.push({ name: item.name, color: item.color, value: item.value });
    }

    if (warning.length > 0) {
      const warning_naming = stripLegend.setup.legend?.find((config) => config.type === "warning");
      if (warning_naming) {
        const item = {
          name: warning_naming?.name || "Warning",
          color: warning_naming?.color || "#ffcc00",
          value: warning.length
        };
        this.configLegend.push({ name: item.name, color: item.color, value: item.value });
      }
    }
    if (missing.length > 0) {
      const missing_naming = stripLegend.setup.legend?.find((config) => config.type === "missing");
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
      console.log('configLegend: ', this.configLegend)

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