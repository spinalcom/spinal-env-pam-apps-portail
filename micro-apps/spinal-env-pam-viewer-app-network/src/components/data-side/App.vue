<!-- 
Copyright 2024 SpinalCom - www.spinalcom.com

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
<!-- Ala -->
<template>
  <v-card elevation="4" class="cardContainer">
    <div
      class="dataContainer"
      v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected"
    >
      <button
        @click="
          () => {
            $emit('buttonClicked');
            resize();
          }
        "
        style="
          z-index: 10;
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
        "
        :style="{ left: DActive ? '-35px' : '-20px' }"
      >
        <v-icon v-if="DActive"> mdi-chevron-double-left </v-icon>
        <v-icon v-else-if="ActiveData">mdi-chevron-right</v-icon>
        <v-icon v-else>mdi-chevron-left</v-icon>
      </button>
      <button
        @click="
          () => {
            $emit('buttonClicked3D');
            resize();
          }
        "
        style="
          z-index: 10;
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
        "
        :style="{ left: DActive ? '-35px' : '-20px' }"
      >
        <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
        <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
        <v-icon v-else>mdi-chevron-right</v-icon>
      </button>
      <div class="detail_header">
        <div class="title_date">
          <div class="date" title="recharger"></div>
        </div>
      </div>
      <!-- <button
        @click="
          () => {
            $emit('changeRoute', tickets);
          }
        "
        style="border: 1px solid black; padding: 5px"
      >
        go to tickets apps
      </button>
      <button
        @click="
          () => {
            $emit('changeRoute', insights);
          }
        "
        style="border: 1px solid black; padding: 5px"
      >
        go to insights apps
      </button> -->
      <div
        :style="{
          'overflow-y': 'hidden',
          height: 'calc(100% )',
        }"
        class="data-container"
      >
        <div>
          <NodeItem :data="data" :DActive="DActive" :ActiveData="ActiveData" />
        </div>
      </div>
    </div>

    <div
      class="centered"
      v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected"
    >
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
        <v-icon color="red" style="font-size: 5em"
          >mdi-alert-circle-outline</v-icon
        >
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
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import SpriteComponent from "./SpriteComponent.vue";
import NodeItem from "./NodeItem.vue";
import Filtre from "./Filtres.vue";
import SpriteComponentLuminaire from "./SpriteComponentLuminaire.vue";
import { warn } from "console";

@Component({
  components: { NodeItem, Filtre },
  filters: {},
})
class dataSideApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;
  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  insights =
    "eyJuYW1lIjoiSW5zaWdodHMiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImIwZTEtNzI3NS02YWNhLTE4ZjJlMjE1NmE4IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxNDQ2NTk0NzM4MCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0NDY1ODg3OTEyLCJpY29uIjoibWRpLWN1cnRhaW5zLWNsb3NlZCIsImRlc2NyaXB0aW9uIjoiSU5zaWdodHMiLCJ0YWdzIjpbIkluc2lnaHRzIl0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0taW5zaWdodHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiNTkzMi02MDg2LTllMWEtMTg1MDY0Nzg0NjAifX0";
  tickets: string =
    "eyJuYW1lIjoidHQiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6IjA3M2ItNjBmZi1mYTYzLTE5MDVhMmFkMzhhIiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxOTQ5OTY4Nzg0NCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE5NDk5Njc0NTA2LCJpY29uIjoiIiwiZGVzY3JpcHRpb24iOiIiLCJ0YWdzIjpbXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJtaWNyby1hcHBzLXNwaW5hbC1lbnYtcGFtLXRpY2tldHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiNjEzYS00MWQxLTEyZTItMTkwMzRiYjZlYmIiLCJidWlsZGluZ0lkIjoiYmM5My04ZTA2LWM2YmQtMTkwMzRiY2ZmNTcifX0";

  selectedNodeIndex: number | null = null;
  spriteIds: number[] = [];

  equipementsXYZ: {
    dynamicId: number;
    X: number;
    Y: number;
    Z: number;
    parent?: number;
    typologie?: string;
  }[] = [];
  contextType: "networkTreeContext";
  selectedSprites = [];

  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 1);
  }
  async mounted() {
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;
    // this.retriveData();
  }

  async retriveData() {
    console.log("retriveData", this.selectedZone.name);
    // this.$store.commit(MutationTypes.SET_DATA, []);
    console.log("retriveData data", this.data);
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      const patrimoineId = this.getPatrimoineId();
      const contextId = await this.getContextId(buildingId, patrimoineId);
      const floorData = await this.getFloorData(
        buildingId,
        patrimoineId,
        contextId
      );
      const selectedNodeId = this.getSelectedZoneNodeId(floorData);

      const childrenData = await this.getChildrenByRelation(
        buildingId,
        patrimoineId,
        selectedNodeId
      );

      const luminaireChildren = await this.getLuminaireChildren(
        buildingId,
        patrimoineId,
        childrenData
      );

      const attributesResult = await this.getAttributeList();

      this.equipementsXYZ = this.extractEquipments(attributesResult);

      this.updateLuminaireList(luminaireChildren);

      luminaireChildren.forEach((item) => {
        this.addParentToNodes([item]);
      });

      this.$store.commit(MutationTypes.SET_DATA, luminaireChildren);
      this.pageSate = PAGE_STATES.loaded;
      console.log("retriveData data", this.data);
    } catch (err) {
      console.log(err);
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }

  getPatrimoineId() {
    const patrimoineString = localStorage.getItem("patrimoine");
    return patrimoineString ? JSON.parse(patrimoineString).id : null;
  }

  async getContextId(buildingId: string | null, patrimoineId: any) {
    const contextPromises = [
      this.$store.dispatch(ActionTypes.GET_CONTEXT, {
        buildingId,
        patrimoineId,
      }),
    ];
    const ctxResult = await Promise.all(contextPromises);
    const filteredCtx = ctxResult
      .flat()
      .filter((item: any) => item.type === "networkTreeContext");
    return filteredCtx[0].dynamicId;
  }

  async getFloorData(
    buildingId: string | null,
    patrimoineId: any,
    contextId: number
  ) {
    const floorPromises = [
      this.$store.dispatch(ActionTypes.GET_CHILDREN, {
        buildingId,
        patrimoineId,
        nodeId: contextId,
      }),
    ];
    let floorResult = await Promise.all(floorPromises);
    floorResult = floorResult.flat();
    return floorResult;
  }

  getSelectedZoneNodeId(floorResult: any[]) {
    let nodeId = 0;
    for (let i = 0; i < floorResult.length; i++) {
      if (floorResult[i].name == this.selectedZone.name) {
        nodeId = floorResult[i].dynamicId;
        break;
      }
    }
    return nodeId;
  }

  async getChildrenByRelation(
    buildingId: string | null,
    patrimoineId: any,
    selectedNodeId: number
  ) {
    const relation = "hasNetworkTreeBimObject";
    const automates = [
      this.$store.dispatch(ActionTypes.GET_CHILDREN_BY_RELATION, {
        buildingId,
        patrimoineId,
        nodeId: selectedNodeId,
        relation,
      }),
    ];
    let childrenByRelation = await Promise.all(automates);
    childrenByRelation = childrenByRelation.flat();
    return childrenByRelation;
  }

  async getLuminaireChildren(
    buildingId: string | null,
    patrimoineId: any,
    childrenByRelation: any[]
  ) {
    let childrenIds = childrenByRelation.map((r) => r.dynamicId).flat();
    let parentsIds = childrenByRelation.map((r) => r.dynamicId).flat();
    let relations = childrenIds.map((r) => ({
      dynamicId: r,
      relation: ["hasNetworkTreeBimObject"],
    }));
    const luminaireChildren = [
      this.$store.dispatch(ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE, {
        buildingId,
        patrimoineId,
        relations,
      }),
    ];
    let luminaireChildrenByRelation = await Promise.all(luminaireChildren);
    luminaireChildrenByRelation = luminaireChildrenByRelation.flat();
    luminaireChildrenByRelation.forEach((item) => {
      item.nodes = item.nodes.filter((node) => node.type === "BIMObject");
    });
    childrenIds = [];
    luminaireChildrenByRelation.forEach((lum) => {
      childrenIds = this.collectDynamicIds(lum.nodes, childrenIds);
    });

    this.spriteIds = [...parentsIds, ...childrenIds];
    const childrenMap = new Map(
      childrenByRelation.map((child) => [child.dynamicId, child])
    );
    luminaireChildrenByRelation.forEach((luminaire) => {
      const matchingChild = childrenMap.get(luminaire.dynamicId);
      if (matchingChild) {
        luminaire.name = matchingChild.name;
        luminaire.staticId = matchingChild.staticId;
        luminaire.type = matchingChild.type;
      }
    });
    return luminaireChildrenByRelation;
  }

  async getAttributeList() {
    const attributes = [
      this.$store.dispatch(ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE, {
        buildingId: localStorage.getItem("idBuilding"),
        dynamicIds: this.spriteIds,
      }),
    ];
    const attributesResult = await Promise.all(attributes);
    return attributesResult[0];
  }

  extractEquipments(attributesResult: any[]) {
    return attributesResult.map((r) => {
      const { dynamicId, categoryAttributes } = r;
      let X, Y, Z;
      categoryAttributes.forEach((attribute: any) => {
        if (attribute.name === "Spatial") {
          const [x, y, z] = attribute.attributs[0].value.split(";");
          X = parseFloat(x);
          Y = parseFloat(y);
          Z = parseFloat(z);
        }
      });

      return {
        dynamicId,
        X,
        Y,
        Z,
      };
    });
  }

  updateLuminaireList(luminaireChildrenByRelation: any[]) {
    luminaireChildrenByRelation.forEach((luminaire) =>
      this.updateStatus(luminaire)
    );
  }

  addParentToNodes(nodes: any[], parentId?: number) {
    nodes.forEach((node) => {
      const equipItem = this.equipementsXYZ.find(
        (equip) => equip.dynamicId === node.dynamicId
      );
      if (equipItem) {
        equipItem.parent = parentId;
        equipItem.typologie = node.typologie;
      }

      if (node.nodes && node.nodes.length > 0) {
        this.addParentToNodes(node.nodes, node.dynamicId);
      }
    });
  }

  collectDynamicIds(nodes, collectedIds: number[]) {
    nodes.forEach((node) => {
      if (node.dynamicId !== undefined) {
        collectedIds.push(node.dynamicId);
      }
      if (Array.isArray(node.nodes) && node.nodes.length > 0) {
        this.collectDynamicIds(node.nodes, collectedIds);
      }
    });

    return collectedIds;
  }

  updateStatus(node) {
    if (node.nodes && node.nodes.length > 0) {
      // Recursively update children first
      node.nodes.forEach((child) => this.updateStatus(child));

      const statuses = [
        "active",
        "active",
        "active",
        "active",
        "unknown",
        "inactive",
      ];
      const randomIndex = Math.floor(Math.random() * statuses.length);
      node.self_status = statuses[randomIndex];
      // Determine parent's status based on children's status
      const childrenStatus = node.nodes.map((child) => child.status);
      const hasInactiveChild = childrenStatus.includes("inactive");
      const hasUnkownChild = childrenStatus.includes("unknown");
      const selfStatus =
        node.status === "active" && !hasInactiveChild ? "active" : "inactive";
      if (node.self_status == "inactive" || hasInactiveChild) {
        node.status = "inactive";
      } else if (node.self_status == "unknown" || hasUnkownChild) {
        node.status = "unknown";
      } else {
        node.status = "active";
      }

      // // Update children's self_status
      // node.nodes.forEach((child) => {
      //   child.self_status = selfStatus;
      // });
    } else {
      const statuses = [
        "active",
        "active",
        "active",
        "active",
        "unknown",
        "inactive",
      ];
      const randomIndex = Math.floor(Math.random() * statuses.length);
      node.self_status = statuses[randomIndex];
      node.status = node.self_status;
    }
    const typologies = ["Luminaire", "Automate", "Multisensor"];
    const randomIndex = Math.floor(Math.random() * typologies.length);
    node.typologie = typologies[randomIndex];
  }

  updateSelectedSprites(sprites, number) {
    // Find the index of the number in the list
    const index = sprites.indexOf(number);

    // Check if the number is in the list
    if (index === -1) {
      // Number not in the list, add it
      sprites.push(number);
      console.log(`${number} added to the list.`);
    } else {
      // Number is in the list, remove it
      sprites.splice(index, 1);
      console.log(`${number} removed from the list.`);
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
    this.$store.commit(MutationTypes.SET_DATA, []);
    this.equipementsXYZ = [];
    this.isBuildingSelected = false;
    this.retriveData();
  }

  @Watch("data")
  watchData() {
    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    this.$store.dispatch(ActionTypes.REMOVE_ALL_LINES);
    if (this.isBuildingSelected) return;
    const items = new Array();
    console.log("this data", this.data);
    // const microControllers = automates;
    for (const key of Object.keys(this.equipementsXYZ)) {
      items.push({
        dynamicId: this.equipementsXYZ[key].dynamicId,
        buildingId: localStorage.getItem("idBuilding"),
        data: this.equipementsXYZ[key],
        parent: this.equipementsXYZ[key].parent,
        typologie: this.equipementsXYZ[key].typologie,
        position: new THREE.Vector3(
          this.equipementsXYZ[key].X,
          this.equipementsXYZ[key].Y,
          this.equipementsXYZ[key].Z
        ),
      });
    }
    // const automates = items.slice(0, 6);
    // const luminaires = items.slice(6);

    this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
      items: items.flat(),
      buildingId: localStorage.getItem("idBuilding"),
      component: SpriteComponent,
    });
    const buildingId = localStorage.getItem("idBuilding");
    this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
      items: [],
      buildingId: buildingId || this.selectedZone.staticId,
    });
    return;
    // }
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
  <style lang="scss">
.dataContainer {
  // display: flex;
  height: 100%;
  width: 100%;
  // background: orange;
  font-family: Charlevoix Pro !important;
  // font-size: 13px;
}
.data-container {
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  height: 100%;
  padding: 10px 20px;

  // background: #00a2ff;
}
.graph-inspector {
  margin-top: 25px;
  width: 100%;
  height: 300px;
  background: #222222;
}
</style>