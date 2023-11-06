<!--
Copyright 2023 SpinalCom - www.spinalcom.com

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
   <v-card elevation="4" class="cardContainer">
      <div class="dataContainer" v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected">
         <div class="detail_header">
            <div class="title_date">
               <div class="_title">{{config.title}}</div>
               <div class="date" title="recharger">
                  <v-btn rounded outlined color="primary" dark @click="regroupItemsAndCalculate(true)">
                     <v-icon>mdi-reload</v-icon>
                  </v-btn>
               </div>
            </div>

            <div class="gradient_content">
               <div class="indicators">
                  <div class="indicator">{{min}}</div>
                  <div class="indicator">{{max}}</div>
               </div>

               <div class="gradient_bar" :style="{background: gradientColor }"></div>
            
            </div>
            <div class="calcul_content">
               <div class="calcul">
                  <div class="select">
                     <v-select v-model="calculMode" :items="calculItems" height="30" background-color="#eaeef0" dense append-icon="" solo flat :hide-details="true">
                     <template v-slot:item="{item,index}">
                        <div style="display: flex;align-items: center;">
                           <div class="color" :style="{ background : '#14202c', width: '8px', height: '15px', marginRight: '5px' }"></div>
                           <div style="font-size: 13px;">{{ item }}</div>
                        </div>
                     </template>

                     <template v-slot:selection="{item,index}">
                        <div style="display: flex; align-items: center;">
                           <div class="color" :style="{height: '15px', background: '#14202c', borderRadius: '3px'}"></div>
                           <div style="font-size: 13px;">{{ item }}</div>
                        </div>
                     </template>
                     </v-select>
                  </div>

                  <div class="calculResult">
                     <div class="color" :style="{background : toltalColor}"></div>
                     <div class="value">{{ total | round }}</div>
                     <div class="value">{{ unit }}</div>
                     <div class="text">Pour l'étage {{ selectedZone.name }}</div>
                  </div>
               </div>
            </div>
         </div>

         <div class="detail_container">
            <GroupDataView v-for="(d,i) in data" :key="i" v-if="viewGroup(d)" :data="d" :config="config" :calculMode="calculMode" :unit="unit" @onClick="selectDataView"/>
         </div>
      </div>

      <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected">
         Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
      </div>

      <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
         <v-progress-circular
            :size="70"
            :width="3"
            color="purple"
            indeterminate
         ></v-progress-circular>
      </div>

      <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
         <div>
            <v-icon color="red" style="font-size: 5em" >mdi-alert-circle-outline</v-icon>
         </div>
         <div color="red">Quelque chose s'est mal passé ! Veuillez  
            <v-btn small outlined color="red" @click="retry">réessayer </v-btn>
         </div>
      </div>

   </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from 'vue-property-decorator';
import { PAGE_STATES } from "../../interfaces/pageStates";
import GroupDataView from './groupDataView.vue'
import Component from 'vue-class-component';
import { IConfig, calculTypes } from '../../interfaces/IConfig';
import { ISpaceSelectorItem } from 'global-components';
import { ActionTypes } from '../../interfaces/vuexStoreTypes';
import { calculItemsValue, calculateValue, getColor } from "../../services/calcul/calculItems";
import { INodeItemTree } from "../interfaces/INodeItem";

@Component({
   components: {
      GroupDataView
   },
   filters: {
      round(value) {
         try {
            var num = Number(value);
            var rounded = num.toFixed(2);
            return Number(rounded);
         } catch (error) {
            console.error(error);
            return "-";
         }
      }
   }
})

class InsightApp extends Vue {
   @Prop() config!: IConfig;
   @Prop() selectedZone: ISpaceSelectorItem;

   PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
   pageSate: PAGE_STATES = PAGE_STATES.loading;
   data: INodeItemTree[] = [];
   isBuildingSelected: boolean = true;
   calculMode: calculTypes = this.calculItems[0];
   total: number = 0;
   retry: Function;

   async mounted() {
      await this.retriveData();
   }


   

   viewGroup(d) {
      //  return (d?.children || []).length > 0
      return true;
   }

   async retriveData() {
      try {
         this.pageSate = PAGE_STATES.loading;
         const buildingId = localStorage.getItem("idBuilding");
         const promises = [this.$store.dispatch(ActionTypes.GET_GROUPS_ITEMS, { config: this.config, buildingId, forceUpdate: true })];
         if (["rooms", "equipments"].indexOf(this.config.regroupement) === -1) {
            promises.push(this.$store.dispatch(ActionTypes.GET_CATEGORIES_TREE, {  buildingId, forceUpdate: true,context : this.config.regroupement.context }))
         }

         const result = await Promise.all(promises);
         console.log(result)
         this.pageSate = PAGE_STATES.loaded;
      } catch (err) {
         console.error(err);
         this.retry = this.retriveData;
         this.pageSate = PAGE_STATES.error
      }
   }

   async regroupItemsAndCalculate(forceUpdate: boolean = false) {
      try {
         const playload = {
            config: this.config,
            item: this.selectedZone,
            forceUpdate
         }
      
         this.pageSate = PAGE_STATES.loading;
         const regrouped = await this.$store.dispatch(ActionTypes.REGROUP_ITEMS, playload);
         console.log("regrouped",regrouped)
         this.data = calculItemsValue(regrouped, this.calculMode);
         this.pageSate = PAGE_STATES.loaded;

      } catch (error) {
         console.error(error);
         this.retry = this.regroupItemsAndCalculate;
         this.pageSate = PAGE_STATES.error;
      }
      
   }

   selectDataView(item) {
      this.$emit("clickOnDataView", item)
   }

   @Watch("selectedZone")
   watchSelectedZone() {
      if (this.selectedZone.type === "building") {
         this.isBuildingSelected = true;
         this.data = [];
         return;
      }

      this.isBuildingSelected = false;

      this.regroupItemsAndCalculate()
   }

   @Watch("calculMode") 
   watchCaculMode() {
      this.data = calculItemsValue(this.data, this.calculMode);
   }

   @Watch("data")
   watchData() {
      if (this.config.sprites) this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);

      if (this.isBuildingSelected) return;

      const values = this.data.map(el => el.displayValue);
      this.total = calculateValue(values, this.calculMode);
      const itemsToColor = this.data.map(el => el.children || []).flat();

      if (this.config.sprites) {
         this.$store.dispatch(ActionTypes.ADD_SPRITES, { items: itemsToColor, buildingId: this.selectedZone.buildingId || this.selectedZone.staticId });
         return
      }
      
      this.$store.dispatch(ActionTypes.COLOR_ITEMS, { items: itemsToColor, buildingId: this.selectedZone.buildingId || this.selectedZone.staticId });
   }

   public get gradientColor(): string {
      const maxColor = this.config.legend.max.color;
      const minColor = this.config.legend.min.color;
      const medianColor = this.config.legend.median?.color;

      if (!medianColor) {
         return `linear-gradient(to right, ${minColor},  ${maxColor})`;
      }

      return `linear-gradient(to right, ${minColor} 25%, ${medianColor} 50%, ${maxColor} 75%)`;
   }

  public get min(): number {
    return this.config.legend.min.value;
  }

   public get max(): number {
    return this.config.legend.max.value;
   }

   public get calculItems() {
      return this.config.calculs || []
   }


   public get unit() {
      return this.config.source?.unit || ""
   }

   public get toltalColor() {
      return getColor({ displayValue: this.total }, this.config.legend);
   }

}

export { InsightApp };
export default InsightApp;

</script>
<style lang="scss">

   .cardContainer {
      width: 100%;
      height: 100%;

      $titleDateHeight : 40px;
      $gradientContentHeight : 40px;
      $calculContentHeight : 50px;

      .dataContainer {
         width: 100%;
         height: 100%;
         border-radius: 10px;
         padding: 10px;
         .detail_header {
            width: 100%;
            height: #{$titleDateHeight + $gradientContentHeight + $calculContentHeight};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .title_date {
               width: 100%;
               height: $titleDateHeight;
               display: flex;
               align-items: center;
               justify-content: space-between;
               ._title {
                  max-width: 50%;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  text-transform: uppercase;
                  font-size: 0.8em;
               }

               .date {}
            }
         }

         .gradient_content {
            width: 100%;
            height: $gradientContentHeight;
            .gradient_bar {
               width: 100%;
               height: 15px;
               border-radius: 5px;
            }

            .indicators {
               width: 100%;
               height: 15px;
               font-size: 11px;
               display: flex;
               justify-content: space-between;
            }
         }

         .calcul_content {
            width: 100%;
            height: $calculContentHeight;
            .calcul {
               width: 100%;
               height: 30px;
               display: flex;
               .select {
                  width: 35%;
                  min-height: unset;
                  margin-right: 50px;
               }

               .calculResult {
                  display: flex;
                  align-items: center;
                  font-size: 13px;
                  .value {
                     margin-right: 1px;
                     font-weight: 900;
                  }

                  .text {
                     margin-left: 2px;
                  }
               }
            }

            .color {
               width: 8px; 
               height: 15px;
               margin-right: 5px;
               border-radius: 3px;
            }
         }

         .detail_container {
            width: 100%;
            height: calc(100% - #{ $titleDateHeight + $gradientContentHeight + $calculContentHeight });
            overflow: auto;
            scroll-behavior: smooth;
         }
      }
   
      .centered {
         width: 100%;
         height: 100%;
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         text-align: center;
      }
   }

</style>