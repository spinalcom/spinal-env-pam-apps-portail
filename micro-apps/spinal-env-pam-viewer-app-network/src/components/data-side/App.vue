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
  <v-card elevation="4" class="cardContainer" style="padding: 0!important;">
    <div class="dataContainer" v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected">
      <button @click="() => {
        $emit('buttonClicked');
        resize();
      }
        " style="
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
        " :style="{ left: DActive ? '-35px' : '-20px' }">
        <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
        <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
        <v-icon v-else>mdi-chevron-right</v-icon>
      </button>
      <!-- <div class="detail_header">
        <div class="title_date">
          <div class="date" title="recharger"></div>
        </div>
      </div> -->
      <!-- //BACKHERE -->
      <div :style="{
        height: 'calc(100% )', display: DActive ? 'none' : 'flex',
      }" class="data-container">
        <!-- <SpinalLoader/>
      <div class="logo-loader"></div> -->
        <NodeItem :data="myowndata" :DActive="DActive" :ActiveData="ActiveData"
          :hardwareContextData="hardwareContextData" :selectedHardwareContext="selectedHardwareContext"
          @updateSelectedHardwareContext="handleSelectedHardwareContextUpdate" :config="config"
          @node-click="callCard" />
        <!-- </div> -->

      </div>
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected">
      Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <!-- <SpinalLoader/>
       <div class="logo-loader"></div> -->
      <v-progress-circular style="margin-bottom: 15px;" :size="70" :width="3" color="#14202c"
        indeterminate></v-progress-circular>
      <p style="margin-top: 10px;">Veuillez patienter pendant le chargement des données !</p>
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
import SpriteCardComponent from "./SpriteCardComponent.vue";
import NodeItem from "./NodeItem.vue";
import SpriteComponentLuminaire from "./SpriteComponentLuminaire.vue";
import { Console, warn } from "console";
import HardwareContext from "./HardwareContext.vue";
import { h } from "vue";
import { config } from "process";
import SpinalLoader from "./SpinalLoader.vue";

@Component({
  components: { NodeItem, HardwareContext, SpriteComponent, SpriteCardComponent, SpinalLoader },
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
  spriteIds: number[] = [];
  myowndata: any[];
  groupes: any[];

  hardwareContextData: any[] = [];
  equipementsXYZ: {
    name?: string;
    dynamicId: number;
    status?: string;
    self_status?: string;
    X: number;
    Y: number;
    Z: number;
    parent?: number;
    typologie?: string;
    endpoints?: any[];
    controlEndpoints?: any[];
  }[] = [];
  selectedHardwareContext: number = 0;

  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 1);
  }
  async mounted() {
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;
    const buildingId = localStorage.getItem("idBuilding");
    const patrimoineId = this.getPatrimoineId();
    await this.getHardwareContextByRelation(
      buildingId,
      patrimoineId,
      this.selectedZone.dynamicId
    );
  }

  handleSelectedHardwareContextUpdate(newDynamicId) {
    this.selectedHardwareContext = newDynamicId;
  }

  async retriveData(selectedId: number) {
    this.myowndata = [];
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      const patrimoineId = this.getPatrimoineId();
      // const contextId = await this.getContextId(buildingId, patrimoineId);
      // const geographicContext = await this.getGeoContextId(
      //   buildingId,
      //   patrimoineId
      // );
      // const floorData = await this.getFloorData(
      //   buildingId,
      //   patrimoineId,
      //   contextId
      // );
      // const selectedNodeId = this.getSelectedZoneNodeId(floorData);
      // const hardwareContextId = await this.getHardwareContextByRelation(
      //   buildingId,
      //   patrimoineId,
      //   this.selectedZone.dynamicId
      // );
      this.groupes = await this.getGroupes(
        buildingId,
        patrimoineId,
        this.config.typologiesSource.context,
        this.config.typologiesSource.category
      );
      const childrenData = await this.getChildrenByRelation(
        buildingId,
        patrimoineId,
        selectedId
      );

      const luminaireChildren = await this.getLuminaireChildren(
        buildingId,
        patrimoineId,
        childrenData
      );


      const attributesResult = await this.getAttributeList();

      const Typologies = await this.getElementTypologie();


      this.equipementsXYZ = this.extractEquipments(attributesResult);
      const parentRooms = await this.getParentRooms(buildingId, patrimoineId, luminaireChildren);

      this.updateLuminaireList(luminaireChildren, Typologies, parentRooms);
      luminaireChildren.forEach((item) => {
        this.addParentToNodes([item]);
      });

      this.$store.commit(MutationTypes.SET_DATA, luminaireChildren);
      this.myowndata = luminaireChildren;
      console.log("Full data", this.myowndata);
      const mergedList = this.mergeAttributesWithHierarchy(
        this.myowndata,
        this.equipementsXYZ
      );
      this.myowndata = mergedList;
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
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
  async getGeoContextId(buildingId: string | null, patrimoineId: any) {
    const contextPromises = [
      this.$store.dispatch(ActionTypes.GET_CONTEXT, {
        buildingId,
        patrimoineId,
      }),
    ];
    const ctxResult = await Promise.all(contextPromises);
    const filteredCtx = ctxResult
      .flat()
      .filter((item: any) => item.type === "geographicContext");
    return filteredCtx;
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

  async getHardwareContextByRelation(
    buildingId: string | null,
    patrimoineId: any,
    selectedNodeId: number
  ) {
    if (selectedNodeId === 0) return;
    //Get hardware contexts for the selected Zone (Floor)
    this.resetContext(buildingId);
    const relation2 = "hasNetworkTree";
    const automates2 = [
      this.$store.dispatch(ActionTypes.GET_CHILDREN_BY_RELATION, {
        buildingId,
        patrimoineId,
        nodeId: selectedNodeId,
        relation: relation2,
      }),
    ];
    let equivalentHardwareContext = await Promise.all(automates2);
    equivalentHardwareContext = equivalentHardwareContext.flat();
    await this.getHDcontexts(
      buildingId,
      patrimoineId,
      equivalentHardwareContext
    );
    if (equivalentHardwareContext.length === 0) {
      return selectedNodeId;
    }
    this.selectedHardwareContext = equivalentHardwareContext[0].dynamicId;
    return equivalentHardwareContext[0].dynamicId;
  }

  async resetContext(buildingId: string | null) {
    this.$store.dispatch(ActionTypes.RESET_API_ITERATOR_STORE, {
      buildingId,
    });
    return;
  }
  async getGroupes(
    buildingId: string | null,
    patrimoineId: any,
    context: string,
    category: string
  ) {
    this.resetContext(buildingId);
    let groupes: any = [];
    groupes = [
      this.$store.dispatch(ActionTypes.GET_GROUPES_CATEGORY, {
        buildingId,
        patrimoineId,
        context: context,
        category: category,
      }),
    ];
    let items = await Promise.all(groupes);
    items = items.flat();
    const filteredNames = items.map((item) => item.name);
    return filteredNames;
  }


  async getChildrenByRelation(
    buildingId: string | null,
    patrimoineId: any,
    selectedNodeId: number
  ) {
    this.resetContext(buildingId);
    const relation = "hasNetworkTreeBimObject";
    let automates: any = [];
    automates = [
      this.$store.dispatch(ActionTypes.GET_CHILDREN_BY_RELATION, {
        buildingId,
        patrimoineId,
        nodeId: selectedNodeId,
        relation: relation,
      }),
    ];
    let childrenByRelation = await Promise.all(automates);
    childrenByRelation = childrenByRelation.flat();
    return childrenByRelation;
  }

  async getHDcontexts(
    buildingId: string | null,
    patrimoineId: any,
    hdNodes: any[]
  ) {
    //Hardware Contexts Names
    this.resetContext(buildingId);
    let childrenIds = hdNodes.map((r) => r.dynamicId).flat();
    let parentsIds = hdNodes.map((r) => r.dynamicId).flat();
    let relations = childrenIds.map((r) => ({
      dynamicId: r,
      relation: ["hasNetworkTreeGroup"],
    }));
    const luminaireChildren = [
      this.$store.dispatch(ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE, {
        buildingId,
        patrimoineId,
        relations: relations,
        size: 200,
      }),
    ];

    let contextParentByRelation = await Promise.all(luminaireChildren);
    contextParentByRelation = contextParentByRelation.flat();
    this.hardwareContextData = contextParentByRelation;
    return contextParentByRelation;
  }

  async getLuminaireChildren(
    buildingId: string | null,
    patrimoineId: any,
    childrenByRelation: any[]
  ) {
    this.resetContext(buildingId);
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
        relations: relations,
        size: 200,
      }),
    ];
    let luminaireChildrenByRelation = await Promise.all(luminaireChildren);
    luminaireChildrenByRelation = luminaireChildrenByRelation.flat();
    luminaireChildrenByRelation.forEach((item) => {
      if (Array.isArray(item.nodes)) {
        item.nodes = item.nodes.filter((node) => node.type === "BIMObject");
      } else {
        console.warn("item.nodes is not an array or is undefined", item);
      }
    });

    childrenIds = [];
    luminaireChildrenByRelation.forEach((lum) => {
      if (Array.isArray(lum.nodes)) {
        childrenIds = this.collectDynamicIds(lum.nodes, childrenIds);
      } else {
        console.warn("lum.nodes is not an array or is undefined", lum);
      }
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
  async getParentRooms(
    buildingId: string | null,
    patrimoineId: any,
    nodes: any[]
  ) {
    this.resetContext(buildingId);

    // Helper function to recursively collect dynamicIds
    const getAllDynamicIds = (nodes) => {
      let ids = [];

      nodes.forEach((node) => {
        // Collect the dynamicId of the current node
        if (node.dynamicId) {
          ids.push(node.dynamicId);
        }

        // If the node has children, recursively collect their ids
        if (node.nodes && Array.isArray(node.nodes)) {
          ids = ids.concat(getAllDynamicIds(node.nodes));
        }
      });

      return ids;
    };

    // Get all dynamic IDs recursively from the nodes and their children
    const ids = getAllDynamicIds(nodes);

    // Dispatch the action with the collected ids
    const parentRoomspromises = [
      this.$store.dispatch(ActionTypes.GET_POSITION_MULTIPLE, {
        buildingId,
        patrimoineId,
        ids: ids,
        size: 200,
      }),
    ];

    // Wait for all promises to resolve
    let parentRooms = await Promise.all(parentRoomspromises);
    console.log("parentRooms", parentRooms);

    // Flatten the result (since you're using Promise.all with arrays)
    parentRooms = parentRooms.flat();
    return parentRooms;
  }



  async getElementTypologie() {
    const buildingId = localStorage.getItem("idBuilding");
    this.resetContext(buildingId);
    const attributes = [
      this.$store.dispatch(ActionTypes.READ_STATIC_DETAILS_MULTIPLE, {
        buildingId: localStorage.getItem("idBuilding"),
        dynamicIds: this.spriteIds,
        size: 200,
      }),
    ];
    const attributesResult = await Promise.all(attributes);
    return attributesResult[0];
  }

  async getAttributeList() {
    const buildingId = localStorage.getItem("idBuilding");
    this.resetContext(buildingId);
    const attributes = [
      this.$store.dispatch(ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE, {
        buildingId: localStorage.getItem("idBuilding"),
        dynamicIds: this.spriteIds,
        size: 200,
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
          // const [x, y, z] = attribute.attributs[0].value.split(";");
          // X = parseFloat(x);
          // Y = parseFloat(y);
          // Z = parseFloat(z);
          const xyzAttribute = attribute.attributs.find(
            (attr) => attr.label === "XYZ center"
          );

          if (xyzAttribute) {
            const [x, y, z] = xyzAttribute.value.split(";");
            X = parseFloat(x);
            Y = parseFloat(y);
            Z = parseFloat(z);
          }
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

  updateLuminaireList(
    luminaireChildrenByRelation: any[],
    typologiesList: any[],
    roomParentList: any[]
  ) {

    luminaireChildrenByRelation.forEach((luminaire) =>
      this.updateStatus(luminaire, typologiesList, roomParentList)
    );
  }

  addParentToNodes(nodes: any[], parentId?: number) {
    nodes.forEach((node) => {
      const equipItem = this.equipementsXYZ.find(
        (equip) => equip.dynamicId === node.dynamicId
      );
      if (equipItem) {
        equipItem.name = node.name;
        equipItem.status = node.status;
        equipItem.self_status = node.self_status;
        equipItem.parent = parentId;
        equipItem.typologie = node.typologie;
        equipItem.endpoints = node.endpoints;
        equipItem.controlEndpoints = node.controlEndpoints;
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
  mergeAttributesWithHierarchy(statique, equipementsXYZ) {
    // Helper function to find an item in the statique list by dynamicId
    const findStatiqueItemById = (id) =>
      statique.find((item) => item.dynamicId === id);

    // Helper function to recursively merge attributes
    function mergeNode(node) {
      const { dynamicId } = node;
      const equip = equipementsXYZ.find((e) => e.dynamicId === dynamicId);

      // Merge attributes
      const mergedNode = {
        ...node,
        position: equip
          ? new THREE.Vector3(equip.X, equip.Y, equip.Z)
          : undefined,
        endpoints: node.endpoints || [],
        controlEndpoints: node.controlEndpoints || [],
      };

      // Recursively merge children nodes
      if (mergedNode.nodes && Array.isArray(mergedNode.nodes)) {
        mergedNode.nodes = mergedNode.nodes.map(mergeNode);
      }

      return mergedNode;
    }

    // Start merging from the top-level nodes
    return statique.map(mergeNode);
  }

  updateStatus(node, typologiesList: any[], roomParentList: any[]) {
    if (node.nodes && node.nodes.length > 0) {
      // Recursively update children first
      node.nodes.forEach((child) => this.updateStatus(child, typologiesList, roomParentList));
      console.log("node.......................................", node);
      // Random Status //TODO: Remove this
      const statuses = [
        "active",
        "active",
        "active",
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

      const matchingStatus = typologiesList.find(
        (typology) => typology.dynamicId === node.dynamicId
      );
      if (matchingStatus) {
        node.endpoints = matchingStatus.endpoints;
        node.controlEndpoints = matchingStatus.controlEndpoints;
        // let value = matchingStatus.endpoints[1].value;
        let value = true;
        if (value) {
          // node.self_status = "active";
        } else {
          // node.self_status = "inactive";
        }
        // node.self_status = matchingStatus.endpoints[1].value;
      }
      // Determine parent's status based on children's status
      // const childrenStatus = node.nodes.map((child) => child.status);
      // const hasInactiveChild = childrenStatus.includes("inactive");
      // const hasUnkownChild = childrenStatus.includes("unknown");
      // const selfStatus =
      //   node.status === "active" && !hasInactiveChild ? "active" : "inactive";
      // if (node.self_status == "inactive" || hasInactiveChild) {
      //   node.status = "inactive";
      // } else if (node.self_status == "unknown" || hasUnkownChild) {
      //   node.status = "unknown";
      // } else {
      //   node.status = "active";
      // }

      // Update children's self_status
      // node.nodes.forEach((child) => {
      //   child.self_status = selfStatus;
      // });
    } else {
      console.log("node.......................................2222222222222222222222222222222222", node);
      // Random Status //TODO: Remove this
      const statuses = [
        "active",
        "active",
        "active",
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
      // End Random Status//



      const matchingStatus = typologiesList.find(
        (typology) => typology.dynamicId === node.dynamicId
      );
      console.log("matchingStatus", matchingStatus);
      if (matchingStatus) {
        node.endpoints = matchingStatus.endpoints;
        node.controlEndpoints = matchingStatus.controlEndpoints;
        if (matchingStatus.endpoints.length > 0) {
          if (this.config.source[0].name === matchingStatus.endpoints[1].name) {
            // let value = matchingStatus.endpoints[1].value;
            let value = true;
            if (value) {
              // node.self_status = "active";
            } else {
              // node.self_status = "inactive";
            }
          } else {
            // node.self_status = "inactive";
          }
        } else {
          // node.self_status = "inactive";
        }

        // let value = matchingStatus.endpoints[1].value;
        // if (value) {
        //   node.self_status = "active";
        // } else {
        //   node.self_status = "inactive";
        // }
        // node.self_status = matchingStatus.endpoints[1].value;
      }
      // node.status = node.self_status;
    }

    const matchingTypology = typologiesList.find(
      (typology) => typology.dynamicId === node.dynamicId
    );
    if (matchingTypology) {
      const exists = this.groupes.includes(matchingTypology.group);
      if (!exists) {
        node.typologie = "Inconnue";
      } else {
        node.typologie = matchingTypology.group;
      }
    }
    const matchingRoom = roomParentList.find(
      (room) => room.dynamicId === node.dynamicId
    );
    if (matchingRoom) {
      node.room = matchingRoom.room.room;
      node.roomname = matchingRoom.room.room.name;
    }
  }

  /**
   * Watch
   */

  @Watch("selectedHardwareContext")
  watchSelectedHardwareContext() {
    if (this.selectedZone.type === "building") {
      this.isBuildingSelected = true;
      return;
    }
    this.isBuildingSelected = false;
    this.myowndata = [];
    this.retriveData(this.selectedHardwareContext);
  }

  @Watch("selectedZone")
  async watchSelectedZone() {
    if (this.selectedZone.type === "building") {
      this.isBuildingSelected = true;
      return;
    }
    this.isBuildingSelected = false;
    this.myowndata = [];
    const buildingId = localStorage.getItem("idBuilding");
    const patrimoineId = this.getPatrimoineId();
    const hardwareContextId = await this.getHardwareContextByRelation(
      buildingId,
      patrimoineId,
      this.selectedZone.dynamicId
    );
  }

  callCard(items: any[]) {
    this.$store.dispatch(ActionTypes.REMOVE_CARDS);
    this.$store.dispatch(ActionTypes.ADD_CARD_COMPONENT, {
      items: items.flat(),
      buildingId: localStorage.getItem("idBuilding"),
      component: SpriteCardComponent,
    });
    // this.$store.dispatch(ActionTypes.REMOVE_ALL_LINES);
    return;
  }

  @Watch("data")
  async watchData() {
    console.log("watchData");
    this.$store.dispatch(ActionTypes.REMOVE_ALL_LINES);
    // if (this.config.sprites) {
    this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    // }
    if (this.isBuildingSelected) return;
    const items = new Array();
    for (const key of Object.keys(this.equipementsXYZ)) {
      items.push({
        dynamicId: this.equipementsXYZ[key].dynamicId,
        buildingId: localStorage.getItem("idBuilding"),
        data: this.equipementsXYZ[key],
        parent: this.equipementsXYZ[key].parent,
        typologie: this.equipementsXYZ[key].typologie,
        endpoints: this.equipementsXYZ[key].endpoints,
        name: this.equipementsXYZ[key].name,
        status: this.equipementsXYZ[key].status,
        self_status: this.equipementsXYZ[key].self_status,
        imageMapping: this.config.imageMapping,
        position: new THREE.Vector3(
          this.equipementsXYZ[key].X,
          this.equipementsXYZ[key].Y,
          this.equipementsXYZ[key].Z
        ),
      });
    }

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
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
<style lang="scss">
.dataContainer {
  height: 100%;
  width: 100%;
  font-family: charlevoix, sans-serif !important;
}

.data-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 15px;
}

.graph-inspector {
  margin-top: 25px;
  width: 100%;
  height: 300px;
  background: #222222;
}

.logo-loader {
  background-color: aqua;
  width: 40%;
  height: 50px;
}

.centered {
  height: 100%;
  width: 100%;
  // background-color: #222222;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>