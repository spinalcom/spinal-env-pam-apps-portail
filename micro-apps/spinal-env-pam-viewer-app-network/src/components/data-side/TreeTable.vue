<template>
  <div>
    <div class="header">
      <div class="header-equipement">
        Equipement

        <div class="search-bar">
          <div class="search-image"></div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher"
            @input="filterNodes"
          />
        </div>
      </div>
      <div class="header-typologie">Typologie</div>
      <div class="header-reseau">Réseaux</div>
      <div class="header-status">Status</div>
    </div>
    <div class="tree-container table-scroll">
      <div
        v-for="node in flattenedData"
        :key="node.dynamicId"
        @click="handleNodeClick(node, 0)"
      >
        <div
          class="node"
          :class="{
            node_clicked: node.dynamicId == lastClickedNodeDynamicId,
            displayNone: !shouldDisplayNode(node),
            node_clicked_pack:
              node.parentDynamicId == lastClickedNodeDynamicId ||
              node.dynamicId == lastClickedNodeDynamicId,
          }"
        >
          <div class="node-name">
            <div
              class="name-image"
              :class="{
                'name-image-selected': shouldDisplayArrow(node),
                'name-image-deselected': !shouldDisplayArrow(node),
                hide_arrow: !node.hasNodes,
              }"
              :style="{ marginLeft: `${node.level * 12}px` }"
            ></div>
            <div class="node-name-text">
              {{ node.name }}
            </div>
          </div>
          <div class="node-type">
            <div
              class="typologie"
              :style="{
                backgroundImage: `url(${getImageUrl(String(node.typologie))})`,
              }"
            ></div>
            {{ node.typologie }}
          </div>
          <div class="node-num">
            {{ node.numNodes }}
          </div>
          <div class="node-status">
            <div class="status-circle-container">
              <div
                class="status-circle"
                :class="{
                  'circle-status-active': node.status === 'active',
                  'circle-status-inactive': node.status === 'inactive',
                  'circle-status-unknown': node.status === 'unknown',
                }"
              ></div>
              <div class="circle-container">
                <div
                  class="outer-circle"
                  :class="{
                    'status-active': node.status === 'active',
                    'status-inactive': node.status === 'inactive',
                    'status-unknown': node.status === 'unknown',
                  }"
                >
                  <div
                    class="inner-circle"
                    :class="{
                      'status-active': node.status === 'active',
                      'status-inactive': node.status === 'inactive',
                      'status-unknown': node.status === 'unknown',
                    }"
                  >
                    {{ node.status }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from "vue-property-decorator";
import { IConfig } from "../../interfaces/IConfig";

import { EventBus } from "./EventBus";

import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { SpriteCardComponent } from "./SpriteCardComponent";

interface Node {
  dynamicId: number | null;
  level: number;
  name: string;
  parentDynamicId: number | null;
  self_status: string;
  staticId: string;
  status: string;
  type: string;
  typologie: string;
  nodes?: Node[];
  position?: THREE.Vector3;
  endpoints?: any[];
  controlEndpoints?: any[];
}

interface FlattenedNode {
  dynamicId: number | null;
  level: number;
  name: string;
  parentDynamicId: number | null;
  self_status: string;
  staticId: string;
  status: string;
  type: string;
  typologie: string;
  hasNodes?: boolean;
  numNodes?: number;
  position?: THREE.Vector3;
  endpoints?: any[];
  controlEndpoints?: any[];
}

@Component({
  name: "TreeTable",
  components: { SpriteCardComponent },
})
class TreeTable extends Vue {
  @Prop() data!: any[];
  @Prop() config!: IConfig;
  flattenedData: FlattenedNode[] = [];
  flattenedDataBackup: FlattenedNode[] = [];

  expandedNodes: number[] = [];
  lastClickedNode: FlattenedNode | null = null;
  lastClickedNodeDynamicId: number = 0;
  displayNode: number | null = null;
  searchQuery: string = "";

  async mounted() {
    this.addLevels(this.data);
    this.flattenedData = this.flattenData(this.data);
    this.flattenedDataBackup = [...this.flattenedData];
    console.log("Received", this.config);
    console.log("Flattened", this.flattenedData);
    EventBus.$on("table-node-click", this.handleNodeClick);
  }
  beforeDestroy() {
    EventBus.$off("table-node-click", this.handleNodeClick);
  }
  filterNodes() {
    const query = this.searchQuery.toLowerCase();
    this.flattenedData = this.flattenedDataBackup.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.typologie.toLowerCase().includes(query)
    );
  }
  watch: {
    searchQuery: "filterNodes";
  };

  addLevels(data, currentLevel = 0, parentDynamicId = null) {
    data.forEach((item) => {
      item.level = currentLevel;
      item.parentDynamicId = parentDynamicId;

      if (item.nodes && Array.isArray(item.nodes)) {
        this.addLevels(item.nodes, currentLevel + 1, item.dynamicId);
      }
    });
  }

  flattenData(data: Node[]): FlattenedNode[] {
    const result: FlattenedNode[] = [];
    // console.log("Flattening data", data);
    function traverse(node: Node) {
      result.push({
        dynamicId: node.dynamicId,
        level: node.level,
        name: node.name,
        parentDynamicId: node.parentDynamicId,
        self_status: node.self_status,
        staticId: node.staticId,
        status: node.status,
        type: node.type,
        typologie: node.typologie,
        hasNodes: node.nodes && node.nodes.length > 0,
        numNodes: node.nodes ? node.nodes.length : 0,
        position: node.position,
        endpoints: node.endpoints,
        controlEndpoints: node.controlEndpoints,
      });

      if (Array.isArray(node.nodes)) {
        node.nodes.forEach((childNode) => traverse(childNode));
      }
    }

    data.forEach((item) => traverse(item));

    return result;
  }

  handleNodeClick(node: FlattenedNode, type: number) {
    if (type === 0) {
      this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
        String(node.dynamicId),
      ]);
      EventBus.$emit("on-node-click", node.dynamicId);
    }
    if (type === 1) {
      this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
        String(node.dynamicId),
      ]);
    } else if (type === 2) {
      this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
        String(node.dynamicId),
      ]);
      EventBus.$emit("on-node-click", node.dynamicId);
    }
    this.lastClickedNode = node;
    this.lastClickedNodeDynamicId = node.dynamicId ?? 0;
    this.displayNode = node.dynamicId;
    this.expandedNodes = this.pathToNode(node.dynamicId);
    this.showCard(node);
  }

  shouldDisplayNode(node: FlattenedNode): boolean {
    // Always show level 0 nodes
    if (node.level === 0) {
      return true;
    }

    for (const nodeId of Array.isArray(this.expandedNodes)
      ? this.expandedNodes
      : []) {
      if (node.dynamicId === nodeId) {
        if (
          node.dynamicId === this.expandedNodes[this.expandedNodes.length - 1]
        ) {
          // console.log("recmiclecd");
          return true;
        }
        return true;
      }
    }

    // for (const nodeId of Array.isArray(this.expandedNodes)
    //   ? this.expandedNodes
    //   : []) {
    //   if (node.dynamicId === nodeId) {
    //     return true;
    //   }
    // }

    //Showing siblings of previous opened nodes
    const isInList = this.expandedNodes.includes(node.parentDynamicId ?? -1);

    if (node.level === this.getNodeLevel(this.displayNode) && isInList) {
      return true;
    }

    // console.log("Path to node:", this.expandedNodes);

    // Show children of the clicked node and the clicked node itself
    if (this.displayNode !== null) {
      return (
        node.level === this.getNodeLevel(this.displayNode) + 1 &&
        node.parentDynamicId === this.displayNode
      );
    }

    // Hide all other nodes if no node is clicked
    return false;
  }

  getNodeLevel(nodeId: number | null): number {
    // Find the level of the node with the given ID
    const node = this.flattenedData.find((n) => n.dynamicId === nodeId);
    return node ? node.level : -1;
  }
  pathToNode(nodeId: number | null): number[] {
    const path: number[] = [];
    let currentNodeId = nodeId;

    while (currentNodeId !== null) {
      path.unshift(currentNodeId);
      const node = this.flattenedData.find(
        (n) => n.dynamicId === currentNodeId
      );
      currentNodeId = node ? node.parentDynamicId : null;
    }

    return path;
  }
  shouldDisplayArrow(node: FlattenedNode): boolean {
    for (const nodeId of Array.isArray(this.expandedNodes)
      ? this.expandedNodes
      : []) {
      if (node.dynamicId === nodeId && node.hasNodes) {
        return true;
      }
    }
    return false;
  }

  getImageUrl(typologie: string): string {
    const imageMapping = this.config.imageMapping;
    const defaultImagePath = require("../viewer/assets/default.png");
    if (imageMapping.hasOwnProperty(typologie)) {
      return imageMapping[typologie];
    }
    // If not found in mapping, return default
    console.warn(
      `Image not found for typology ${typologie}, using default image.`
    );
    return defaultImagePath;
  }
  showCard(node: FlattenedNode) {
    console.log("showCard", node);
    const items = new Array();
    items.push({
      dynamicId: node.dynamicId,
      buildingId: localStorage.getItem("idBuilding"),
      data: node,
      parent: node.parentDynamicId,
      typologie: node.typologie,
      name: node.name,
      status: node.status,
      self_status: node.self_status,
      position: node.position,
      endpoints: node.endpoints,
      controlEndpoints: node.controlEndpoints,
    });
    const item = items[0];

    console.log("showCard", items);
    this.$emit("node-click", items);
  }
}

export default TreeTable;
</script>


<style scoped>
.tree-container {
  font-family: Arial, sans-serif;
  border: #14202c18 1px solid;
}

/* Scroll & Scroller */
.table-scroll {
  height: 62vh;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}
::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Track background */
  border-radius: 10px; /* Rounded corners on the track */
}

::-webkit-scrollbar-thumb {
  background: #14202c; /* Scrollbar color */
  border-radius: 10px; /* Rounded corners on the scrollbar */
}

::-webkit-scrollbar-thumb:hover {
  background: #181d49; /* Scrollbar color on hover */
}
* {
  scrollbar-width: thin; /* Make scrollbar thinner */
  scrollbar-color: #888 #f1f1f1; /* Scrollbar thumb and track colors */
}

/* Header Style */

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 13px 10px;
  font-size: 0.9rem;
  background: #14202c;
  color: white;
  font-weight: bold;
  font-family: charlevoix, sans-serif !important;
  margin-bottom: -1px;
}
.header-equipement {
  width: 45%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
.header-typologie {
  width: 30%;
}
.header-reseau {
  width: 15%;
}
.header-status {
  width: 10%;
  display: flex;
  justify-content: center;
}

.node {
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding: 11px 5px;
  border-bottom: 1px solid #14202c20;
  cursor: pointer;
  font-size: 0.82rem;
}
.node_clicked {
  border: 1px solid #14202c;
  background: #14202c10;
  /* border-radius: 0px 1px 1px 0px; */
}
.node_clicked_pack {
  border-left: 3px solid #14202c;
}

.node-content {
  padding: 5px;
  background-color: #f9f9f9;
  /* border-radius: 4px; */
}

.node-content {
  transition: height 0.3s ease-out, opacity 0.3s ease-out;
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, height 0.3s ease;
}

.slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-active in <2.1.8 */ {
  opacity: 0;
  height: 0;
}

.node:hover {
  background-color: #eaeaea;
}

.children {
  padding-left: 20px;
}

.name-image {
  width: 18px;
  height: 18px;
  background-image: url("./assets/right-blue.svg");
  margin-right: 5px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  /* background: red; */
}
.name-image-selected {
  transform: rotate(90deg);
}
.name-image-deselected {
  transform: rotate(0deg);
}
.hide_arrow {
  opacity: 0.3;
  transform: rotate(0deg);
}
.node-name {
  width: 45%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
.node-name-text {
  width: 95%;
}
.node-type {
  width: 30%;
  display: flex;
  align-items: center;
  justify-content: start;
}
.typologie {
  width: 15px;
  height: 15px;
  /* margin-top: 5px; */
  /* border-radius: 50%; */
  display: inline-block;
  margin-right: 5px;
  /* background-color: #325e4b; */
  /* background-image: url("../viewer/assets/lamp.png"); */
  background-size: contain;
}
.node-num {
  width: 15%;
  display: flex;
  align-items: center;
  justify-content: start;
}
.node-status {
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-status-active {
  border-color: #325e4b;
  background-color: #325e4b;
}

.circle-status-inactive {
  border-color: #d7270c;
  background-color: #d7270c;
}
.circle-status-unknown {
  border-color: #f49700;
  background-color: #f49700;
}

.status-circle {
  height: 25px;
  width: 9px;
  border-radius: 1rem;
}
.status-circle-container {
  position: relative;
  display: inline-block;
}

.circle-container {
  display: none;
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  margin-right: 2px;
  /* border-radius: 5px; */
  z-index: 10; /* Ensure it appears above other elements */
}

.status-circle:hover + .circle-container {
  display: block;
}
.displayNone {
  display: none;
}
.search-bar {
  /* padding: 10px; */
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
}

.search-bar input {
  width: 75%;
  padding: 6px;
  font-size: 0.9rem;
  color: white;
  border-radius: 4px;
}
.search-image {
  width: 25px;
  height: 25px;
  background-image: url("./assets/magnify.svg");
  margin-right: 0px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  /* background: #325e4b; */
}
</style>
