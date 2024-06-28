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
  <v-card elevation="4" class="cardContainer data-side">
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
    <div v-if="selectedEntities.length > 0">
      <div v-for="entitie in selectedEntities" :key="entitie.dynamicId">
        <div @click="selectEntity(entitie)" class="entitie">{{ entitie.name }}</div>
      </div>
    </div>
    <div class="dataContainer" v-else-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected">
      <div class="detail_header">
        <div class="title_date">
          <div class="date" title="recharger"></div>
        </div>
      </div>
      <!-- SAMPLE -->
      <div :style="{ 'overflow-y': 'scroll', 'height': 'calc(100% - 200px)' }">
        <div v-for="(d, i) in data" :key="i">
          <div @click="selectEntity(d)" class="entitie">{{ d.name }}</div>
        </div>
      </div>
      <!-- \SAMPLE -->
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected">
      Aucune donnée à afficher ! Veuillez selectionner un étage.
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <v-progress-circular :size="70" :width="3" color="purple" indeterminate></v-progress-circular>
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
      <div>
        <v-icon color="red" style="font-size: 5em">mdi-alert-circle-outline</v-icon>
      </div>
      <div color="red">
        Quelque chose s'est mal passé ! Veuillez
        <v-btn small outlined color="red" @click="retry">réessayer </v-btn>
      </div>
    </div>

    <div class="expander-wrapper">
      <slot name="expander"></slot>
    </div>
    <slot name="body"></slot>
  </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import SpriteComponent from "./SpriteComponent.vue"
import { IRoom } from "@/interfaces";
import { Emit } from "vue-property-decorator";
import { ViewerManager } from "../viewer";

@Component({
  components: {},
  filters: {},
})
class dataSideApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop({ default: [] }) selectedEntities: IRoom[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  viewManager: ViewerManager;

  async mounted() {
    // await this.retriveData();
    this.pageSate = PAGE_STATES.loaded;
    this.viewManager = ViewerManager.getInstance()
    this.isBuildingSelected = true;
  }
  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }

  async retriveData() {
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding") ?? '';
      const patrimoineId = buildingId;
      const promises = [
        this.$store.dispatch(ActionTypes.GET_ROOMS, {
          buildingId,
          patrimoineId,
          floorId: this.selectedZone.staticId,
          id: this.selectedZone.dynamicId,
        }),
      ];
      const result = await Promise.all(promises);
      this.$store.commit(MutationTypes.SET_DATA, result[0]);
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

  @Emit()
  selectEntity(room: any) {
    this.$emit('selectEntity', room)
    this.viewManager.select(room)
    this.viewManager.colorItems(room, localStorage.getItem("idBuilding") ?? '')
    return room
  }

  @Watch('selectedEntities')
  WatchSelectedEntitie() {
    //console.log('SelectedEntitie = ', this.selectedEntities)
  }

  @Watch("data")
  watchData() {
    // console.log(this.data);
    // console.log("AFFICHAGE SPRITES");
    // if (this.config.sprites)
    //   this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);

    // if (this.isBuildingSelected) return;


    // if (this.config.sprites) {
    //   this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
    //     items: [],
    //     buildingId: undefined,
    //     component: SpriteComponent,
    //   });
    //   return;
    // }
    // const buildingId = localStorage.getItem("idBuilding");

    // this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
    //   items: [],
    //   buildingId: buildingId || this.selectedZone.staticId,
    // });
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
<style lang="scss">
.entitie {
  text-align: center;
  transition: all 0.1s ease;

  &:active {
    transform: scale(1.1);
  }
}

.data-side {
  position: relative;
}

.expander-wrapper {
  position: absolute;
  z-index: inherit;
  top: calc(40vh);
  left: -1em;
}
</style>