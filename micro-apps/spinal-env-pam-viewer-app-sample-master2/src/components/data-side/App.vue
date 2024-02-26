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
    <div class="dataContainer" v-if="pageSate === PAGE_STATES.loaded">
      <!-- <div class="detail_header">
        <div class="title_date">
          <div class="date" title="recharger"></div>
        </div>
      </div> -->
      <!-- SAMPLE -->
      <!-- <capacityTable  :headers="[{text:'Nom', value: 'name'},{text:'test', value: 'name'},]" :tab="[]"></capacityTable> -->

      <SpinalTable :selectedItemTab="element_clicked" @item-selected="selectDataView"
        @update:selectedItem="handleAttributeChange" @update:selectedAttribute="handleAttributeChange"
        @typeSelected="selectitem"  :headers="[]" :id="0" :label="'test'" :reference="''" :unit="''"
        :contexts="data" :temporality="''" />

      <!-- <div :style="{ 'overflow-y': 'scroll', 'height': 'calc(100% - 200px)' }">
        <div v-for="(d, i) in data" :key="i">{{ d.name }}</div>
        aaa
      </div> -->


      <!-- \SAMPLE -->
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected">
      Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
    </div>

    <!-- <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <v-progress-circular :size="70" :width="3" color="purple" indeterminate></v-progress-circular>
    </div> -->

    <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
      <div>
        <v-icon color="red" style="font-size: 5em">mdi-alert-circle-outline</v-icon>
      </div>
      <div color="red">
        Quelque chose s'est mal passé ! Veuillez
        <v-btn small outlined color="red" @click="retry">réessayer </v-btn>
      </div>
    </div>
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

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  selectedItem2: string;

  async mounted() {
    await this.retriveData();
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;

  }

  toto() {
    console.log('ddddddddddd', this.selected_attr);
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
      this.pageSate = PAGE_STATES.loading;
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

  selectDataView(item) {
    this.$emit("clickOnDataView", item);
  }

  onItemSelected(item) {
    // console.log("Item selected:", item);
    // Traiter l'élément sélectionné comme nécessaire
  }

  updateComponentProp(updatedValue) {
    console.log('avant', this.selectedItem2);

    this.selectedItem2 = updatedValue;
    console.log('aprés', this.selectedItem2);
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
        // Trouver l'attribut de position XYZ
        let xyz = spatial.attributs.find(attr => attr.label === "XYZ center");
        if (xyz) {
          // Extraire les valeurs X, Y, Z
          let [x, y, z] = xyz.value.split(';').map(Number);
          position = { x, y, z };
        }
      }
      if (cate) {
        // Trouver l'attribut de position XYZ
        attrpos = cate.attributs.find(attr => attr.label === emitedInfo.attr);
        console.log(attrpos);
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
    // const buildingId = localStorage.getItem("idBuilding");

    this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
      items: newArray,
      buildingId: this.selectedZone.buildingId || this.selectedZone.staticId,
    });


    // Traiter la nouvelle valeur de l'attribut ici/
  }


  async selectitem(item) {
    console.log('il load au debut ?');

    let actionType = ActionTypes.GET_GROUP_CONTEXT
    let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
      position_type: this.selectedZone,
      // Inclure d'autres propriétés communes si nécessaire
    } as any;
    dispatchObject.forceUpdate = true;

    try {
      this.pageSate = PAGE_STATES.loading;
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


  /**
   * Watch
   */

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
    // Ici, vous pouvez ajouter toute logique supplémentaire nécessaire lorsque 'element_clicked' change
  }

  @Watch("selected_attr")
  @Watch("data")
  watchData() {

    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.isBuildingSelected) return;
    const itemsToColor = this.data[0].data.map((el) => el.children || []).flat();
    let originalArray = this.data[0].data;
    let newArray = originalArray.map(item => {

      // Trouver l'attribut 'Spatial'
      let spatial = item.categoryAttributes.find(cat => cat.name === "Spatial");
      let position;
      if (spatial) {
        // Trouver l'attribut de position XYZ
        let xyz = spatial.attributs.find(attr => attr.label === "XYZ center");
        if (xyz) {
          // Extraire les valeurs X, Y, Z
          let [x, y, z] = xyz.value.split(';').map(Number);
          position = { x, y, z };
        }
      }
      // Retourner le nouvel objet avec position et color
      return { ...item, position: position || null, color: "#0074FF", displayValue: "-", toto: position , attr : this.selected_attr};
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
<style lang="scss"></style>