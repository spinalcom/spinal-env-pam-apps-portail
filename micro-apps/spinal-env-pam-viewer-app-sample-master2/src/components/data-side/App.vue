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
    <button @click="$emit('buttonClicked')"
      style="position: absolute;top: 47.5%;left:-20px;background-color: white;border-radius: 10px;width: 30px;height: 30px;display: flex;justify-content: center;align-items: center;padding-right: 5px;border-left: 2px solid gainsboro;">
      <div v-if="DActive"><<</div>
      <div v-else-if="ActiveData">></div>
      <div v-else><</div>
    </button>
        <button @click="() => { $emit('buttonClicked3D'); test(); }"
          style="position: absolute;top: 52.5%;left:-20px;background-color: white;border-radius: 10px;width: 30px;height: 30px;display: flex;justify-content: center;align-items: center;padding-right: 5px;border-left: 2px solid gainsboro;">
          <div v-if="ActiveData">>></div>
          <div v-else-if="DActive"><</div>
      <div v-else>></div>
        </button>
        <div class="dataContainer" v-if="1 === 1">
          <!-- <div class="detail_header">
        <div class="title_date">
          <div class="date" title="recharger"></div>
        </div>
      </div> -->
          <!-- SAMPLE -->
          <!-- <capacityTable  :headers="[{text:'Nom', value: 'name'},{text:'test', value: 'name'},]" :tab="[]"></capacityTable> -->

          <SpinalTable class="entrence" :class="{ 'inactiveTable': DActive , 'displaydataCss' : displaydata}" :selectedItemTab="element_clicked" @item-selected="selectDataView"
            @allFiltredData="putAllFiltredData" @update:selectedItem="handleAttributeChange"
            @update:selectedAttribute="handleAttributeChange" :headers="[]" :id="0" :label="'test'" :reference="''"
            :unit="''" :contexts="data" :temporality="''" :ctx_list="$store.state.appDataStore.user_selection_list.ctx"
            :cat_list="$store.state.appDataStore.user_selection_list.cat"
            :grp_list="$store.state.appDataStore.user_selection_list.grp" @itemSelected="handleItemSelected" />

          <!-- <div :style="{ 'overflow-y': 'scroll', 'height': 'calc(100% - 200px)' }">
        <div v-for="(d, i) in data" :key="i">{{ d.name }}</div>
        aaa
      </div> -->


          <!-- \SAMPLE -->
        </div>

        <!-- <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected">
      Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
    </div> -->

        <!-- <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <v-progress-circular :size="70" :width="3" color="purple" indeterminate></v-progress-circular>
    </div> -->

        <!-- <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
      <div>
        <v-icon color="red" style="font-size: 5em">mdi-alert-circle-outline</v-icon>
      </div>
      <div color="red">
        Quelque chose s'est mal passé ! Veuillez
        <v-btn small outlined color="red" @click="retry">réessayer </v-btn>
      </div>
    </div> -->
  </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
// import CapacityTable from "../../components/component-test/CapacityTable.vue";
import SpinalTable from "../../components/component-test/SpinalTable.vue"
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import SpriteComponent from "./SpriteComponent.vue"
import { WASI } from "wasi";

@Component({
  components: {
    // CapacityTable,
    SpinalTable
  },
  filters: {},
})
class dataSideApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop() element_clicked: any;
  @Prop() selected_attr: any;
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  selectedItem2: string;
  allFilteredData: any;
  CurrentLoading: boolean;
  displaydata : boolean = false

  test(){
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1); 
  }

  async mounted() {
    await this.retriveData();
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;

  }

  async handleItemSelected(payload) {

    if (payload.listType == "ctx")
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "ctx", value: payload.value.name });
    if (payload.listType == "cat")
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "cat", value: payload.value.name });
    if (payload.listType == "grp")
      // payload.value.forEach(element => {
      //   this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "grp", value: element});
      // });

      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "grp", value: payload.value });



    await this.retriveData();
  }

  async retriveData() {

   
    

    // try {
    //   this.pageSate = PAGE_STATES.loading;

    //   const buildingId = localStorage.getItem("idBuilding");
    //   const patrimoineId = JSON.parse(localStorage.getItem("patrimoine")).id;
    //   const promises = [
    //     this.$store.dispatch(ActionTypes.GET_ROOMS, {
    //       buildingId,
    //       patrimoineId,
    //       floorId: this.selectedZone.staticId,
    //       id: this.selectedZone.dynamicId,
    //     }),
    //   ];
    //   const result = await Promise.all(promises);

    //   this.$store.commit(MutationTypes.SET_DATA, result[0]);
    //   this.pageSate = PAGE_STATES.loaded;
    // } catch (err) {
    //   console.log(err);
    //   this.retry = this.retriveData;
    //   this.pageSate = PAGE_STATES.error;
    // }



    //Test equipement grp

    let actionType = ActionTypes.GET_GROUP_CONTEXT
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      position_type: this.selectedZone,
      // Inclure d'autres propriétés communes si nécessaire
    } as any;
    dispatchObject.forceUpdate = true;

    try {
      // this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      const patrimoineId = JSON.parse(localStorage.getItem("patrimoine")).id;
      const promises = [
        this.$store.dispatch(actionType, dispatchObject),
      ];
      const result = await Promise.all(promises);
      this.$store.commit(MutationTypes.SET_DATA, result);
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }

  async putAllFiltredData(allFilteredData) {
    this.allFilteredData = allFilteredData
    setTimeout(() => {
      this.watchData(allFilteredData, 'AllFiltredData');
  }, 1);
    
  }

  selectDataView(item) {
    this.$emit("clickOnDataView", item);
  }

  onItemSelected(item) {
    // console.log("Item selected:", item);
    // Traiter l'élément sélectionné comme nécessaire
  }

  updateComponentProp(updatedValue) {
    this.selectedItem2 = updatedValue;
  }

  handleAttributeChange(emitedInfo) {



    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.isBuildingSelected) return;
    const itemsToColor = this.data[0].data.map((el) => el.children || []).flat();
    let originalArray = this.data[0].data;
    let newArray = originalArray.map(item => {
      // Trouver l'attribut 'Spatial'
      let cate = item.categoryAttributes.find(cat => cat.name === emitedInfo.cate);
      let spatial = item.categoryAttributes.find(cat => cat.name === "Spatial");
      let position;
      let attrpos
      if (spatial) {
        let xyz = spatial.attributs.find(attr => attr.label === "XYZ center");
        if (xyz) {
          let [x, y, z] = xyz.value.split(';').map(Number);
          position = { x, y, z };
        }
      }
      if (cate) {
        attrpos = cate.attributs.find(attr => attr.label === emitedInfo.attr);
      }

      if (emitedInfo.item == attrpos.value) {
        return { ...item, position: position || null, color: "red", displayValue: "-", toto: attrpos.value };
      }
      // Retourner le nouvel objet avec position et color
      return { ...item, position: position || null, color: "#0074FF", displayValue: "-", toto: attrpos.value, attr: this.selected_attr };
    });

    if (this.config.sprites) {
      this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
        items: newArray,
        buildingId: this.selectedZone.buildingId || this.selectedZone.staticId,
        component: SpriteComponent,
      });
      return;
    }
    this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
      items: newArray,
      buildingId: this.selectedZone.buildingId || this.selectedZone.staticId,
    });


    // Traiter la nouvelle valeur de l'attribut ici/
  }


  // async selectitem(item) {
  //   console.warn('il load au debut ?');

  //   let actionType = ActionTypes.GET_GROUP_CONTEXT
  //   let dispatchObject = {
  //     buildingId: localStorage.getItem("idBuilding"),
  //     patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
  //     position_type: this.selectedZone,
  //     // Inclure d'autres propriétés communes si nécessaire
  //   } as any;
  //   dispatchObject.forceUpdate = true;

  //   try {
  //     this.pageSate = PAGE_STATES.loading;
  //     const buildingId = localStorage.getItem("idBuilding");
  //     const patrimoineId = JSON.parse(localStorage.getItem("patrimoine")).id;
  //     const promises = [
  //       this.$store.dispatch(actionType, dispatchObject),

  //     ];
  //     const result = await Promise.all(promises);
  //     this.$store.commit(MutationTypes.SET_DATA, result);


  //     this.pageSate = PAGE_STATES.loaded;

  //   } catch (err) {
  //     console.log(err);
  //     this.retry = this.retriveData;
  //     this.pageSate = PAGE_STATES.error;
  //   }
  // }


  /**
   * Watch
   */
  //watch les click d'attr


  @Watch('DActive')
  onDActivate(newVal, oldVal){

    if(newVal == true){
      setTimeout(() => {
    this.displaydata = true; 
    }, 500);
    }
    this.displaydata = false;
  }

  @Watch('selected_attr')
  onSelectedAttrChange(newVal, oldVal) {
    console.log('selected attr ???');
    if (this.allFilteredData) {
      this.watchData(this.allFilteredData, 'AllFiltredData');
    } else
      this.watchData(newVal, 'selected_attr');
  }

  @Watch("selectedZone")
  watchSelectedZone() {
    if (this.selectedZone.type === "building") {
      this.isBuildingSelected = true;
      this.$store.commit(MutationTypes.SET_DATA, []);
      return;
    }

    this.isBuildingSelected = false;
    this.retriveData();
  }

  @Watch('element_clicked', { immediate: true, deep: true })
  onElementClickedChange(newVal, oldVal) {
    this.updateComponentProp(newVal);
  }


  // @Watch('data')
  // onDataChange(newVal, oldVal) {
    // console.log('watch data de log');
  // }



  async watchData(newVal, changedProperty) {

    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.isBuildingSelected) return;

    let itemsToColor, originalArray;

    if (changedProperty === 'AllFiltredData') {
      originalArray = newVal;
    } else {
      originalArray = this.data[0].data;
    }

    itemsToColor = originalArray.map((el) => el.children || []).flat();
    let newArray = originalArray.map(item => {
      // La logique reste la même
      let spatial = item.categoryAttributes.find(cat => cat.name === "Spatial");
      let position;
      if (spatial) {
        let xyz = spatial.attributs.find(attr => attr.label === "XYZ center");
        if (xyz) {
          let [x, y, z] = xyz.value.split(';').map(Number);
          position = { x, y, z };
        }
      }
      return { ...item, position: position || null, color: "#0074FF", displayValue: "-", toto: position, attr: this.selected_attr };
    });

    if (this.config.sprites) {
      this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
        items: newArray,
        buildingId: this.selectedZone.buildingId || this.selectedZone.staticId,
        component: SpriteComponent,
      });
      return;
    }
    // const buildingId = localStorage.getItem("idBuilding");

    this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
      items: newArray,
      buildingId: this.selectedZone.buildingId || this.selectedZone.staticId,
    });
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
<style lang="scss">
.dataContainer {
  overflow: hidden;

}

.entrence{
  -webkit-animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
	        animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;

}
@-webkit-keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}


.displaydataCss{
  display: none;
}
.inactiveTable{
  
  -webkit-animation: fade-out 0.3s ease-out both;
	        animation: fade-out 0.3s ease-out both;
  }

  @-webkit-keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

</style>