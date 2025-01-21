<template>
  <div class="dataTable">
    <div
      class="selection"
      @click="handleClick(data.dynamicId)"
      :class="{
        selected: isSelected && level === 0,
        'child-selected': isSelected && level === 1,
        'child-child-selected': isSelected && level === 2,
        'child-child-child-selected': isSelected && level === 3,
        // boderSel: leafChild,
        boderSel: data.dynamicId === internalSelectedDynamicId,
        'child-row': level > 0,
        'child-row2': level > 1,
        'child-row3': level > 2,
      }"
    >
      <td class="name">
        <div
          class="name-image"
          :class="{
            'name-image-selected': isSelected,
            'name-image-deselected': !isSelected,
            hide_arrow: !data.nodes,
          }"
          :style="{ marginLeft: `${level * 15}px` }"
        ></div>
        {{ data.dynamicId }}
      </td>

      <td class="type">
        <div
          class="typologie"
          :style="{ backgroundImage: `url(${dataImageUrl})` }"
        ></div>
        {{ data.typologie }}
      </td>
      <!-- :style="{
            backgroundImage: `url(${require(`../viewer/assets/Automate.png`)})`,
          }" -->

      <td class="nb">
        <div v-if="!data.nodes">00</div>
        <div v-if="data.nodes && data.nodes.length <= 9">
          0{{ data.nodes.length }}
        </div>
        <div v-if="data.nodes && data.nodes.length >= 10">
          {{ data.nodes.length }}
        </div>
      </td>
      <td class="status">
        <div class="status-circle-container">
          <div
            class="status-circle"
            :class="{
              'circle-status-active': data.status === 'active',
              'circle-status-inactive': data.status === 'inactive',
              'circle-status-unknown': data.status === 'unknown',
            }"
          ></div>
          <div class="circle-container">
            <div
              class="outer-circle"
              :class="{
                'status-active': data.status === 'active',
                'status-inactive': data.status === 'inactive',
                'status-unknown': data.status === 'unknown',
              }"
            >
              <div
                class="inner-circle"
                :class="{
                  'status-active': data.status === 'active',
                  'status-inactive': data.status === 'inactive',
                  'status-unknown': data.status === 'unknown',
                }"
              >
                {{ data.status }}
              </div>
            </div>
          </div>
        </div>
      </td>
    </div>
    <template v-if="showChildren">
      <TableRow
        v-for="(child, childIndex) in data.nodes"
        :key="childIndex"
        :data="child"
        :fulldata="fulldata"
        :index="childIndex"
        :level="level + 1"
        :pairs="pairs"
        :selectedDynamicId="selectedDynamicId"
        @highlightSelection="highlightSelection"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component, Watch } from "vue-property-decorator";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { IPlayload } from "../viewer";
import { EventBus } from "./EventBus";
import store from "./tableIds";
import { IConfig } from "../../interfaces/IConfig";
import axios from "axios";

@Component({
  name: "TableRow",
})
class TableRow extends Vue {
  @Prop() data;
  @Prop() config!: IConfig;
  @Prop() pairs: any[];
  @Prop() index!: number;
  @Prop({ default: 0 }) level!: number;
  @Prop() selectedDynamicId!: number;
  @Prop() fulldata!: any[];

  internalSelectedDynamicId: number = 0;

  @Watch("selectedDynamicId")
  onSelectedDynamicIdChange(newVal: number) {
    // if (this.isSelected) {
    this.internalSelectedDynamicId = newVal;
    // }
    // console.log("SelectedDynamicId", newVal);
    // console.log("isSelected", this.isSelected);
    // this.internalSelectedDynamicId = newVal;
  }
  dataImageUrl: string = "";

  async getImageUrl(typologie: string): Promise<string> {
    // const imageMapping: { [key: string]: string } = {
    //   Luminaire: require("../viewer/assets/Luminaire.png"),
    //   Automate: require("../viewer/assets/Automate.png"),
    //   Multicapteurs: require("../viewer/assets/Multicapteurs.png"),
    //   Climatiseur: require("../viewer/assets/Climatiseur.png"),
    // };
    const imageMapping = this.config.imageMapping;

    const defaultImagePath = require("../viewer/assets/default.png");

    // Check if the typology exists in the mapping
    if (imageMapping.hasOwnProperty(typologie)) {
      return imageMapping[typologie];
    }

    // If not found in mapping, return default
    console.warn(
      `Image not found for typology ${typologie}, using default image.`
    );
    return defaultImagePath;
  }

  // async getImageUrl(typologie: string): Promise<string> {
  //   console.log("typo00", typologie);
  //   const dynamicImagePath = `../viewer/assets/${typologie}.png`;
  //   console.log("Dynamic Image Path", dynamicImagePath);

  //   const defaultImagePath = require(`../viewer/assets/Luminaire.png`);

  //   try {
  //     // Using import() for dynamic imports
  //     const dynamicImageModule = await import(dynamicImagePath);
  //     return dynamicImageModule.default;
  //   } catch (error) {
  //     console.warn("Dynamic image not found, using default image.");
  //     return defaultImagePath;
  //   }
  // }

  // object de type Ipayload
  payload: IPlayload[] = [
    // {
    //   id: "138401808",
    //   dynamicId: 138401808,
    //   staticId: "SpinalNode-1e4a279e-7a36-8adb-fc40-82d5d8d0e4ca-186e4d833cd",
    //   buildingId: "5932-6086-9e1a-18506478460",
    //   floorId: "94457248",
    // },
    // {
    //   id: "138280976",
    //   dynamicId: 138280976,
    //   staticId: "SpinalNode-9c000ce3-3fb9-6f14-303f-23dc1854b543-187a0b0d166",
    //   buildingId: "5932-6086-9e1a-18506478460",
    //   floorId: "94457248",
    // },
  ];
  payloadout: IPlayload[] = [
    {
      id: "0",
      dynamicId: 0,
      staticId: "SpinalNode-9c000ce3-3fb9-6f14-303f-23dc1854b543-187a0b0d166",
      buildingId: "5932-6086-9e1a-18506478460",
      floorId: "94457248",
    },
  ];

  showChildren: boolean = false;
  selectedNodeIndex: number | null = null;
  nodestoToggle: number[] = [];

  isSelected: boolean = false;
  parentOpened: boolean = false;
  leafChild: boolean = false;
  openall: boolean = true;

  highlightSelection(dynamicId: number) {
    // this.onSelectedDynamicIdChange(dynamicId);
    EventBus.$emit("highlight-selection", dynamicId);
  }
  handleClick(dynamicId: number) {
    // this.highlightSelection(dynamicId);
    let listofselected = this.$store.state.appDataStore.selectedEquipements;
    if (this.internalSelectedDynamicId === dynamicId) {
      this.internalSelectedDynamicId = 0;
    } else {
      let pp = false;
      for (let i = 0; i < listofselected.length; i++) {
        if (listofselected[i] === dynamicId) {
          pp = true;
        }
      }
      if (!pp) {
        this.internalSelectedDynamicId = dynamicId;
        this.highlightSelection(dynamicId);
      } else {
        this.internalSelectedDynamicId = 0;
      }
    }

    if (!this.isSelected) {
      for (let i = 0; i < listofselected.length; i++) {
        if (listofselected[i] === this.findParent(dynamicId)) {
          this.parentOpened = true;
        }
      }
      if (!this.parentOpened) {
        EventBus.$emit("diselect");
        // this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
        let listofselected = this.$store.state.appDataStore.selectedEquipements;
      }
    }

    this.toggleChildren(dynamicId);
    EventBus.$emit("on-node-click", dynamicId);
  }
  findParent(dynamicId: number): number {
    const pair = this.pairs.find((pair) => pair.child === dynamicId);
    if (pair) {
      return pair.parent;
    } else {
      return -1;
    }
  }
  NodesTotoggle(dynamicId: number) {
    this.nodestoToggle.push(dynamicId);
    while (this.findParent(dynamicId) !== -1) {
      dynamicId = this.findParent(dynamicId);
      this.nodestoToggle.push(dynamicId);
    }
  }
  toggleChildren(dynamicId: number) {
    if (this.data.nodes && this.data.nodes.length > 0) {
      this.showChildren = !this.showChildren;
      this.isSelected = this.showChildren;
      this.$store.commit(MutationTypes.ADD_SELECTED_EQUIPEMENT, dynamicId);
      if (this.showChildren) {
        this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
          String(this.data.dynamicId),
        ]);
        this.getZoomPoints();
        this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, this.payload);
      } else {
        this.$store.dispatch(ActionTypes.DESELECT_LINE, [
          String(this.data.dynamicId),
        ]);
        this.$store.dispatch(ActionTypes.DESELECT_SPRITE, [
          String(this.data.dynamicId),
        ]);
        this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS);
      }
    } else {
      this.isSelected = !this.isSelected;
      // if (this.leafChild) {
      // this.leafChild = !this.leafChild;
      // }
      // console.log("Else");
      if (this.isSelected) {
        this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
          String(this.data.dynamicId),
        ]);
        this.getZoomPoints();

        // EventBus.$emit("on-node-click", this.data.dynamicId);
        this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, this.payload);
      }
    }
  }

  async handleClick2(dynamicId: number) {
    let listofselected = this.$store.state.appDataStore.selectedEquipements;
    console.log("Clicked Node", dynamicId);
    let path = this.findPath(this.fulldata, dynamicId);
    // console.log("Path", path);
    const topLevelNodes = this.getTopLevelNodes(this.fulldata);
    for (let i = 0; i < topLevelNodes.length; i++) {
      if (dynamicId == topLevelNodes[i]) {
        await EventBus.$emit("deselect-all", dynamicId);
      }
    }
    if (this.internalSelectedDynamicId === dynamicId) {
      this.internalSelectedDynamicId = 0;
    } else {
      let pp = false;
      for (let i = 0; i < listofselected.length; i++) {
        if (listofselected[i] === dynamicId) {
          pp = true;
        }
      }
      if (!pp) {
        this.internalSelectedDynamicId = dynamicId;
        this.highlightSelection(dynamicId);
      } else {
        this.internalSelectedDynamicId = 0;
      }
    }

    if (path[0] == dynamicId) {
      // console.log("Selected Dynamic Id");
      if (!this.showChildren) {
        await EventBus.$emit("deselect-all", dynamicId);
        this.openall = false;
      }
    }
    // console.log("Open all", openall);
    console.log("Path", path, "listofselected", listofselected);
    for (let i = 0; i < listofselected.length; i++) {
      for (let j = 0; j < path.length; j++) {
        if (listofselected[i] === path[j]) {
          this.openall = false;
        }
      }
    }

    console.log("Open allstooooooooooooooooor", listofselected);
    if (this.openall && path.length > 1) {
      console.log("L3ziiiiiiiiiiiiiiiz");
      // this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
      // console.log("L3ziiiiiiiiiiiiiiiz");
      for (let i = 0; i < path.length; i++) {
        this.toggleChildrenOut(path[i]);
        console.log("L3ziwz", path[i]);
      }
    } else {
      console.log("L3ziwz");
      this.toggleChildrenOut(dynamicId);
      this.openall = true;
    }
  }
  findPath(data, targetId) {
    const path = [];

    function helper(nodes) {
      if (!Array.isArray(nodes)) return false; // Check if nodes is an array
      for (let node of nodes) {
        path.push(node.dynamicId);
        if (node.dynamicId === targetId) {
          return true;
        }
        if (node.nodes && helper(node.nodes)) {
          return true;
        }
        path.pop(); // Remove the node if targetId not found in this branch
      }
      return false;
    }

    helper(data);
    return path;
  }

  getTopLevelNodes(data) {
    return data.map((node) => node.dynamicId);
  }

  async toggleChildrenOut(dynamicId: number) {
    console.log("this dynamicId inside", this.data.dynamicId);
    if (this.data.dynamicId != dynamicId) {
      let listofselected = this.$store.state.appDataStore.selectedEquipements;
      for (let i = 0; i < listofselected.length; i++) {
        if (listofselected[i] === this.findParent(dynamicId)) {
          this.parentOpened = true;
        }
      }
      if (!this.parentOpened) {
        // this.diselect();
        // EventBus.$emit("diselect-out", dynamicId);
        // this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
        // let listofselected = this.$store.state.appDataStore.selectedEquipements;
      }
    } else if (this.data.dynamicId == dynamicId) {
      console.log("this dynamicId equals the old one ");
      if (this.data.nodes && this.data.nodes.length > 0) {
        console.log("type 1");
        this.showChildren = !this.showChildren;
        this.isSelected = this.showChildren;
        // this.$store.commit(MutationTypes.ADD_SELECTED_EQUIPEMENT, dynamicId);
        if (this.showChildren) {
          console.log("type 1.1");
          // this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
          this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
            String(this.data.dynamicId),
          ]);
          this.getZoomPoints();
          // this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, this.payload);
        } else {
          console.log("type 1.2");
          this.$store.dispatch(ActionTypes.DESELECT_LINE, [
            String(this.data.dynamicId),
          ]);
          this.$store.dispatch(ActionTypes.DESELECT_SPRITE, [
            String(this.data.dynamicId),
          ]);

          this.getZoomPoints();
          this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS);
        }
        console.log("type 1 end");
        // this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
        this.$store.commit(MutationTypes.ADD_SELECTED_EQUIPEMENT, dynamicId);
      } else {
        console.log("type 2 start");
        this.isSelected = !this.isSelected;
        // this.leafChild = !this.leafChild;

        console.log("Else");
        if (this.isSelected) {
          this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
            String(this.data.dynamicId),
          ]);

          this.getZoomPoints();

          // this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, this.payload);
          console.log("cleaning");
          this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
        }
      }
    }
  }
  deselectNode2() {
    this.showChildren = false;
    this.isSelected = false;
  }
  deselectAllNodes() {
    this.isSelected = false;
    this.showChildren = false;
  }
  getZoomPoints() {
    this.payload.push({
      id: this.data.dynamicId.toString(),
      dynamicId: this.data.dynamicId,
      staticId: this.data.staticId,
      buildingId: "5932-6086-9e1a-18506478460",
      floorId: "94457248",
    });
    if (this.data.nodes && this.data.nodes.length > 0) {
      for (let i = 0; i < this.data.nodes.length; i++) {
        this.payload.push({
          id: this.data.nodes[i].dynamicId.toString(),
          dynamicId: this.data.nodes[i].dynamicId,
          staticId: this.data.nodes[i].staticId,
          buildingId: "5932-6086-9e1a-18506478460",
          floorId: "94457248",
        });
      }
    }
  }

  diselect(dynamicId: number) {
    // this.isSelected = false;
    // this.showChildren = false;
    let listofselected = this.$store.state.appDataStore.selectedEquipements;
    // console.log("Diselect List of selected", listofselected);
    // console.log("Diselect clicked node", dynamicId);
    // for (let i = 0; i < listofselected.length; i++) {
    //   if (listofselected[i] === this.findParent(dynamicId)) {
    //     this.parentOpened = true;
    //   }
    // }

    let n = 1;

    for (
      let i = listofselected.length - 1;
      i >= listofselected.length - n;
      i--
    ) {
      if (listofselected[i] === this.findParent(dynamicId)) {
        this.parentOpened = true;
        break;
      }
    }
    // console.log(
    //   "Diselect nodes to close",
    //   listofselected[listofselected.length - n - 1]
    // );
    // console.log("----------------Diselect out----------------");
    // if (!this.parentOpened) {
    // }
    if (this.data.dynamicId != dynamicId && !this.parentOpened) {
      if (this.data.nodes && this.data.nodes.length > 0) {
        // console.log("Diselect", this.showChildren, this.data.dynamicId);
        if (this.showChildren) {
          this.showChildren = !this.showChildren;
          // this.showChildren = false;
          this.isSelected = this.showChildren;
        }
      } else {
        this.isSelected = false;
        this.showChildren = false;
      }
      // this.$store.commit(MutationTypes.RESET_EQUIPEMENT);
    }
    // console.log("Diselect E,ND", this.showChildren);
  }

  async mounted() {
    this.internalSelectedDynamicId = this.selectedDynamicId;
    this.dataImageUrl = await this.getImageUrl(this.data.typologie);
    EventBus.$on("toggle-children", this.handleClick2);
    EventBus.$on("diselect", this.deselectNode2);
    EventBus.$on("diselect-out", this.diselect);
    EventBus.$on("deselect-all", this.deselectAllNodes);
    EventBus.$on("highlight-selection", (dynamicId: number) => {
      this.selectedDynamicId = dynamicId;
    });
    // console.log("Mounted", this.data);
  }
  beforeDestroy() {
    EventBus.$off("toggle-children", this.handleClick2);
    EventBus.$off("diselect", this.deselectNode2);
    EventBus.$off("diselect-out", this.diselect);
    EventBus.$off("deselect-all", this.deselectAllNodes);
    // EventBus.$off("highlight-selection");
  }
}

export default TableRow;
</script>

<style scoped>
.dataTable .name {
  width: 50%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
  padding: 12px 0px;
  padding-left: 1%;
}
.dataTable .type {
  width: 26%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
  padding: 12px 0px;
}
.dataTable .nb {
  width: 12%;

  padding: 12px 0px;
}
.name-image {
  width: 18px;
  height: 18px;
  background-image: url("./assets/right-blue.svg");
  margin-right: 5px;
  background-size: contain;
  background-repeat: no-repeat;
}
.name-image-selected {
  transform: rotate(90deg);
}
.name-image-deselected {
  transform: rotate(0deg);
}
.dataTable .status {
  width: 12%;
  display: flex;
  flex-direction: row;
  justify-content: center;

  padding: 12px 0px;
  padding-right: 1%;
  /* margin-top: 8px; */
  /* align-items: center; */
}
.selection {
  display: flex;
  flex-direction: row;
  cursor: pointer;
}
.unselected {
  background-color: transparent;
}
.selected {
  background-color: #d1d4db;
}
.boderSel {
  border: 2px solid blue;
}
.hide_arrow {
  opacity: 0;
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

.child-selected {
  background-color: rgba(23, 126, 137, 0.6);
}
.child-child-selected {
  background-color: rgba(23, 126, 137, 0.4);
}
.child-child-child-selected {
  background-color: rgba(23, 126, 137, 0.2);
}
.child-row {
  background-color: #e5e6eb;
}
.child-row2 {
  background-color: #f3f4f6;
}
.child-row3 {
  background-color: #f9fafb;
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
.boderSel {
  border: 2px solid blue;
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
</style>
