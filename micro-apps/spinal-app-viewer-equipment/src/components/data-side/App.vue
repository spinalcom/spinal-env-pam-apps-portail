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
    <button @click="() => {
        $emit('buttonClicked');
        resize();
      }
      " style="
          position: absolute;
          top: 47.5%;
          left: -20px;
          background-color: white;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 5px;
          border-left: 2px solid gainsboro;
          
        " :style="{ left: DActive ? '-35px' : '-20px' }">
      <v-icon v-if="DActive"> mdi-chevron-double-left </v-icon>
      <v-icon v-else-if="ActiveData">mdi-chevron-right</v-icon>
      <v-icon v-else>mdi-chevron-left</v-icon>
    </button>
    <button @click="() => {
        $emit('buttonClicked3D');
        resize();
      }
      " style="
          position: absolute;
          top: 52.5%;
          background-color: white;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 5px;
          border-left: 2px solid gainsboro;
          
        " :style="{ left: DActive ? '-35px' : '-20px' }">
      <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
      <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
      <v-icon v-else>mdi-chevron-right</v-icon>
    </button>
    <div class="dataContainer" >
      <SpinalTable class="entrence" :class="{ 'inactiveTable': DActive, 'displaydataCss': displaydata }"
        :selectedItemTab="element_clicked"
        @item-selected="selectDataView"
        @fit-to-view="fitToView"
        @unselect-data-view="unselectDataView"
        @allFiltredData="putAllFiltredData"
        @update:selectedItem="handleAttributeChange" @updateSuccess="retriveData"
        @update:selectedAttribute="handleAttributeChange" :headers="[]" :id="0" :label="'test'" :reference="''"
        :unit="''" :contexts="tableData" :temporality="''" :ctx_list="$store.state.appDataStore.user_selection_list.ctx"
        :cat_list="$store.state.appDataStore.user_selection_list.cat"
        :grp_list="$store.state.appDataStore.user_selection_list.grp" 
        :ActiveData="ActiveData" :DActive="DActive"
        @itemSelected="handleItemSelected"
        @buttonClicked="buttonClicked"
        
        />

    </div>

  </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
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
import { get } from "http";

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
  @Prop() tableData: any;
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
  displaydata: boolean = false


  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }
  
  buttonClicked(payload) {
    console.log("buttonClicked payload", payload);
    this.$emit('buttonClicked', payload);
  }

  async mounted() {
    localStorage.setItem("viewer_loaded", 'initialize');
    //await this.retriveData();
    // -> update contexts
    await this.getAndUpdateEquipmentContexts();
    await this.updateTableData();
    

    //- Set Data to contexts




    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;

  }

  // double = computed(() => count.value * 2)

  async handleItemSelected(payload) {
    if(payload.listType == "ctx" && !payload.value) {
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "ctx", value: null });
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "cat", value: null });
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "grp", value: null });
      await this.getAndUpdateEquipmentContexts();
      await this.updateTableData();
      return;
    }

    if (payload.listType == "ctx") {
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "ctx", value: payload.value.name });
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "cat", value: null });
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "grp", value: null });
      await this.getAndUpdateEquipmentCategories();
      await this.updateTableData();
      return;
    }

    if (payload.listType == "cat") {
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "cat", value: payload.value.name });
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "grp", value: null });
      await this.getAndUpdateEquipmentGroups();
      await this.updateTableData();
      return;
    }

    if (payload.listType == "grp"){
      this.$store.commit(MutationTypes.SET_USER_SELECTED, { key: "grp", value: payload.value.name });
      await this.getAndUpdateEquipmentList();
      await this.updateTableData();


      if(!payload.value) {
        // Load all equipments of category
        await this.retriveData(true);
        return;
      }
    }
    await this.retriveData();
  }

  async retriveData(getAllCategoryEquipments = false) {
    let actionType = ActionTypes.GET_GROUP_CONTEXT
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      position_type: this.selectedZone,
      getAllCategoryEquipments : getAllCategoryEquipments
    } as any;
    dispatchObject.forceUpdate = true;

    try {
      const result = await this.$store.dispatch(actionType, dispatchObject)
      this.$store.commit(MutationTypes.SET_DATA, result.data);
      console.log(result.data)

      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }

  

  async getAndUpdateEquipmentContexts(){
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id
    } as any;
    dispatchObject.forceUpdate = true;

    try {
      const result = await this.$store.dispatch(ActionTypes.GET_EQUIPMENTS_GROUP, dispatchObject);
      this.$store.commit(MutationTypes.SET_USER_SELECTION, { "ctx": result });
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.getAndUpdateEquipmentContexts;
      this.pageSate = PAGE_STATES.error;
    }
  }

  async updateTableData(){
    if (!this.$store.state.appDataStore.user_selected.ctx) {
      let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      nodeIds: this.$store.state.appDataStore.user_selection_list.ctx.map(ctx => ctx.dynamicId),
      includeChildrenRelations : true,
      includeParentRelations : false
    } as any;
    dispatchObject.forceUpdate = true;
      const result = await this.$store.dispatch(ActionTypes.READ_NODE_MULTIPLE, dispatchObject);
      const futurData = this.$store.state.appDataStore.user_selection_list.ctx.map(ctx => {
        const read = result.find((node) => node.dynamicId === ctx.dynamicId);
        const hasCategoryRelation = read.children_relation_list.find(relation => relation.name === "hasCategory")
        return { ...ctx, nbr_categories: hasCategoryRelation.children_number }
      })
      console.log('***updateTableData', result);
      this.$store.commit(MutationTypes.SET_DATA, futurData);
      return;
    }

    if (!this.$store.state.appDataStore.user_selected.cat) {
      let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      nodeIds: this.$store.state.appDataStore.user_selection_list.cat.map(cat => cat.dynamicId),
      includeChildrenRelations : true,
      includeParentRelations : false
    } as any;
    dispatchObject.forceUpdate = true;
      const result = await this.$store.dispatch(ActionTypes.READ_NODE_MULTIPLE, dispatchObject);
      const futurData = this.$store.state.appDataStore.user_selection_list.cat.map(cat => {
        const read = result.find((node) => node.dynamicId === cat.dynamicId);
        const hasGroupRelation = read.children_relation_list.find(relation => relation.name === "hasGroup")
        return { ...cat, nbr_groups: hasGroupRelation.children_number }
      })
      console.log('***updateTableData', result);
      this.$store.commit(MutationTypes.SET_DATA, futurData);
      return;
    }

    if (!this.$store.state.appDataStore.user_selected.grp) {
      let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      nodeIds: this.$store.state.appDataStore.user_selection_list.grp.map(grp => grp.dynamicId),
      includeChildrenRelations : true,
      includeParentRelations : false
    } as any;
    dispatchObject.forceUpdate = true;
      const result = await this.$store.dispatch(ActionTypes.READ_NODE_MULTIPLE, dispatchObject);
      const futurData = this.$store.state.appDataStore.user_selection_list.grp.map(grp => {
        const read = result.find((node) => node.dynamicId === grp.dynamicId);
        const hasBimObjectRelation = read.children_relation_list.find(relation => relation.name === "groupHasBIMObject")
        return { ...grp, nbr_equipments: hasBimObjectRelation.children_number }
      })
      console.log('***updateTableData', result);
      this.$store.commit(MutationTypes.SET_DATA, futurData);
      return;
    }

    

  }

  async getAndUpdateEquipmentCategories(){
    const matchingContext = this.$store.state.appDataStore.user_selection_list.ctx.find(ctx => ctx.name === this.$store.state.appDataStore.user_selected.ctx);
    let actionType = ActionTypes.GET_CATEGORY_LIST
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      contextDynId: matchingContext.dynamicId
    } as any;
    dispatchObject.forceUpdate = true;

    try {
      const result = await this.$store.dispatch(actionType, dispatchObject);
      this.$store.commit(MutationTypes.SET_USER_SELECTION, {...this.$store.state.appDataStore.user_selection_list, "cat": result });

      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.getAndUpdateEquipmentCategories;
      this.pageSate = PAGE_STATES.error;
    }

  }

  async getAndUpdateEquipmentGroups(){
    const matchingContext = this.$store.state.appDataStore.user_selection_list.ctx.find(ctx => ctx.name === this.$store.state.appDataStore.user_selected.ctx);
    const matchingCategory = this.$store.state.appDataStore.user_selection_list.cat.find(cat => cat.name === this.$store.state.appDataStore.user_selected.cat);
    let actionType = ActionTypes.GET_GROUP_LIST
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      contextDynId: matchingContext.dynamicId,
      categoryDynId: matchingCategory.dynamicId
    } as any;
    dispatchObject.forceUpdate = true;

    try {
      const result = await this.$store.dispatch(actionType, dispatchObject);
      this.$store.commit(MutationTypes.SET_USER_SELECTION, {...this.$store.state.appDataStore.user_selection_list, "grp": result });

      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.getAndUpdateEquipmentGroups;
      this.pageSate = PAGE_STATES.error;
    }

  }

  async getAndUpdateEquipmentList(){
    const matchingContext = this.$store.state.appDataStore.user_selection_list.ctx.find(ctx => ctx.name === this.$store.state.appDataStore.user_selected.ctx);
    const matchingCategory = this.$store.state.appDataStore.user_selection_list.cat.find(cat => cat.name === this.$store.state.appDataStore.user_selected.cat);
    const matchingGroup = this.$store.state.appDataStore.user_selection_list.grp.find(grp => grp.name === this.$store.state.appDataStore.user_selected.grp);
    let actionType = ActionTypes.GET_EQUIPEMENT_LIST;
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      contextDynId: matchingContext.dynamicId,
      categoryDynId: matchingCategory.dynamicId,
      groupDynId: matchingGroup.dynamicId

    } as any;
    dispatchObject.forceUpdate = true;

    try {
      const result = await this.$store.dispatch(actionType, dispatchObject);
      this.$store.commit(MutationTypes.SET_DATA, result);
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.getAndUpdateEquipmentList;
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
  unselectDataView(items){
    this.$emit("unselect-data-view",items);
  }
  fitToView(item){
    this.$emit("fit-to-view", item);
  }


  updateComponentProp(updatedValue) {
    this.selectedItem2 = updatedValue;
  }

  handleAttributeChange(emitedInfo) {
    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.isBuildingSelected) return;
    const itemsToColor = this.tableData.map((el) => el.children || []).flat();
    let originalArray = this.tableData;
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


  }





  /**
   * Watch
   */


  @Watch('DActive')
  onDActivate(newVal, oldVal) {

    if (newVal == true) {
      setTimeout(() => {
        this.displaydata = true;
      }, 500);
    }
    this.displaydata = false;
  }

  @Watch('selected_attr')
  onSelectedAttrChange(newVal, oldVal) {
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
    }
    else {
      this.isBuildingSelected = false;
    }
    const shouldGetAllEquipments = !this.$store.state.appDataStore.user_selected.grp;
    this.retriveData(shouldGetAllEquipments);
  }

  @Watch('element_clicked', { immediate: true, deep: true })
  onElementClickedChange(newVal, oldVal) {
    this.updateComponentProp(newVal);
  }

  async watchData(newVal, changedProperty) {
    if(!this.$store.state.appDataStore.user_selected.ctx ||
      !this.$store.state.appDataStore.user_selected.cat ||
      !this.$store.state.appDataStore.user_selected.grp
    ) return;
    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    //if (this.isBuildingSelected) return; // If building is selected don't add sprites

    let itemsToColor, originalArray;

    if (changedProperty === 'AllFiltredData') {
      originalArray = newVal;
    } else {
      originalArray = this.$store.state.appDataStore.data;
    }

    // originalArray = this.$store.state.appDataStore.data;
    console.log('originalArray', originalArray);

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
      return { ...item, position: position || null, displayValue: "-", toto: position, attr: this.selected_attr };
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
.cardContainer {
  padding: 10px;
}

.dataContainer {
  overflow: hidden;
  width: 100% !important
}

.displaydataCss {
  display: none;
}

.entrence {
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


.inactiveTable {
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